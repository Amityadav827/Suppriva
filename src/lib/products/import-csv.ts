import { ContentStatus } from "@/lib/database/constants";
import type { FAQItem } from "@/lib/database/types";

export const PRODUCT_IMPORT_HEADERS = [
  "product_name",
  "slug",
  "category",
  "affiliate_url",
  "short_description",
  "rating",
  "ingredients",
  "pros",
  "cons",
  "faq",
  "featured_image",
  "status",
] as const;

export type ProductImportHeader = (typeof PRODUCT_IMPORT_HEADERS)[number];

export type ProductImportCsvRow = Record<ProductImportHeader, string>;

export type ParsedProductImportRow = {
  rowNumber: number;
  row: ProductImportCsvRow;
};

export type ParsedProductImportCsv = {
  headers: string[];
  rows: ParsedProductImportRow[];
  errors: string[];
};

export type ProductImportTemplateOptions = {
  sampleCategories: string[];
  sampleIngredients: string[];
};

function emptyRow(): ProductImportCsvRow {
  return {
    product_name: "",
    slug: "",
    category: "",
    affiliate_url: "",
    short_description: "",
    rating: "",
    ingredients: "",
    pros: "",
    cons: "",
    faq: "",
    featured_image: "",
    status: "",
  };
}

function parseCsvCells(text: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let isInsideQuotes = false;

  const normalizedText = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < normalizedText.length; index += 1) {
    const character = normalizedText[index];
    const nextCharacter = normalizedText[index + 1];

    if (character === '"') {
      if (isInsideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        isInsideQuotes = !isInsideQuotes;
      }

      continue;
    }

    if (!isInsideQuotes && character === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!isInsideQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length || currentRow.length) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

export function parseProductImportCsv(text: string): ParsedProductImportCsv {
  const rows = parseCsvCells(text);

  if (!rows.length) {
    return {
      headers: [],
      rows: [],
      errors: ["The CSV file is empty."],
    };
  }

  const firstContentRow = rows.find(
    (row) => row.some((cell) => cell.trim()) && !row[0]?.trim().startsWith("#"),
  );

  if (!firstContentRow) {
    return {
      headers: [],
      rows: [],
      errors: ["The CSV file does not contain a header row."],
    };
  }

  const headerRowIndex = rows.indexOf(firstContentRow);
  const headers = firstContentRow.map(normalizeHeader);
  const missingHeaders = PRODUCT_IMPORT_HEADERS.filter((header) => !headers.includes(header));
  const unsupportedHeaders = headers.filter(
    (header) => header && !PRODUCT_IMPORT_HEADERS.includes(header as ProductImportHeader),
  );

  if (missingHeaders.length || unsupportedHeaders.length) {
    return {
      headers,
      rows: [],
      errors: [
        missingHeaders.length
          ? `Missing required columns: ${missingHeaders.join(", ")}.`
          : "",
        unsupportedHeaders.length
          ? `Unsupported columns: ${unsupportedHeaders.join(", ")}.`
          : "",
      ].filter(Boolean),
    };
  }

  const parsedRows: ParsedProductImportRow[] = [];

  rows.slice(headerRowIndex + 1).forEach((rawRow, rowIndex) => {
    const rowNumber = headerRowIndex + rowIndex + 2;
    const isCommentRow = rawRow[0]?.trim().startsWith("#");
    const hasContent = rawRow.some((cell) => cell.trim());

    if (!hasContent || isCommentRow) {
      return;
    }

    const mappedRow = emptyRow();

    PRODUCT_IMPORT_HEADERS.forEach((header) => {
      const headerIndex = headers.indexOf(header);
      mappedRow[header] = (rawRow[headerIndex] ?? "").trim();
    });

    parsedRows.push({
      rowNumber,
      row: mappedRow,
    });
  });

  return {
    headers,
    rows: parsedRows,
    errors: [],
  };
}

export function splitPipeValues(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseImportFaq(value: string): FAQItem[] {
  return splitPipeValues(value).map((item) => {
    const [question, answer = ""] = item.split("::").map((part) => part.trim());

    return {
      question,
      answer,
    };
  });
}

export function normalizeImportStatus(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (!normalizedValue) {
    return ContentStatus.Draft;
  }

  if (normalizedValue === ContentStatus.Published) {
    return ContentStatus.Published;
  }

  if (normalizedValue === ContentStatus.Archived) {
    return ContentStatus.Archived;
  }

  return ContentStatus.Draft;
}

function escapeCsvValue(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function toCsvRow(values: string[]) {
  return values.map(escapeCsvValue).join(",");
}

export function buildProductImportTemplate(options: ProductImportTemplateOptions) {
  const categorySample = options.sampleCategories.slice(0, 8).join(" | ");
  const ingredientSample = options.sampleIngredients.slice(0, 8).join(" | ");
  const exampleCategory = options.sampleCategories[0] ?? "Weight Loss";
  const exampleIngredients =
    options.sampleIngredients.slice(0, 3).join("|") ||
    "Green Tea Extract (EGCG)|L-Carnitine|Chromium Picolinate";

  return [
    `# Sample Categories: ${categorySample}`,
    `# Sample Ingredients: ${ingredientSample}`,
    toCsvRow([...PRODUCT_IMPORT_HEADERS]),
    toCsvRow([
      "Java Burn",
      "java-burn",
      exampleCategory,
      "https://affiliate-link.com",
      "Metabolism support supplement",
      "4.8",
      exampleIngredients,
      "Supports metabolism|Easy to use",
      "Premium pricing",
      "What is Java Burn?::A metabolism-focused supplement blend.",
      "https://image-url.com/image.jpg",
      ContentStatus.Published,
    ]),
  ].join("\n");
}
