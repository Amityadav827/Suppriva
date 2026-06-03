"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { Ingredient, Product } from "@/lib/database/types";
import { motion } from "framer-motion";
import {
  Download,
  FileDown,
  FileUp,
  FlaskConical,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type IngredientFormState = {
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  benefits: string;
  side_effects: string;
  dosage: string;
  scientific_notes: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  is_featured: boolean;
  product_ids: string[];
};

type IngredientsResponse = {
  ingredients?: Ingredient[];
  ingredient?: Ingredient;
  relatedProducts?: Product[];
  error?: string;
};

type ProductsResponse = {
  products?: Product[];
  error?: string;
};

const CSV_COLUMNS = [
  "id",
  "name",
  "slug",
  "short_description",
  "full_description",
  "benefits",
  "side_effects",
  "dosage",
  "scientific_notes",
  "featured_image",
  "meta_title",
  "meta_description",
  "is_featured",
  "created_at",
  "updated_at",
  "deleted_at",
] as const;

type IngredientCsvRow = Record<(typeof CSV_COLUMNS)[number], string>;

const emptyForm: IngredientFormState = {
  name: "",
  slug: "",
  short_description: "",
  full_description: "",
  benefits: "",
  side_effects: "",
  dosage: "",
  scientific_notes: "",
  featured_image: "",
  meta_title: "",
  meta_description: "",
  is_featured: false,
  product_ids: [],
};

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function csvList(value: string) {
  const separator = value.includes(";") ? ";" : value.includes("|") ? "|" : ",";

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBoolean(value: string) {
  return ["true", "1", "yes", "featured"].includes(value.trim().toLowerCase());
}

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function createCsv(rows: Array<Array<string | number | boolean | null | undefined>>) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string) {
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

function parseIngredientCsv(text: string) {
  const rows = parseCsv(text);
  const [header, ...bodyRows] = rows;

  if (!header) {
    return { rows: [] as IngredientCsvRow[], errors: ["CSV file is empty."] };
  }

  const normalizedHeader = header.map((column) => column.trim());
  const missingColumns = CSV_COLUMNS.filter((column) => !normalizedHeader.includes(column));
  const errors = missingColumns.length
    ? [`Missing columns: ${missingColumns.join(", ")}.`]
    : [];

  const parsedRows = bodyRows.map((bodyRow) => {
    const entry = {} as IngredientCsvRow;

    CSV_COLUMNS.forEach((column) => {
      const columnIndex = normalizedHeader.indexOf(column);
      entry[column] = columnIndex >= 0 ? bodyRow[columnIndex]?.trim() ?? "" : "";
    });

    return entry;
  });

  return { rows: parsedRows, errors };
}

function ingredientToCsvRow(ingredient: Ingredient) {
  return [
    ingredient.id,
    ingredient.name,
    ingredient.slug,
    ingredient.short_description ?? "",
    ingredient.full_description ?? "",
    ingredient.benefits.join("; "),
    ingredient.side_effects.join("; "),
    ingredient.dosage ?? "",
    ingredient.scientific_notes ?? "",
    ingredient.featured_image ?? "",
    ingredient.meta_title ?? "",
    ingredient.meta_description ?? "",
    ingredient.is_featured,
    ingredient.created_at,
    ingredient.updated_at,
    ingredient.deleted_at ?? "",
  ];
}

function sampleIngredientRows() {
  const samples = [
    {
      name: "Ashwagandha",
      slug: "ashwagandha",
      short: "An adaptogenic herb used to support calm, resilience, and balanced stress response.",
      full:
        "Ashwagandha is a traditional adaptogen commonly used in wellness formulas for stress support, relaxation, sleep quality, and daily balance. It is often paired with magnesium or L-theanine in calm-focused routines.",
      benefits: "Stress resilience; Calm mood support; Sleep quality support; General wellness balance",
      sideEffects: "May cause digestive discomfort in sensitive users; Avoid during pregnancy unless advised by a clinician",
      dosage: "Common supplemental ranges are 300-600 mg daily depending on extract strength.",
      notes: "Look for standardized extracts and review with a healthcare professional when using thyroid or sedative medications.",
      metaTitle: "Ashwagandha Benefits, Dosage and Safety | Suppriva",
      metaDescription:
        "Learn about ashwagandha benefits, dosage ranges, side effects, and how this adaptogen is used in premium wellness supplements.",
      featured: true,
    },
    {
      name: "Berberine",
      slug: "berberine",
      short: "A plant compound often used for metabolic wellness and healthy blood sugar support.",
      full:
        "Berberine is a bioactive alkaloid found in several plants and is commonly discussed for metabolic health, glucose metabolism, and cardiometabolic wellness routines.",
      benefits: "Metabolic wellness; Healthy glucose metabolism support; Lipid profile support; Weight management routines",
      sideEffects: "May cause gastrointestinal discomfort; Can interact with glucose-lowering medications",
      dosage: "Common ranges are 500 mg one to three times daily with meals.",
      notes: "Berberine has meaningful interaction potential, so users on medication should seek medical guidance before use.",
      metaTitle: "Berberine Guide: Benefits, Dosage and Safety | Suppriva",
      metaDescription:
        "Review berberine uses for metabolic wellness, typical dosage ranges, safety notes, and supplement selection tips.",
      featured: true,
    },
    {
      name: "Creatine Monohydrate",
      slug: "creatine-monohydrate",
      short: "A well-studied performance ingredient for strength, power, and muscle energy support.",
      full:
        "Creatine monohydrate supports phosphocreatine stores in muscle and is widely used in fitness, strength, and performance routines. It is one of the most researched sports nutrition ingredients.",
      benefits: "Strength support; Power output support; Muscle energy support; Training recovery support",
      sideEffects: "May cause temporary water weight increase; Digestive discomfort can occur with high single doses",
      dosage: "A common maintenance dose is 3-5 g daily.",
      notes: "Creatine monohydrate is the reference form with strong research history and broad supplement availability.",
      metaTitle: "Creatine Monohydrate Benefits and Dosage | Suppriva",
      metaDescription:
        "Understand creatine monohydrate benefits, common dosage, performance uses, and practical safety considerations.",
      featured: false,
    },
    {
      name: "Magnesium Glycinate",
      slug: "magnesium-glycinate",
      short: "A gentle magnesium form often used for relaxation, sleep, and muscle function support.",
      full:
        "Magnesium glycinate combines magnesium with glycine and is popular for users seeking a gentle, well-tolerated magnesium option for evening routines and general mineral support.",
      benefits: "Relaxation support; Sleep routine support; Muscle function; Nervous system support",
      sideEffects: "High intakes may cause loose stools; Users with kidney disease should consult a clinician",
      dosage: "Typical supplemental elemental magnesium ranges from 100-300 mg daily.",
      notes: "Check the elemental magnesium amount rather than only the compound weight on the supplement label.",
      metaTitle: "Magnesium Glycinate Benefits and Dosage | Suppriva",
      metaDescription:
        "Explore magnesium glycinate benefits for sleep, calm, muscle function, dosage guidance, and safety notes.",
      featured: true,
    },
    {
      name: "Omega 3",
      slug: "omega-3",
      short: "Essential fatty acids commonly used for heart, brain, and inflammation-supportive wellness routines.",
      full:
        "Omega 3 fatty acids such as EPA and DHA are found in fish oil and algae oil supplements. They are widely used for cardiovascular wellness, cognitive support, and balanced inflammation response.",
      benefits: "Heart health support; Brain health support; Joint comfort routines; Healthy triglyceride support",
      sideEffects: "May cause fishy aftertaste; Can increase bleeding risk at high doses or with blood thinners",
      dosage: "Common daily EPA plus DHA ranges vary from 250-1000 mg depending on wellness goals.",
      notes: "Choose products that clearly list EPA and DHA amounts and use third-party purity testing where possible.",
      metaTitle: "Omega 3 Benefits, EPA DHA and Dosage | Suppriva",
      metaDescription:
        "Compare omega 3 benefits, EPA and DHA labels, dosage ranges, and quality tips for fish oil or algae oil supplements.",
      featured: false,
    },
    {
      name: "L-Theanine",
      slug: "l-theanine",
      short: "An amino acid from tea often used for calm focus without heavy sedation.",
      full:
        "L-theanine is commonly used in focus, stress, and sleep-support formulas. It is often paired with caffeine for smoother alertness or with magnesium for evening calm.",
      benefits: "Calm focus; Relaxation support; Stress routine support; Smooth caffeine pairing",
      sideEffects: "Generally well tolerated; May increase drowsiness when paired with sedatives",
      dosage: "Common supplemental ranges are 100-200 mg as needed.",
      notes: "L-theanine is popular because it can support a calm state while preserving mental clarity for many users.",
      metaTitle: "L-Theanine Benefits for Calm Focus | Suppriva",
      metaDescription:
        "Learn how L-theanine supports calm focus, caffeine balance, relaxation routines, dosage, and safety considerations.",
      featured: false,
    },
    {
      name: "Curcumin",
      slug: "curcumin",
      short: "The active compound in turmeric, often used for antioxidant and joint comfort support.",
      full:
        "Curcumin is a turmeric-derived polyphenol commonly included in formulas for antioxidant support, joint comfort, and healthy inflammation response.",
      benefits: "Antioxidant support; Joint comfort routines; Healthy inflammation response; Mobility support",
      sideEffects: "May cause stomach upset; Can interact with blood thinners or gallbladder conditions",
      dosage: "Common extract doses range from 500-1000 mg daily depending on formulation.",
      notes: "Bioavailability-enhanced curcumin forms may improve absorption compared with plain turmeric powder.",
      metaTitle: "Curcumin Benefits, Absorption and Safety | Suppriva",
      metaDescription:
        "Review curcumin benefits, turmeric extract quality, absorption technology, dosage ranges, and safety notes.",
      featured: false,
    },
    {
      name: "CoQ10",
      slug: "coq10",
      short: "A coenzyme involved in cellular energy, commonly used for heart and vitality support.",
      full:
        "CoQ10 is naturally involved in mitochondrial energy production and is frequently used in heart health and energy-support supplement routines.",
      benefits: "Cellular energy support; Heart wellness; Antioxidant support; Vitality routines",
      sideEffects: "May cause mild digestive upset; Can interact with anticoagulant medications",
      dosage: "Common supplemental ranges are 100-200 mg daily with a meal containing fat.",
      notes: "Ubiquinol and ubiquinone are common forms; taking CoQ10 with food can support absorption.",
      metaTitle: "CoQ10 Benefits for Energy and Heart Health | Suppriva",
      metaDescription:
        "Understand CoQ10 benefits, common forms, dosage ranges, heart health uses, and supplement quality tips.",
      featured: false,
    },
    {
      name: "Rhodiola Rosea",
      slug: "rhodiola-rosea",
      short: "An adaptogenic herb often used for energy, stress resilience, and mental stamina.",
      full:
        "Rhodiola rosea is an adaptogen used in formulas designed for fatigue support, daily resilience, and cognitive performance under stress.",
      benefits: "Stress resilience; Mental stamina; Energy support; Fatigue management routines",
      sideEffects: "May feel stimulating for some users; Avoid late-day use if sensitive",
      dosage: "Common extract ranges are 200-400 mg daily, often standardized for rosavins and salidroside.",
      notes: "Rhodiola may be best suited earlier in the day because some users find it energizing.",
      metaTitle: "Rhodiola Rosea Benefits and Dosage | Suppriva",
      metaDescription:
        "Explore Rhodiola rosea benefits for energy, stress resilience, fatigue routines, dosage, and safety notes.",
      featured: false,
    },
    {
      name: "5-HTP",
      slug: "5-htp",
      short: "A serotonin precursor used in some mood and sleep-support supplement routines.",
      full:
        "5-HTP is a compound involved in serotonin production and appears in some mood, appetite, and sleep-support formulas. It requires careful review because of medication interactions.",
      benefits: "Sleep routine support; Mood wellness routines; Appetite support; Relaxation support",
      sideEffects: "Can cause nausea or drowsiness; Avoid with SSRIs, MAOIs, or other serotonergic medications unless medically supervised",
      dosage: "Common supplemental ranges vary, often starting around 50-100 mg.",
      notes: "Because 5-HTP affects serotonin pathways, interaction screening is especially important before use.",
      metaTitle: "5-HTP Benefits, Dosage and Safety | Suppriva",
      metaDescription:
        "Learn about 5-HTP uses for mood and sleep routines, dosage considerations, side effects, and important interaction warnings.",
      featured: false,
    },
  ];

  return samples.map((sample) => [
    "",
    sample.name,
    sample.slug,
    sample.short,
    sample.full,
    sample.benefits,
    sample.sideEffects,
    sample.dosage,
    sample.notes,
    "",
    sample.metaTitle,
    sample.metaDescription,
    sample.featured,
    "",
    "",
    "",
  ]);
}

function csvRowToPayload(row: IngredientCsvRow) {
  const name = row.name.trim();
  const slug = row.slug.trim() || slugify(name);

  return {
    name,
    slug,
    short_description: row.short_description || null,
    full_description: row.full_description || null,
    benefits: csvList(row.benefits),
    side_effects: csvList(row.side_effects),
    dosage: row.dosage || null,
    scientific_notes: row.scientific_notes || null,
    featured_image: row.featured_image || null,
    meta_title: row.meta_title || null,
    meta_description: row.meta_description || null,
    is_featured: parseBoolean(row.is_featured),
    product_ids: [],
  };
}

function ingredientToForm(ingredient: Ingredient): IngredientFormState {
  return {
    name: ingredient.name,
    slug: ingredient.slug,
    short_description: ingredient.short_description ?? "",
    full_description: ingredient.full_description ?? "",
    benefits: ingredient.benefits.join("\n"),
    side_effects: ingredient.side_effects.join("\n"),
    dosage: ingredient.dosage ?? "",
    scientific_notes: ingredient.scientific_notes ?? "",
    featured_image: ingredient.featured_image ?? "",
    meta_title: ingredient.meta_title ?? "",
    meta_description: ingredient.meta_description ?? "",
    is_featured: ingredient.is_featured,
    product_ids: [],
  };
}

function formToPayload(form: IngredientFormState) {
  return {
    name: form.name,
    slug: form.slug || undefined,
    short_description: form.short_description || null,
    full_description: form.full_description || null,
    benefits: lines(form.benefits),
    side_effects: lines(form.side_effects),
    dosage: form.dosage || null,
    scientific_notes: form.scientific_notes || null,
    featured_image: form.featured_image || null,
    meta_title: form.meta_title || null,
    meta_description: form.meta_description || null,
    is_featured: form.is_featured,
    product_ids: form.product_ids,
  };
}

export function DashboardIngredientsClient() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<IngredientFormState>(emptyForm);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [ingredientResponse, productResponse] = await Promise.all([
        fetch("/api/ingredients", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const ingredientPayload = (await ingredientResponse.json()) as IngredientsResponse;
      const productPayload = (await productResponse.json()) as ProductsResponse;

      if (!ingredientResponse.ok) {
        throw new Error(ingredientPayload.error ?? "Unable to load ingredients.");
      }

      if (!productResponse.ok) {
        throw new Error(productPayload.error ?? "Unable to load products.");
      }

      setIngredients(ingredientPayload.ingredients ?? []);
      setProducts(productPayload.products ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load ingredients.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return ingredients;
    }

    return ingredients.filter((ingredient) =>
      [
        ingredient.name,
        ingredient.slug,
        ingredient.short_description ?? "",
        ingredient.meta_title ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [ingredients, search]);

  function updateForm<K extends keyof IngredientFormState>(
    key: K,
    value: IngredientFormState[K],
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function toggleProduct(productId: string) {
    setForm((currentForm) => ({
      ...currentForm,
      product_ids: currentForm.product_ids.includes(productId)
        ? currentForm.product_ids.filter((id) => id !== productId)
        : [...currentForm.product_ids, productId],
    }));
  }

  function openCreateForm() {
    setEditingIngredient(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function openEditForm(ingredient: Ingredient) {
    setEditingIngredient(ingredient);
    setForm(ingredientToForm(ingredient));
    setError("");
    setSuccess("");
    setIsFormOpen(true);

    try {
      const response = await fetch(`/api/ingredients/${ingredient.slug}`, { cache: "no-store" });
      const payload = (await response.json()) as IngredientsResponse;

      if (response.ok) {
        setForm((currentForm) => ({
          ...currentForm,
          product_ids: (payload.relatedProducts ?? []).map((product) => product.id),
        }));
      }
    } catch {
      // Related product selection is a form enhancement; the main edit form can still load.
    }
  }

  async function submitIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingIngredient ? `/api/ingredients/${editingIngredient.id}` : "/api/ingredients",
        {
          method: editingIngredient ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(form)),
        },
      );
      const payload = (await response.json()) as IngredientsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save ingredient.");
      }

      setSuccess(
        editingIngredient
          ? "Ingredient updated successfully."
          : "Ingredient created successfully.",
      );
      setIsFormOpen(false);
      setEditingIngredient(null);
      setForm(emptyForm);
      await fetchData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save ingredient.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteIngredient(ingredient: Ingredient) {
    const shouldDelete = window.confirm(`Delete ${ingredient.name}? This will soft delete it.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/ingredients/${ingredient.id}`, { method: "DELETE" });
      const payload = (await response.json()) as IngredientsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete ingredient.");
      }

      setSuccess("Ingredient deleted successfully.");
      await fetchData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete ingredient.");
    }
  }

  function exportIngredients() {
    const rows = [[...CSV_COLUMNS], ...ingredients.map(ingredientToCsvRow)];

    downloadCsv("suppriva-ingredients-export.csv", createCsv(rows));
  }

  function downloadSampleCsv() {
    const rows = [[...CSV_COLUMNS], ...sampleIngredientRows()];

    downloadCsv("ingredients-import-template.csv", createCsv(rows));
  }

  async function loadCurrentIngredients() {
    const response = await fetch("/api/ingredients", { cache: "no-store" });
    const payload = (await response.json()) as IngredientsResponse;

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to load existing ingredients.");
    }

    setIngredients(payload.ingredients ?? []);

    return payload.ingredients ?? [];
  }

  function validateImportRow(
    row: IngredientCsvRow,
    rowNumber: number,
    existingSlugs: Set<string>,
    importedSlugs: Set<string>,
  ) {
    const payload = csvRowToPayload(row);
    const errors: string[] = [];

    if (!payload.name) {
      errors.push("name is required");
    }

    if (!payload.slug) {
      errors.push("slug is required or name must generate one");
    }

    if (payload.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      errors.push("slug must use lowercase letters, numbers, and hyphens");
    }

    if (payload.slug && existingSlugs.has(payload.slug)) {
      errors.push(`slug "${payload.slug}" already exists`);
    }

    if (payload.slug && importedSlugs.has(payload.slug)) {
      errors.push(`duplicate slug "${payload.slug}" in CSV`);
    }

    if (errors.length) {
      return { payload, error: `Row ${rowNumber}: ${errors.join(", ")}.` };
    }

    importedSlugs.add(payload.slug);

    return { payload, error: "" };
  }

  async function importIngredientsCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setIsImporting(true);

    try {
      const text = await file.text();
      const { rows, errors } = parseIngredientCsv(text);

      if (errors.length) {
        throw new Error(errors.join(" "));
      }

      if (!rows.length) {
        throw new Error("CSV must include at least one ingredient row.");
      }

      const currentIngredients = await loadCurrentIngredients();
      const existingSlugs = new Set(currentIngredients.map((ingredient) => ingredient.slug));
      const importedSlugs = new Set<string>();
      let created = 0;
      const skipped: string[] = [];

      for (const [index, row] of rows.entries()) {
        const { payload, error: rowError } = validateImportRow(
          row,
          index + 2,
          existingSlugs,
          importedSlugs,
        );

        if (rowError) {
          skipped.push(rowError);
          continue;
        }

        const response = await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const responsePayload = (await response.json()) as IngredientsResponse;

        if (!response.ok) {
          skipped.push(`${payload.slug}: ${responsePayload.error ?? "Unable to import ingredient."}`);
          continue;
        }

        created += 1;
        existingSlugs.add(payload.slug);
      }

      await fetchData();
      setSuccess(`CSV import complete. Created: ${created}. Skipped: ${skipped.length}.`);

      if (skipped.length) {
        setError(skipped.slice(0, 8).join(" "));
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Unable to import CSV.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          ref={importInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => void importIngredientsCsv(event)}
          className="hidden"
        />
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
          <Search className="size-4 text-primary" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ingredients..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void fetchData()}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <FileDown className="size-4" />
            Sample CSV
          </button>
          <button
            type="button"
            onClick={exportIngredients}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <Download className="size-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
            Import CSV
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
          >
            <FlaskConical className="size-4" />
            Add Ingredient
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[20px] border border-primary/15 bg-soft-green px-4 py-3 text-sm font-medium text-primary">
          {success}
        </div>
      ) : null}

      <DashboardCard title="Ingredient Library">
        {isLoading ? (
          <div className="rounded-[24px] border border-border-light bg-cream p-10 text-center text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              Loading ingredients...
            </span>
          </div>
        ) : filteredIngredients.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-muted">
                  <th className="px-4 py-2">Ingredient</th>
                  <th className="px-4 py-2">Slug</th>
                  <th className="px-4 py-2">Featured</th>
                  <th className="px-4 py-2">Updated</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient) => (
                  <tr
                    key={ingredient.id}
                    className="rounded-[20px] bg-cream text-sm shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                  >
                    <td className="rounded-l-[20px] px-4 py-4">
                      <p className="font-heading font-semibold text-text-dark">{ingredient.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">
                        {ingredient.short_description || "No short description yet."}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-muted">{ingredient.slug}</td>
                    <td className="px-4 py-4">
                      {ingredient.is_featured ? (
                        <span className="inline-flex items-center gap-1.5 rounded-pill bg-gold/12 px-3 py-1.5 text-xs font-semibold text-text-dark">
                          <Star className="size-3.5 fill-gold text-gold" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {new Date(ingredient.updated_at).toLocaleDateString()}
                    </td>
                    <td className="rounded-r-[20px] px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void openEditForm(ingredient)}
                          className="rounded-pill border border-border-light bg-white p-2 text-primary transition hover:border-gold/70"
                          aria-label={`Edit ${ingredient.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteIngredient(ingredient)}
                          className="rounded-pill border border-red-200 bg-white p-2 text-red-600 transition hover:border-red-300 hover:bg-red-50"
                          aria-label={`Delete ${ingredient.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light bg-cream p-10 text-center text-sm text-muted">
            No ingredients found.
          </div>
        )}
      </DashboardCard>

      {isFormOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-border-light bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-text-dark">
                {editingIngredient ? "Edit Ingredient" : "Create Ingredient"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Add ingredient profile details, SEO metadata, and related products.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label="Close ingredient form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitIngredient} className="grid gap-4 lg:grid-cols-2">
            <InputField label="Name" value={form.name} onChange={(value) => updateForm("name", value)} required />
            <InputField label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} placeholder="auto-generated if empty" />
            <InputField label="Featured Image URL" value={form.featured_image} onChange={(value) => updateForm("featured_image", value)} />
            <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-light bg-white px-4">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => updateForm("is_featured", event.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="font-heading text-sm font-semibold text-text-dark">
                Featured ingredient
              </span>
            </label>
            <TextAreaField label="Short Description" value={form.short_description} onChange={(value) => updateForm("short_description", value)} />
            <TextAreaField label="Full Description" value={form.full_description} onChange={(value) => updateForm("full_description", value)} />
            <TextAreaField label="Benefits" value={form.benefits} onChange={(value) => updateForm("benefits", value)} placeholder="One benefit per line" />
            <TextAreaField label="Side Effects" value={form.side_effects} onChange={(value) => updateForm("side_effects", value)} placeholder="One consideration per line" />
            <TextAreaField label="Dosage" value={form.dosage} onChange={(value) => updateForm("dosage", value)} />
            <TextAreaField label="Scientific Notes" value={form.scientific_notes} onChange={(value) => updateForm("scientific_notes", value)} />
            <InputField label="Meta Title" value={form.meta_title} onChange={(value) => updateForm("meta_title", value)} />
            <TextAreaField label="Meta Description" value={form.meta_description} onChange={(value) => updateForm("meta_description", value)} />

            <div className="lg:col-span-2">
              <p className="font-heading text-sm font-semibold text-text-dark">
                Related Products
              </p>
              <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto rounded-[18px] border border-border-light bg-cream p-3 md:grid-cols-2">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 rounded-[14px] bg-white px-3 py-2 text-sm text-muted"
                  >
                    <input
                      type="checkbox"
                      checked={form.product_ids.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="size-4 accent-primary"
                    />
                    <span>{product.title || product.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingIngredient ? "Update Ingredient" : "Create Ingredient"}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-light px-6 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}
