#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const INGREDIENTS = [
  { name: "Moringa", slug: "moringa", category: "Herbal Extracts" },
  { name: "Licorice Extract", slug: "licorice-extract", category: "Herbal Extracts" },
  { name: "Nettle Root", slug: "nettle-root", category: "Herbal Extracts" },
  { name: "Pygeum", slug: "pygeum", category: "Herbal Extracts" },
];

function parseEnvLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

async function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.resolve(process.cwd(), file);

    if (!existsSync(envPath)) {
      continue;
    }

    const contents = await readFile(envPath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);

      if (!parsed) {
        continue;
      }

      const [key, value] = parsed;

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

function normalizeSupabaseUrl(value) {
  return value.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

function createBlankIngredientPayload(ingredient) {
  const now = new Date().toISOString();

  return {
    name: ingredient.name,
    slug: ingredient.slug,
    status: "published",
    ingredient_category: ingredient.category,
    short_description: null,
    full_description: null,
    scientific_name: null,
    overview_content: null,
    how_it_works_content: null,
    interesting_fact: null,
    typical_dose: null,
    dosage: null,
    dosage_content: null,
    benefits_json: [],
    side_effects_json: [],
    drug_interactions_json: [],
    who_should_avoid_json: [],
    faq_json: [],
    related_ingredients_json: [],
    sidebar_quick_facts_json: [],
    seo_title: null,
    seo_description: null,
    seo_canonical_url: null,
    seo_noindex: false,
    seo_nofollow: false,
    meta_title: null,
    meta_description: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}

async function main() {
  await loadLocalEnv();

  const supabaseUrl = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  );
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Ingredient library seeding requires a server-side key.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const slugs = INGREDIENTS.map((ingredient) => ingredient.slug);
  const { data: existingRows, error: existingError } = await supabase
    .from("ingredients")
    .select("id, name, slug, deleted_at")
    .in("slug", slugs);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingBySlug = new Map(
    (existingRows ?? []).map((ingredient) => [ingredient.slug, ingredient]),
  );
  const created = [];
  const restored = [];
  const skipped = [];

  for (const ingredient of INGREDIENTS) {
    const existing = existingBySlug.get(ingredient.slug);

    if (existing) {
      if (existing.deleted_at) {
        const { data, error } = await supabase
          .from("ingredients")
          .update({
            name: ingredient.name,
            status: "published",
            ingredient_category: ingredient.category,
            deleted_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select("id, name, slug, status, ingredient_category")
          .single();

        if (error) {
          throw new Error(`Failed to restore ${ingredient.slug}: ${error.message}`);
        }

        restored.push(data);
        continue;
      }

      skipped.push({
        name: ingredient.name,
        slug: ingredient.slug,
        reason: "Ingredient slug already exists",
      });
      continue;
    }

    const { data, error } = await supabase
      .from("ingredients")
      .insert(createBlankIngredientPayload(ingredient))
      .select("id, name, slug, status, ingredient_category")
      .single();

    if (error) {
      throw new Error(`Failed to create ${ingredient.slug}: ${error.message}`);
    }

    created.push(data);
  }

  const { data: verifiedRows, error: verificationError } = await supabase
    .from("ingredients")
    .select(
      "id, name, slug, status, ingredient_category, short_description, overview_content, benefits_json, faq_json, seo_title, seo_description, deleted_at",
    )
    .in("slug", slugs)
    .is("deleted_at", null);

  if (verificationError) {
    throw new Error(verificationError.message);
  }

  const verifiedBySlug = new Map(
    (verifiedRows ?? []).map((ingredient) => [ingredient.slug, ingredient]),
  );
  const missing = INGREDIENTS.filter(
    (ingredient) => !verifiedBySlug.has(ingredient.slug),
  );

  if (missing.length) {
    throw new Error(
      `Verification failed. Missing slugs: ${missing
        .map((ingredient) => ingredient.slug)
        .join(", ")}`,
    );
  }

  const nonBlankCmsFields = (verifiedRows ?? []).flatMap((ingredient) => {
    const fields = [
      "short_description",
      "overview_content",
      "seo_title",
      "seo_description",
    ].filter((field) => ingredient[field]);

    const arrayFields = ["benefits_json", "faq_json"].filter(
      (field) => Array.isArray(ingredient[field]) && ingredient[field].length > 0,
    );

    return [...fields, ...arrayFields].map((field) => ({
      slug: ingredient.slug,
      field,
    }));
  });

  if (nonBlankCmsFields.length) {
    throw new Error(
      `Verification failed. New rows must have blank CMS/SEO fields: ${JSON.stringify(
        nonBlankCmsFields,
      )}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        phase: "Ingredient Library Expansion Phase 5",
        total: INGREDIENTS.length,
        created: created.length,
        restored: restored.length,
        skipped: skipped.length,
        createdIngredients: created.map((ingredient) => ({
          name: ingredient.name,
          slug: ingredient.slug,
          category: ingredient.ingredient_category,
        })),
        restoredIngredients: restored.map((ingredient) => ({
          name: ingredient.name,
          slug: ingredient.slug,
          category: ingredient.ingredient_category,
        })),
        skippedIngredients: skipped,
        verified: verifiedRows?.length ?? 0,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

