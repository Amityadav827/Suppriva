#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const FORBIDDEN_FIELDS = new Set([
  "id",
  "slug",
  "created_at",
  "updated_at",
  "deleted_at",
]);

function parseArgs(argv) {
  const args = {
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--slug" || arg === "--file") {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}.`);
      }

      args[arg.slice(2)] = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.slug) {
    throw new Error("Missing --slug.");
  }

  if (!args.file) {
    throw new Error("Missing --file.");
  }

  return args;
}

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

async function readPayload(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const contents = await readFile(resolvedPath, "utf8");
  const payload = JSON.parse(contents);

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    throw new Error("Ingredient content payload must be a JSON object.");
  }

  for (const field of FORBIDDEN_FIELDS) {
    if (field in payload) {
      throw new Error(`Payload must not include managed field: ${field}.`);
    }
  }

  return payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await loadLocalEnv();
  const payload = await readPayload(args.file);
  const fields = Object.keys(payload);

  if (!fields.length) {
    throw new Error("Ingredient content payload is empty.");
  }

  if (args.dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          slug: args.slug,
          fields,
        },
        null,
        2,
      ),
    );
    return;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Ingredient content updates require a server-side key.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("ingredients")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", args.slug)
    .is("deleted_at", null)
    .select("id, slug, name, updated_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`No active ingredient found for slug "${args.slug}".`);
  }

  console.log(
    JSON.stringify(
      {
        updated: true,
        ingredient: data,
        fields,
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
