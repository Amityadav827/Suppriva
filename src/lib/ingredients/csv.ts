import { ContentStatus } from "@/lib/database/constants";
import type { Ingredient, JsonValue } from "@/lib/database/types";
import type { IngredientCreateInput } from "@/lib/validators/ingredient.validator";

export const INGREDIENT_CSV_COLUMNS = [
  "id",
  "name",
  "slug",
  "status",
  "scientific_name",
  "ingredient_category",
  "image_url",
  "featured_image",
  "rating",
  "evidence_level",
  "origin_country",
  "part_used",
  "ingredient_form",
  "taste_profile",
  "typical_dose",
  "best_for",
  "safety_level",
  "short_description",
  "full_description",
  "overview_content",
  "how_it_works_content",
  "interesting_fact",
  "benefits",
  "benefits_json",
  "side_effects",
  "side_effects_json",
  "drug_interactions_json",
  "who_should_avoid_json",
  "faq_json",
  "related_ingredients_json",
  "product_ids",
  "dosage",
  "scientific_notes",
  "seo_title",
  "seo_description",
  "meta_title",
  "meta_description",
  "is_featured",
  "created_at",
  "updated_at",
  "deleted_at",
] as const;

export const INGREDIENT_IMPORT_BATCH_SIZE = 100;

export type IngredientCsvColumn = (typeof INGREDIENT_CSV_COLUMNS)[number];
export type IngredientCsvRow = Record<IngredientCsvColumn, string>;

const REQUIRED_INGREDIENT_CSV_COLUMNS = INGREDIENT_CSV_COLUMNS.filter(
  (column) => column !== "status",
);

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(isJsonValue);
  }

  return false;
}

export function csvList(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  const separator = normalizedValue.includes(";")
    ? ";"
    : normalizedValue.includes("|")
      ? "|"
      : ",";

  return normalizedValue
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseBoolean(value: string) {
  return ["true", "1", "yes", "featured"].includes(value.trim().toLowerCase());
}

export function cleanText(value: string) {
  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function createCsv(rows: Array<Array<string | number | boolean | null | undefined>>) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      row.push(cell);

      if (row.some((value) => value.trim())) {
        rows.push(row);
      }

      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  return rows;
}

export function parseIngredientCsv(text: string) {
  const rows = parseCsv(text);
  const [header, ...bodyRows] = rows;

  if (!header) {
    return { rows: [] as IngredientCsvRow[], errors: ["CSV file is empty."] };
  }

  const normalizedHeader = header.map((column) => column.trim());
  const missingColumns = REQUIRED_INGREDIENT_CSV_COLUMNS.filter(
    (column) => !normalizedHeader.includes(column),
  );
  const errors = missingColumns.length
    ? [`Missing columns: ${missingColumns.join(", ")}.`]
    : [];

  const parsedRows = bodyRows.map((bodyRow) => {
    const entry = {} as IngredientCsvRow;

    INGREDIENT_CSV_COLUMNS.forEach((column) => {
      const columnIndex = normalizedHeader.indexOf(column);
      entry[column] = columnIndex >= 0 ? bodyRow[columnIndex]?.trim() ?? "" : "";
    });

    return entry;
  });

  return { rows: parsedRows, errors };
}

function stringifyJsonCell(value: JsonValue[] | JsonValue | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value) && !value.length) {
    return "";
  }

  return JSON.stringify(value);
}

function parseJsonCell(value: string, fieldLabel: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return { value: null as JsonValue | null, errors: [] as string[] };
  }

  try {
    const parsed = JSON.parse(normalizedValue) as unknown;

    if (!isJsonValue(parsed)) {
      return {
        value: null,
        errors: [`${fieldLabel} must contain valid JSON-compatible values.`],
      };
    }

    return { value: parsed, errors: [] as string[] };
  } catch {
    return {
      value: null,
      errors: [`${fieldLabel} must be valid JSON.`],
    };
  }
}

function parseJsonArrayCell(value: string, fieldLabel: string) {
  const result = parseJsonCell(value, fieldLabel);

  if (!result.value) {
    return { value: [] as JsonValue[], errors: result.errors };
  }

  if (!Array.isArray(result.value)) {
    return {
      value: [] as JsonValue[],
      errors: [`${fieldLabel} must be a JSON array.`],
    };
  }

  return { value: result.value, errors: [] as string[] };
}

