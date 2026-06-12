"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ContentStatus } from "@/lib/database/constants";
import type { FAQItem, Ingredient, JsonValue, Product } from "@/lib/database/types";
import {
  INGREDIENT_CSV_COLUMNS,
  INGREDIENT_IMPORT_BATCH_SIZE,
  createCsv,
  csvRowToIngredientPayload,
  ingredientToCsvRow,
  parseIngredientCsv,
  slugify,
} from "@/lib/ingredients/csv";
import { getIngredientQualityWarnings } from "@/lib/ingredients/data-quality";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Download,
  FileDown,
  FileUp,
  FlaskConical,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type TitleDescriptionItem = {
  title: string;
  description: string;
};

type RelatedIngredientItem = {
  name: string;
  slug: string;
};

type IngredientFormState = {
  name: string;
  slug: string;
  status: ContentStatus;
  scientific_name: string;
  ingredient_category: string;
  image_url: string;
  rating: string;
  evidence_level: string;
  origin_country: string;
  part_used: string;
  ingredient_form: string;
  taste_profile: string;
  typical_dose: string;
  best_for: string;
  safety_level: string;
  short_description: string;
  full_description: string;
  overview_content: string;
  how_it_works_content: string;
  interesting_fact: string;
  benefits_json: TitleDescriptionItem[];
  side_effects_json: TitleDescriptionItem[];
  drug_interactions_json: string[];
  who_should_avoid_json: string[];
  faq_json: FAQItem[];
  related_ingredients_json: RelatedIngredientItem[];
  seo_title: string;
  seo_description: string;
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

type IngredientImportSummary = {
  totalRows: number;
  batchesProcessed: number;
  created: number;
  skipped: number;
  conflicts: number;
  validationErrors: number;
  warnings: number;
};

type IngredientImportIssue = {
  rowNumber: number;
  slug: string | null;
  message?: string;
  warnings?: string[];
};

type IngredientImportResponse = {
  summary?: IngredientImportSummary;
  errors?: IngredientImportIssue[];
  warnings?: IngredientImportIssue[];
  error?: string;
};

const emptyTitleDescriptionItem = (): TitleDescriptionItem => ({
  title: "",
  description: "",
});

const emptyFaqItem = (): FAQItem => ({
  question: "",
  answer: "",
});

const emptyRelatedIngredientItem = (): RelatedIngredientItem => ({
  name: "",
  slug: "",
});

const emptyForm: IngredientFormState = {
  name: "",
  slug: "",
  status: ContentStatus.Draft,
  scientific_name: "",
  ingredient_category: "",
  image_url: "",
  rating: "",
  evidence_level: "",
  origin_country: "",
  part_used: "",
  ingredient_form: "",
  taste_profile: "",
  typical_dose: "",
  best_for: "",
  safety_level: "",
  short_description: "",
  full_description: "",
  overview_content: "",
  how_it_works_content: "",
  interesting_fact: "",
  benefits_json: [],
  side_effects_json: [],
  drug_interactions_json: [],
  who_should_avoid_json: [],
  faq_json: [],
  related_ingredients_json: [],
  seo_title: "",
  seo_description: "",
  is_featured: false,
  product_ids: [],
};

function cleanText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
}

function serializeStringList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function serializeTitleDescriptionItems(items: TitleDescriptionItem[]) {
  return items
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.title && item.description);
}

function serializeFaqItems(items: FAQItem[]) {
  return items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function serializeRelatedIngredients(items: RelatedIngredientItem[]) {
  return items
    .map((item) => {
      const name = item.name.trim();
      const slug = item.slug.trim() || (name ? slugify(name) : "");

      return { name, slug };
    })
    .filter((item) => item.name);
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

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTitleDescriptionItems(value: JsonValue[] | undefined, fallback: string[]) {
  if (Array.isArray(value) && value.length) {
    const items = value
      .map((item) => {
        if (isRecord(item)) {
          const title = typeof item.title === "string" ? item.title : "";
          const description = typeof item.description === "string" ? item.description : "";

          return { title, description };
        }

        return null;
      })
      .filter(Boolean) as TitleDescriptionItem[];

    if (items.length) {
      return items;
    }
  }

  return fallback.map((item) => ({ title: item, description: "" }));
}

function parseStringItems(value: JsonValue[] | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

function parseFaqItems(value: FAQItem[] | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      question: item.question ?? "",
      answer: item.answer ?? "",
    }))
    .filter((item) => item.question || item.answer);
}

