#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const BATCH_1_INGREDIENTS = [
  { name: "Probiotics", slug: "probiotics", category: "Probiotics" },
  { name: "Omega-3 Fatty Acids", slug: "omega-3-fatty-acids", category: "Specialty Ingredients" },
  { name: "Vitamin C", slug: "vitamin-c", category: "Vitamins" },
  { name: "Vitamin B12", slug: "vitamin-b12", category: "Vitamins" },
  { name: "Vitamin E", slug: "vitamin-e", category: "Vitamins" },
  { name: "Curcumin", slug: "curcumin", category: "Herbal Extracts" },
  { name: "Green Tea Extract", slug: "green-tea-extract", category: "Herbal Extracts" },
  { name: "Chromium", slug: "chromium", category: "Minerals" },
  { name: "Selenium", slug: "selenium", category: "Minerals" },
  { name: "Copper", slug: "copper", category: "Minerals" },
  { name: "Panax Ginseng", slug: "panax-ginseng", category: "Herbal Extracts" },
  { name: "GABA", slug: "gaba", category: "Amino Acids" },
  { name: "Grape Seed Extract", slug: "grape-seed-extract", category: "Antioxidants" },
  { name: "Boswellia Serrata", slug: "boswellia-serrata", category: "Herbal Extracts" },
  { name: "Cinnamon Bark Extract", slug: "cinnamon-bark-extract", category: "Herbal Extracts" },
  { name: "Saffron Extract", slug: "saffron-extract", category: "Herbal Extracts" },
  { name: "Nattokinase", slug: "nattokinase", category: "Specialty Ingredients" },
  { name: "Olive Leaf Extract", slug: "olive-leaf-extract", category: "Herbal Extracts" },
  { name: "Quercetin Phytosome", slug: "quercetin-phytosome", category: "Antioxidants" },
  { name: "Pine Bark Extract", slug: "pine-bark-extract", category: "Antioxidants" },
  { name: "Spirulina", slug: "spirulina", category: "Specialty Ingredients" },
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

  const slugs = BATCH_1_INGREDIENTS.map((ingredient) => ingredient.slug);
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

  for (const ingredient of BATCH_1_INGREDIENTS) {
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
    .select("id, name, slug, status, ingredient_category, deleted_at")
    .in("slug", slugs)
    .is("deleted_at", null);

  if (verificationError) {
    throw new Error(verificationError.message);
  }

  const verifiedBySlug = new Map(
    (verifiedRows ?? []).map((ingredient) => [ingredient.slug, ingredient]),
  );
  const missing = BATCH_1_INGREDIENTS.filter(
    (ingredient) => !verifiedBySlug.has(ingredient.slug),
  );

  if (missing.length) {
    throw new Error(
      `Verification failed. Missing slugs: ${missing
        .map((ingredient) => ingredient.slug)
        .join(", ")}`,
    );
  }

  const createdOrRestoredSlugs = new Set(
    [...created, ...restored].map((ingredient) => ingredient.slug),
  );
  const mismatched = BATCH_1_INGREDIENTS.filter((ingredient) => {
    if (!createdOrRestoredSlugs.has(ingredient.slug)) {
      return false;
    }

    const verified = verifiedBySlug.get(ingredient.slug);

    return (
      verified.status !== "published" ||
      verified.ingredient_category !== ingredient.category
    );
  });

  if (mismatched.length) {
    throw new Error(
      `Verification failed. Mismatched records: ${mismatched
        .map((ingredient) => ingredient.slug)
        .join(", ")}`,
    );
  }

  console.log(
    JSON.stringify(
        {
          batch: "Ingredient Library Batch 1",
          total: BATCH_1_INGREDIENTS.length,
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