function parseStructuredTitleDescriptionItems(value: string, fallback: string[], fieldLabel: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return fallback.map((title) => ({ title, description: "" }));
  }

  const { value: parsed, errors } = parseJsonArrayCell(normalizedValue, fieldLabel);

  if (errors.length) {
    throw new Error(errors.join(" "));
  }

  return parsed
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        title: typeof item.title === "string" ? item.title.trim() : "",
        description: typeof item.description === "string" ? item.description.trim() : "",
      };
    })
    .filter((item) => item?.title || item?.description) as Array<{
    title: string;
    description: string;
  }>;
}

function parseFaqItems(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  const { value: parsed, errors } = parseJsonArrayCell(normalizedValue, "faq_json");

  if (errors.length) {
    throw new Error(errors.join(" "));
  }

  return parsed
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        question: typeof item.question === "string" ? item.question.trim() : "",
        answer: typeof item.answer === "string" ? item.answer.trim() : "",
      };
    })
    .filter((item) => item?.question || item?.answer) as Array<{
    question: string;
    answer: string;
  }>;
}

function parseRelatedIngredients(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  const { value: parsed, errors } = parseJsonArrayCell(
    normalizedValue,
    "related_ingredients_json",
  );

  if (errors.length) {
    throw new Error(errors.join(" "));
  }

  return parsed
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const name = typeof item.name === "string" ? item.name.trim() : "";
      const slug =
        typeof item.slug === "string" && item.slug.trim()
          ? item.slug.trim()
          : name
            ? slugify(name)
            : "";

      return name ? { name, slug } : null;
    })
    .filter(Boolean) as Array<{ name: string; slug: string }>;
}