function parseRelatedIngredients(value: JsonValue[] | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (isRecord(item)) {
        return {
          name: typeof item.name === "string" ? item.name : "",
          slug: typeof item.slug === "string" ? item.slug : "",
        };
      }

      return null;
    })
    .filter(Boolean) as RelatedIngredientItem[];
}

function ingredientToForm(ingredient: Ingredient): IngredientFormState {
  return {
    name: ingredient.name,
    slug: ingredient.slug,
    status: ingredient.status ?? ContentStatus.Draft,
    scientific_name: ingredient.scientific_name ?? "",
    ingredient_category: ingredient.ingredient_category ?? "",
    image_url: ingredient.image_url ?? ingredient.featured_image ?? "",
    rating: ingredient.rating !== null ? String(ingredient.rating) : "",
    evidence_level: ingredient.evidence_level ?? "",
    origin_country: ingredient.origin_country ?? "",
    part_used: ingredient.part_used ?? "",
    ingredient_form: ingredient.ingredient_form ?? "",
    taste_profile: ingredient.taste_profile ?? "",
    typical_dose: ingredient.typical_dose ?? ingredient.dosage ?? "",
    best_for: ingredient.best_for ?? "",
    safety_level: ingredient.safety_level ?? "",
    short_description: ingredient.short_description ?? "",
    full_description: ingredient.full_description ?? "",
    overview_content: ingredient.overview_content ?? "",
    how_it_works_content: ingredient.how_it_works_content ?? ingredient.scientific_notes ?? "",
    interesting_fact: ingredient.interesting_fact ?? "",
    benefits_json: parseTitleDescriptionItems(ingredient.benefits_json, ingredient.benefits),
    side_effects_json: parseTitleDescriptionItems(
      ingredient.side_effects_json,
      ingredient.side_effects,
    ),
    drug_interactions_json: parseStringItems(ingredient.drug_interactions_json),
    who_should_avoid_json: parseStringItems(ingredient.who_should_avoid_json),
    faq_json: parseFaqItems(ingredient.faq_json),
    related_ingredients_json: parseRelatedIngredients(ingredient.related_ingredients_json),
    seo_title: ingredient.seo_title ?? ingredient.meta_title ?? "",
    seo_description: ingredient.seo_description ?? ingredient.meta_description ?? "",
    is_featured: ingredient.is_featured,
    product_ids: [],
  };
}

function validateStructuredForm(form: IngredientFormState) {
  const errors: string[] = [];

  const invalidBenefits = form.benefits_json.some(
    (item) => (item.title.trim() || item.description.trim()) && !(item.title.trim() && item.description.trim()),
  );
  if (invalidBenefits) {
    errors.push("Each benefit needs both a title and description.");
  }

  const invalidSideEffects = form.side_effects_json.some(
    (item) => (item.title.trim() || item.description.trim()) && !(item.title.trim() && item.description.trim()),
  );
  if (invalidSideEffects) {
    errors.push("Each side effect needs both a title and description.");
  }

  const invalidFaqs = form.faq_json.some(
    (item) => (item.question.trim() || item.answer.trim()) && !(item.question.trim() && item.answer.trim()),
  );
  if (invalidFaqs) {
    errors.push("Each FAQ needs both a question and answer.");
  }

  const invalidRelatedIngredients = form.related_ingredients_json.some(
    (item) => (item.name.trim() || item.slug.trim()) && !item.name.trim(),
  );
  if (invalidRelatedIngredients) {
    errors.push("Related ingredients need a name.");
  }

  return errors;
}

async function getRelatedProductIdsForIngredient(slug: string) {
  try {
    const response = await fetch(`/api/ingredients/${slug}`, { cache: "no-store" });
    const payload = (await response.json()) as IngredientsResponse;

    if (!response.ok) {
      return [];
    }

    return (payload.relatedProducts ?? []).map((product) => product.id);
  } catch {
    return [];
  }
}