function parseStringJsonList(value: string, fieldLabel: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  if (!normalizedValue.startsWith("[")) {
    return csvList(normalizedValue);
  }

  const { value: parsed, errors } = parseJsonArrayCell(normalizedValue, fieldLabel);

  if (errors.length) {
    throw new Error(errors.join(" "));
  }

  return parsed
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function ingredientToCsvRow(ingredient: Ingredient) {
  return [
    ingredient.id,
    ingredient.name,
    ingredient.slug,
    ingredient.status,
    ingredient.scientific_name ?? "",
    ingredient.ingredient_category ?? "",
    ingredient.image_url ?? "",
    ingredient.featured_image ?? "",
    ingredient.rating ?? "",
    ingredient.evidence_level ?? "",
    ingredient.origin_country ?? "",
    ingredient.part_used ?? "",
    ingredient.ingredient_form ?? "",
    ingredient.taste_profile ?? "",
    ingredient.typical_dose ?? "",
    ingredient.best_for ?? "",
    ingredient.safety_level ?? "",
    ingredient.short_description ?? "",
    ingredient.full_description ?? "",
    ingredient.overview_content ?? "",
    ingredient.how_it_works_content ?? "",
    ingredient.interesting_fact ?? "",
    ingredient.benefits.join("; "),
    stringifyJsonCell(ingredient.benefits_json),
    ingredient.side_effects.join("; "),
    stringifyJsonCell(ingredient.side_effects_json),
    stringifyJsonCell(ingredient.drug_interactions_json),
    stringifyJsonCell(ingredient.who_should_avoid_json),
    stringifyJsonCell(ingredient.faq_json),
    stringifyJsonCell(ingredient.related_ingredients_json),
    "",
    ingredient.dosage ?? "",
    ingredient.scientific_notes ?? "",
    ingredient.seo_title ?? "",
    ingredient.seo_description ?? "",
    ingredient.meta_title ?? "",
    ingredient.meta_description ?? "",
    ingredient.is_featured,
    ingredient.created_at,
    ingredient.updated_at,
    ingredient.deleted_at ?? "",
  ];
}

export function csvRowToIngredientPayload(row: IngredientCsvRow) {
  const errors: string[] = [];
  const name = row.name.trim();
  const slug = row.slug.trim() || slugify(name);
  const normalizedStatus = row.status.trim().toLowerCase();
  const benefits = csvList(row.benefits);
  const sideEffects = csvList(row.side_effects);
  const primaryImage = cleanText(row.image_url) || cleanText(row.featured_image);
  const seoTitle = cleanText(row.seo_title) || cleanText(row.meta_title);
  const seoDescription = cleanText(row.seo_description) || cleanText(row.meta_description);
  let benefitsJson: Array<{ title: string; description: string }> = [];
  let sideEffectsJson: Array<{ title: string; description: string }> = [];
  let drugInteractions: string[] = [];
  let whoShouldAvoid: string[] = [];
  let faqJson: Array<{ question: string; answer: string }> = [];
  let relatedIngredients: Array<{ name: string; slug: string }> = [];

  try {
    benefitsJson = parseStructuredTitleDescriptionItems(
      row.benefits_json,
      benefits,
      "benefits_json",
    );
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Invalid benefits_json value.");
  }

  try {
    sideEffectsJson = parseStructuredTitleDescriptionItems(
      row.side_effects_json,
      sideEffects,
      "side_effects_json",
    );
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Invalid side_effects_json value.");
  }

  try {
    drugInteractions = parseStringJsonList(
      row.drug_interactions_json,
      "drug_interactions_json",
    );
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Invalid drug_interactions_json value.",
    );
  }

  try {
    whoShouldAvoid = parseStringJsonList(
      row.who_should_avoid_json,
      "who_should_avoid_json",
    );
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Invalid who_should_avoid_json value.",
    );
  }

  try {
    faqJson = parseFaqItems(row.faq_json);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Invalid faq_json value.");
  }

  try {
    relatedIngredients = parseRelatedIngredients(row.related_ingredients_json);
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Invalid related_ingredients_json value.",
    );
  }

  const productIds = csvList(row.product_ids);

  const payload: IngredientCreateInput = {
    name,
    slug,
    status:
      normalizedStatus === ContentStatus.Published ||
      normalizedStatus === ContentStatus.Archived ||
      normalizedStatus === ContentStatus.Draft
        ? normalizedStatus
        : ContentStatus.Draft,
    scientific_name: cleanText(row.scientific_name),
    ingredient_category: cleanText(row.ingredient_category),
    short_description: cleanText(row.short_description),
    full_description: cleanText(row.full_description),
    image_url: primaryImage,
    featured_image: primaryImage,
    rating: row.rating.trim() ? Number(row.rating) : null,
    evidence_level: cleanText(row.evidence_level),
    origin_country: cleanText(row.origin_country),
    part_used: cleanText(row.part_used),
    ingredient_form: cleanText(row.ingredient_form),
    taste_profile: cleanText(row.taste_profile),
    typical_dose: cleanText(row.typical_dose) || cleanText(row.dosage),
    best_for: cleanText(row.best_for),
    safety_level: cleanText(row.safety_level),
    overview_content: cleanText(row.overview_content),
    how_it_works_content: cleanText(row.how_it_works_content) || cleanText(row.scientific_notes),
    interesting_fact: cleanText(row.interesting_fact),
    benefits,
    side_effects: sideEffects,
    dosage: cleanText(row.dosage) || cleanText(row.typical_dose),
    scientific_notes: cleanText(row.scientific_notes) || cleanText(row.how_it_works_content),
    benefits_json: benefitsJson,
    side_effects_json: sideEffectsJson,
    drug_interactions_json: drugInteractions,
    who_should_avoid_json: whoShouldAvoid,
    faq_json: faqJson,
    related_ingredients_json: relatedIngredients,
    seo_title: seoTitle,
    seo_description: seoDescription,
    meta_title: seoTitle,
    meta_description: seoDescription,
    is_featured: parseBoolean(row.is_featured),
    product_ids: productIds,
  };

  if (payload.rating !== null && Number.isNaN(payload.rating)) {
    errors.push("rating must be a valid number.");
  }

  if (
    normalizedStatus &&
    ![
      ContentStatus.Draft,
      ContentStatus.Published,
      ContentStatus.Archived,
    ].includes(normalizedStatus as ContentStatus)
  ) {
    errors.push("status must be draft, published, or archived.");
  }

  return { payload, errors };
}