function formToPayload(form: IngredientFormState) {
  const normalizedSlug = form.slug.trim() || slugify(form.name);
  const primaryImage = cleanText(form.image_url);
  const seoTitle = cleanText(form.seo_title);
  const seoDescription = cleanText(form.seo_description);
  const benefitsJson = serializeTitleDescriptionItems(form.benefits_json);
  const sideEffectsJson = serializeTitleDescriptionItems(form.side_effects_json);
  const howItWorksContent = cleanText(form.how_it_works_content);
  const overviewContent = cleanText(form.overview_content);
  const typicalDose = cleanText(form.typical_dose);

  return {
    name: form.name.trim(),
    slug: normalizedSlug || undefined,
    status: form.status,
    scientific_name: cleanText(form.scientific_name),
    ingredient_category: cleanText(form.ingredient_category),
    image_url: primaryImage,
    rating: form.rating.trim() ? Number(form.rating) : null,
    evidence_level: cleanText(form.evidence_level),
    origin_country: cleanText(form.origin_country),
    part_used: cleanText(form.part_used),
    ingredient_form: cleanText(form.ingredient_form),
    taste_profile: cleanText(form.taste_profile),
    typical_dose: typicalDose,
    best_for: cleanText(form.best_for),
    safety_level: cleanText(form.safety_level),
    short_description: cleanText(form.short_description),
    full_description: cleanText(form.full_description),
    overview_content: overviewContent,
    how_it_works_content: howItWorksContent,
    interesting_fact: cleanText(form.interesting_fact),
    benefits_json: benefitsJson,
    side_effects_json: sideEffectsJson,
    drug_interactions_json: serializeStringList(form.drug_interactions_json),
    who_should_avoid_json: serializeStringList(form.who_should_avoid_json),
    faq_json: serializeFaqItems(form.faq_json),
    related_ingredients_json: serializeRelatedIngredients(form.related_ingredients_json),
    seo_title: seoTitle,
    seo_description: seoDescription,
    is_featured: form.is_featured,
    product_ids: form.product_ids,
    benefits: benefitsJson.map((item) => item.title),
    side_effects: sideEffectsJson.map((item) => item.title),
    dosage: typicalDose,
    scientific_notes: howItWorksContent || overviewContent,
    featured_image: primaryImage,
    meta_title: seoTitle,
    meta_description: seoDescription,
  };
}

export function DashboardIngredientsClient() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<IngredientFormState>(emptyForm);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContentStatus>("all");
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importSummary, setImportSummary] = useState<IngredientImportSummary | null>(null);
  const [importIssues, setImportIssues] = useState<IngredientImportIssue[]>([]);

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
    return ingredients.filter((ingredient) => {
      const matchesStatus =
        statusFilter === "all" ? true : ingredient.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        ingredient.name,
        ingredient.scientific_name ?? "",
        ingredient.slug,
        ingredient.ingredient_category ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [ingredients, search, statusFilter]);

  const ingredientQualitySummary = useMemo(() => {
    const warningMap = new Map<string, string[]>();
    let ingredientsWithWarnings = 0;

    for (const ingredient of ingredients) {
      const warnings = getIngredientQualityWarnings(ingredient);
      warningMap.set(ingredient.id, warnings);

      if (warnings.length) {
        ingredientsWithWarnings += 1;
      }
    }

    return { warningMap, ingredientsWithWarnings };
  }, [ingredients]);

  const publishWarnings = useMemo(() => {
    if (form.status !== ContentStatus.Published) {
      return [];
    }

    return getIngredientQualityWarnings(formToPayload(form));
  }, [form]);

  function updateForm<K extends keyof IngredientFormState>(
    key: K,
    value: IngredientFormState[K],
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function updateTextField<K extends keyof IngredientFormState>(
    key: K,
    value: IngredientFormState[K],
  ) {
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [key]: value };

      if (key === "name") {
        const nameValue = typeof value === "string" ? value : "";
        if (!currentForm.slug.trim()) {
          nextForm.slug = slugify(nameValue);
        }
      }

      return nextForm;
    });
  }

  function updateListValue(
    key: "drug_interactions_json" | "who_should_avoid_json",
    index: number,
    value: string,
  ) {
    setForm((currentForm) => {
      const items = [...currentForm[key]];
      items[index] = value;

      return {
        ...currentForm,
        [key]: items,
      };
    });
  }

  function addListValue(key: "drug_interactions_json" | "who_should_avoid_json") {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: [...currentForm[key], ""],
    }));
  }

  function removeListValue(
    key: "drug_interactions_json" | "who_should_avoid_json",
    index: number,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: currentForm[key].filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateTitleDescriptionItem(
    key: "benefits_json" | "side_effects_json",
    index: number,
    field: keyof TitleDescriptionItem,
    value: string,
  ) {
    setForm((currentForm) => {
      const items = [...currentForm[key]];
      items[index] = { ...items[index], [field]: value };

      return {
        ...currentForm,
        [key]: items,
      };
    });
  }

  function addTitleDescriptionItem(key: "benefits_json" | "side_effects_json") {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: [...currentForm[key], emptyTitleDescriptionItem()],
    }));
  }

  function removeTitleDescriptionItem(
    key: "benefits_json" | "side_effects_json",
    index: number,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: currentForm[key].filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateFaqItem(index: number, field: keyof FAQItem, value: string) {
    setForm((currentForm) => {
      const items = [...currentForm.faq_json];
      items[index] = { ...items[index], [field]: value };

      return {
        ...currentForm,
        faq_json: items,
      };
    });
  }

  function addFaqItem() {
    setForm((currentForm) => ({
      ...currentForm,
      faq_json: [...currentForm.faq_json, emptyFaqItem()],
    }));
  }

  function removeFaqItem(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      faq_json: currentForm.faq_json.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateRelatedIngredientItem(
    index: number,
    field: keyof RelatedIngredientItem,
    value: string,
  ) {
    setForm((currentForm) => {
      const items = [...currentForm.related_ingredients_json];
      items[index] = { ...items[index], [field]: value };

      if (field === "name" && !items[index].slug.trim()) {
        items[index].slug = slugify(value);
      }

      return {
        ...currentForm,
        related_ingredients_json: items,
      };
    });
  }

  function addRelatedIngredientItem() {
    setForm((currentForm) => ({
      ...currentForm,
      related_ingredients_json: [...currentForm.related_ingredients_json, emptyRelatedIngredientItem()],
    }));
  }

  function removeRelatedIngredientItem(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      related_ingredients_json: currentForm.related_ingredients_json.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
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
      // Related products can fail independently without blocking edit mode.
    }
  }

  async function submitIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const normalizedSlug = form.slug.trim() || slugify(form.name);
      const structuredErrors = validateStructuredForm(form);

      if (!form.name.trim()) {
        throw new Error("Ingredient name is required.");
      }

      if (!normalizedSlug) {
        throw new Error("Ingredient slug is required.");
      }

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
        throw new Error("Ingredient slug must use lowercase letters, numbers, and hyphens.");
      }

      const duplicateIngredient = ingredients.find(
        (ingredient) =>
          ingredient.slug === normalizedSlug &&
          ingredient.id !== editingIngredient?.id,
      );

      if (duplicateIngredient) {
        throw new Error(`An ingredient with slug "${normalizedSlug}" already exists.`);
      }

      if (structuredErrors.length) {
        throw new Error(structuredErrors.join(" "));
      }

      const payload = formToPayload({ ...form, slug: normalizedSlug });
      const response = await fetch(
        editingIngredient ? `/api/ingredients/${editingIngredient.id}` : "/api/ingredients",
        {
          method: editingIngredient ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const responsePayload = (await response.json()) as IngredientsResponse;

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Unable to save ingredient.");
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

  async function exportIngredients() {
    setError("");
    setSuccess("");

    try {
      const relatedProductsByIngredientId = new Map(
        await Promise.all(
          ingredients.map(async (ingredient) => [
            ingredient.id,
            await getRelatedProductIdsForIngredient(ingredient.slug),
          ] as const),
        ),
      );

      const rows = [
        [...INGREDIENT_CSV_COLUMNS],
        ...ingredients.map((ingredient) =>
          ingredientToCsvRow(
            ingredient,
            relatedProductsByIngredientId.get(ingredient.id) ?? [],
          ),
        ),
      ];

      downloadCsv("suppriva-ingredients-export.csv", createCsv(rows));
      setSuccess("Ingredients exported successfully.");
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export ingredients.",
      );
    }
  }

  function downloadSampleCsv() {
    const link = document.createElement("a");
    link.href = "/templates/ingredients-master-template.csv";
    link.download = "ingredients-master-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function importIngredientsCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setImportSummary(null);
    setImportIssues([]);
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

      const preflightErrors: string[] = [];
      for (const [index, row] of rows.entries()) {
        const result = csvRowToIngredientPayload(row);
        if (result.errors.length) {
          preflightErrors.push(`Row ${index + 2}: ${result.errors.join(" ")}`);
        }
      }

      if (preflightErrors.length) {
        throw new Error(preflightErrors.slice(0, 12).join(" "));
      }

      const batches: typeof rows[] = [];
      for (let index = 0; index < rows.length; index += INGREDIENT_IMPORT_BATCH_SIZE) {
        batches.push(rows.slice(index, index + INGREDIENT_IMPORT_BATCH_SIZE));
      }

      let combinedSummary: IngredientImportSummary = {
        totalRows: rows.length,
        batchesProcessed: 0,
        created: 0,
        skipped: 0,
        conflicts: 0,
        validationErrors: 0,
        warnings: 0,
      };
      const issues: IngredientImportIssue[] = [];

      for (const [batchIndex, batch] of batches.entries()) {
        setSuccess(
          `Importing ingredient batch ${batchIndex + 1} of ${batches.length}...`,
        );

        const response = await fetch("/api/ingredients/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: batch.map((row, rowIndex) => ({
              rowNumber: batchIndex * INGREDIENT_IMPORT_BATCH_SIZE + rowIndex + 2,
              row,
            })),
          }),
        });
        const responsePayload = (await response.json()) as IngredientImportResponse;

        if (!response.ok) {
          throw new Error(responsePayload.error ?? "Unable to import ingredient CSV.");
        }

        combinedSummary = {
          totalRows: rows.length,
          batchesProcessed:
            combinedSummary.batchesProcessed + (responsePayload.summary?.batchesProcessed ?? 0),
          created: combinedSummary.created + (responsePayload.summary?.created ?? 0),
          skipped: combinedSummary.skipped + (responsePayload.summary?.skipped ?? 0),
          conflicts: combinedSummary.conflicts + (responsePayload.summary?.conflicts ?? 0),
          validationErrors:
            combinedSummary.validationErrors +
            (responsePayload.summary?.validationErrors ?? 0),
          warnings: combinedSummary.warnings + (responsePayload.summary?.warnings ?? 0),
        };
        issues.push(...(responsePayload.errors ?? []), ...(responsePayload.warnings ?? []));
      }

      await fetchData();
      setImportSummary(combinedSummary);
      setImportIssues(issues);
      setSuccess(
        `CSV import complete. Created ${combinedSummary.created} ingredients across ${combinedSummary.batchesProcessed} batches.`,
      );

      if (issues.length) {
        setError(
          issues
            .slice(0, 10)
            .map((issue) =>
              issue.message
                ? `Row ${issue.rowNumber}: ${issue.message}`
                : `Row ${issue.rowNumber}: ${(issue.warnings ?? []).join(", ")}`
            )
            .join(" "),
        );
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
        <label className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 text-sm font-medium text-text-dark shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <span className="text-muted">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | ContentStatus)}
            className="bg-transparent text-sm font-semibold text-text-dark outline-none"
          >
            <option value="all">All</option>
            <option value={ContentStatus.Draft}>Draft</option>
            <option value={ContentStatus.Published}>Published</option>
            <option value={ContentStatus.Archived}>Archived</option>
          </select>
        </label>
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
            Download Sample CSV
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
      {importSummary ? (
        <div className="grid gap-3 rounded-[24px] border border-border-light bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Imported</p>
            <p className="mt-1 font-heading text-2xl font-bold text-text-dark">
              {importSummary.created}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Skipped</p>
            <p className="mt-1 font-heading text-2xl font-bold text-text-dark">
              {importSummary.skipped}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Conflicts</p>
            <p className="mt-1 font-heading text-2xl font-bold text-text-dark">
              {importSummary.conflicts}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Quality Warnings</p>
            <p className="mt-1 font-heading text-2xl font-bold text-text-dark">
              {importSummary.warnings}
            </p>
          </div>
          {importIssues.length ? (
            <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:col-span-4">
              <p className="font-semibold">Import summary details</p>
              <ul className="mt-2 space-y-1">
                {importIssues.slice(0, 12).map((issue, index) => (
                  <li key={`${issue.rowNumber}-${issue.slug ?? index}`}>
                    Row {issue.rowNumber}:{" "}
                    {issue.message || (issue.warnings ?? []).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <DashboardCard title="Ingredient Library">
        {ingredientQualitySummary.ingredientsWithWarnings ? (
          <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              {ingredientQualitySummary.ingredientsWithWarnings} ingredients still need SEO or content enrichment.
            </span>
          </div>
        ) : null}
        {isLoading ? (
          <div className="rounded-[24px] border border-border-light bg-cream p-10 text-center text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              Loading ingredients...
            </span>
          </div>
        ) : filteredIngredients.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-muted">
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Scientific Name</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Warnings</th>
                  <th className="px-4 py-2">Updated</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient) => {
                  const image = ingredient.image_url ?? ingredient.featured_image;
                  const warnings =
                    ingredientQualitySummary.warningMap.get(ingredient.id) ?? [];

                  return (
                    <tr
                      key={ingredient.id}
                      className="rounded-[20px] bg-cream text-sm shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                    >
                      <td className="rounded-l-[20px] px-4 py-4">
                        <div
                          className="grid h-14 w-14 place-items-center rounded-[18px] border border-border-light bg-white bg-cover bg-center text-[10px] font-bold uppercase tracking-[0.14em] text-primary"
                          style={image ? { backgroundImage: `url("${image}")` } : undefined}
                        >
                          {image ? <span className="sr-only">{ingredient.name}</span> : "ING"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-heading font-semibold text-text-dark">{ingredient.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span>{ingredient.slug}</span>
                            {ingredient.is_featured ? (
                              <span className="inline-flex items-center gap-1 rounded-pill bg-gold/12 px-2 py-1 font-semibold text-text-dark">
                                <Star className="size-3 fill-gold text-gold" />
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {ingredient.scientific_name || "Not added"}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {ingredient.ingredient_category || "Uncategorized"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={ingredient.status} />
                      </td>
                      <td className="px-4 py-4">
                        {warnings.length ? (
                          <div className="space-y-2">
                            <span className="inline-flex items-center gap-1 rounded-pill bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              <AlertTriangle className="size-3" />
                              {warnings.length} warning{warnings.length > 1 ? "s" : ""}
                            </span>
                            <p className="text-xs text-muted">{warnings.join(" • ")}</p>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-primary">Complete</span>
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
                  );
                })}
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
                Manage complete ingredient data for the upcoming premium detail page.
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

          <form onSubmit={submitIngredient} className="space-y-6">
            <FormSection
              title="Basic Information"
              description="Core identity and primary image data."
            >
              <InputField label="Name" value={form.name} onChange={(value) => updateTextField("name", value)} required />
              <InputField label="Slug" value={form.slug} onChange={(value) => updateTextField("slug", slugify(value))} required />
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => updateForm("status", value as ContentStatus)}
                options={[
                  { label: "Draft", value: ContentStatus.Draft },
                  { label: "Published", value: ContentStatus.Published },
                  { label: "Archived", value: ContentStatus.Archived },
                ]}
              />
              <InputField label="Scientific Name" value={form.scientific_name} onChange={(value) => updateTextField("scientific_name", value)} />
              <InputField label="Ingredient Category" value={form.ingredient_category} onChange={(value) => updateTextField("ingredient_category", value)} />
              <InputField label="Image URL" value={form.image_url} onChange={(value) => updateTextField("image_url", value)} className="lg:col-span-2" />
            </FormSection>

            <FormSection
              title="Hero Section"
              description="High-level authority signals shown above the fold."
            >
              <InputField label="Rating" value={form.rating} onChange={(value) => updateTextField("rating", value)} placeholder="4.8" />
              <InputField label="Evidence Level" value={form.evidence_level} onChange={(value) => updateTextField("evidence_level", value)} placeholder="Moderate" />
              <InputField label="Origin Country" value={form.origin_country} onChange={(value) => updateTextField("origin_country", value)} />
              <InputField label="Part Used" value={form.part_used} onChange={(value) => updateTextField("part_used", value)} />
              <InputField label="Ingredient Form" value={form.ingredient_form} onChange={(value) => updateTextField("ingredient_form", value)} placeholder="Extract, powder, oil" />
              <InputField label="Taste Profile" value={form.taste_profile} onChange={(value) => updateTextField("taste_profile", value)} />
            </FormSection>

            <FormSection
              title="Quick Facts"
              description="Fast-scan detail cards and summary badges."
            >
              <InputField label="Typical Dose" value={form.typical_dose} onChange={(value) => updateTextField("typical_dose", value)} />
              <InputField label="Best For" value={form.best_for} onChange={(value) => updateTextField("best_for", value)} />
              <InputField label="Safety Level" value={form.safety_level} onChange={(value) => updateTextField("safety_level", value)} />
              <ToggleField
                label="Featured Ingredient"
                checked={form.is_featured}
                onChange={(checked) => updateForm("is_featured", checked)}
              />
            </FormSection>

            <FormSection
              title="Content"
              description="Editorial blocks for the premium ingredient page."
            >
              <TextAreaField label="Short Description" value={form.short_description} onChange={(value) => updateTextField("short_description", value)} />
              <TextAreaField label="Full Description" value={form.full_description} onChange={(value) => updateTextField("full_description", value)} />
              <TextAreaField label="Overview Content" value={form.overview_content} onChange={(value) => updateTextField("overview_content", value)} className="lg:col-span-2" rows={5} />
              <TextAreaField label="How It Works Content" value={form.how_it_works_content} onChange={(value) => updateTextField("how_it_works_content", value)} className="lg:col-span-2" rows={5} />
              <TextAreaField label="Interesting Fact" value={form.interesting_fact} onChange={(value) => updateTextField("interesting_fact", value)} className="lg:col-span-2" rows={3} />
            </FormSection>

            <FormSection
              title="Structured Sections"
              description="Repeatable content blocks without raw JSON editing."
            >
              <div className="grid gap-4 lg:col-span-2 xl:grid-cols-2">
                <RepeatableTitleDescriptionField
                  label="Benefits"
                  items={form.benefits_json}
                  addLabel="Add Benefit"
                  emptyLabel="No benefits added yet."
                  onAdd={() => addTitleDescriptionItem("benefits_json")}
                  onRemove={(index) => removeTitleDescriptionItem("benefits_json", index)}
                  onChange={(index, field, value) =>
                    updateTitleDescriptionItem("benefits_json", index, field, value)
                  }
                />
                <RepeatableTitleDescriptionField
                  label="Side Effects"
                  items={form.side_effects_json}
                  addLabel="Add Side Effect"
                  emptyLabel="No side effects added yet."
                  onAdd={() => addTitleDescriptionItem("side_effects_json")}
                  onRemove={(index) => removeTitleDescriptionItem("side_effects_json", index)}
                  onChange={(index, field, value) =>
                    updateTitleDescriptionItem("side_effects_json", index, field, value)
                  }
                />
              </div>
              <div className="grid gap-4 lg:col-span-2 xl:grid-cols-2">
                <RepeatableStringField
                  label="Drug Interactions"
                  items={form.drug_interactions_json}
                  addLabel="Add Interaction"
                  emptyLabel="No interactions added yet."
                  onAdd={() => addListValue("drug_interactions_json")}
                  onRemove={(index) => removeListValue("drug_interactions_json", index)}
                  onChange={(index, value) => updateListValue("drug_interactions_json", index, value)}
                />
                <RepeatableStringField
                  label="Who Should Avoid"
                  items={form.who_should_avoid_json}
                  addLabel="Add Avoidance Note"
                  emptyLabel="No avoidance notes added yet."
                  onAdd={() => addListValue("who_should_avoid_json")}
                  onRemove={(index) => removeListValue("who_should_avoid_json", index)}
                  onChange={(index, value) => updateListValue("who_should_avoid_json", index, value)}
                />
              </div>
              <div className="lg:col-span-2">
                <RepeatableFaqField
                  items={form.faq_json}
                  onAdd={addFaqItem}
                  onRemove={removeFaqItem}
                  onChange={updateFaqItem}
                />
              </div>
              <div className="lg:col-span-2">
                <RepeatableRelatedIngredientsField
                  items={form.related_ingredients_json}
                  onAdd={addRelatedIngredientItem}
                  onRemove={removeRelatedIngredientItem}
                  onChange={updateRelatedIngredientItem}
                />
              </div>
            </FormSection>

            <FormSection
              title="SEO"
              description="New SEO fields are mirrored to legacy metadata for backward compatibility."
            >
              <InputField label="SEO Title" value={form.seo_title} onChange={(value) => updateTextField("seo_title", value)} className="lg:col-span-2" />
              <TextAreaField label="SEO Description" value={form.seo_description} onChange={(value) => updateTextField("seo_description", value)} className="lg:col-span-2" />
            </FormSection>

            {publishWarnings.length ? (
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-semibold">
                  Publishing warning: this ingredient is still missing a few quality signals.
                </p>
                <p className="mt-1">
                  {publishWarnings.join(" • ")}. Publishing is still allowed, but the profile may feel incomplete on the public site.
                </p>
              </div>
            ) : null}

            <FormSection
              title="Related Products"
              description="Existing product relationships continue working unchanged."
            >
              <div className="lg:col-span-2">
                <div className="grid max-h-56 gap-2 overflow-y-auto rounded-[18px] border border-border-light bg-cream p-3 md:grid-cols-2">
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
            </FormSection>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-border-light bg-cream/55 p-4 md:p-5">
      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-text-dark">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
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
  rows = 4,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-light bg-white px-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
    </label>
  );
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const palette =
    status === ContentStatus.Published
      ? "bg-soft-green text-primary"
      : status === ContentStatus.Archived
        ? "bg-slate-200 text-slate-700"
        : "bg-amber-100 text-amber-800";

  return (
    <span className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-semibold capitalize ${palette}`}>
      {status}
    </span>
  );
}

function RepeatableTitleDescriptionField({
  label,
  items,
  addLabel,
  emptyLabel,
  onAdd,
  onRemove,
  onChange,
}: {
  label: string;
  items: TitleDescriptionItem[];
  addLabel: string;
  emptyLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof TitleDescriptionItem, value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-border-light bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-heading text-sm font-semibold text-text-dark">{label}</h4>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-pill border border-border-light px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-gold/70"
        >
          <Plus className="size-3.5" />
          {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${label}-${index}`} className="rounded-[18px] border border-border-light bg-cream p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-full border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                  aria-label={`Remove ${label} item ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="grid gap-3">
                <InputField
                  label="Title"
                  value={item.title}
                  onChange={(value) => onChange(index, "title", value)}
                />
                <TextAreaField
                  label="Description"
                  value={item.description}
                  onChange={(value) => onChange(index, "description", value)}
                  rows={3}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function RepeatableStringField({
  label,
  items,
  addLabel,
  emptyLabel,
  onAdd,
  onRemove,
  onChange,
}: {
  label: string;
  items: string[];
  addLabel: string;
  emptyLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-border-light bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-heading text-sm font-semibold text-text-dark">{label}</h4>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-pill border border-border-light px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-gold/70"
        >
          <Plus className="size-3.5" />
          {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${label}-${index}`} className="flex items-start gap-2">
              <div className="flex-1">
                <InputField
                  label={`${label} ${index + 1}`}
                  value={item}
                  onChange={(value) => onChange(index, value)}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-7 rounded-full border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function RepeatableFaqField({
  items,
  onAdd,
  onRemove,
  onChange,
}: {
  items: FAQItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof FAQItem, value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-border-light bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-heading text-sm font-semibold text-text-dark">FAQs</h4>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-pill border border-border-light px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-gold/70"
        >
          <Plus className="size-3.5" />
          Add FAQ
        </button>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`faq-${index}`} className="rounded-[18px] border border-border-light bg-cream p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-full border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                  aria-label={`Remove FAQ ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="grid gap-3">
                <InputField
                  label="Question"
                  value={item.question}
                  onChange={(value) => onChange(index, "question", value)}
                />
                <TextAreaField
                  label="Answer"
                  value={item.answer}
                  onChange={(value) => onChange(index, "answer", value)}
                  rows={3}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No FAQs added yet.</p>
        )}
      </div>
    </div>
  );
}

function RepeatableRelatedIngredientsField({
  items,
  onAdd,
  onRemove,
  onChange,
}: {
  items: RelatedIngredientItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof RelatedIngredientItem, value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-border-light bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-heading text-sm font-semibold text-text-dark">Related Ingredients</h4>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-pill border border-border-light px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-gold/70"
        >
          <Plus className="size-3.5" />
          Add Related Ingredient
        </button>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`related-${index}`} className="rounded-[18px] border border-border-light bg-cream p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-full border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                  aria-label={`Remove related ingredient ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InputField
                  label="Name"
                  value={item.name}
                  onChange={(value) => onChange(index, "name", value)}
                />
                <InputField
                  label="Slug"
                  value={item.slug}
                  onChange={(value) => onChange(index, "slug", slugify(value))}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No related ingredients added yet.</p>
        )}
      </div>
    </div>
  );
}
