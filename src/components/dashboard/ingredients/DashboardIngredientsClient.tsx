"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ContentStatus } from "@/lib/database/constants";
import type {
  FAQItem,
  Ingredient,
  IngredientSidebarQuickFact,
  JsonValue,
  Product,
} from "@/lib/database/types";
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
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Bold,
  Download,
  FileDown,
  FileUp,
  FlaskConical,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
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
  icon?: string;
  title: string;
  description: string;
};

type RelatedIngredientItem = {
  name: string;
  slug: string;
};

type SidebarQuickFactItem = IngredientSidebarQuickFact;

type IngredientFormState = {
  name: string;
  slug: string;
  status: ContentStatus;
  author_id: string;
  reviewer_id: string;
  scientific_name: string;
  ingredient_category: string;
  hero_badge: string;
  rating: string;
  evidence_level: string;
  origin_country: string;
  part_used: string;
  ingredient_form: string;
  taste_profile: string;
  typical_dose: string;
  best_for: string;
  safety_level: string;
  overview_title: string;
  overview_subtitle: string;
  short_description: string;
  full_description: string;
  overview_content: string;
  how_it_works_title: string;
  how_it_works_subtitle: string;
  how_it_works_highlight_title: string;
  how_it_works_highlight_description: string;
  how_it_works_content: string;
  interesting_fact_label: string;
  interesting_fact: string;
  benefits_title: string;
  benefits_subtitle: string;
  uses_title: string;
  uses_subtitle: string;
  uses_content: string;
  uses_json: TitleDescriptionItem[];
  food_sources_title: string;
  food_sources_subtitle: string;
  food_sources_content: string;
  food_sources_json: TitleDescriptionItem[];
  dosage_title: string;
  dosage_subtitle: string;
  dosage_content: string;
  safety_title: string;
  safety_subtitle: string;
  research_title: string;
  research_subtitle: string;
  research_content: string;
  research_json: TitleDescriptionItem[];
  references_title: string;
  references_subtitle: string;
  references_json: TitleDescriptionItem[];
  faq_title: string;
  faq_subtitle: string;
  sidebar_profile_title: string;
  sidebar_profile_content: string;
  sidebar_quick_facts_json: SidebarQuickFactItem[];
  sidebar_at_a_glance_content: string;
  benefits_json: TitleDescriptionItem[];
  side_effects_json: TitleDescriptionItem[];
  drug_interactions_json: string[];
  who_should_avoid_json: string[];
  faq_json: FAQItem[];
  related_ingredients_json: RelatedIngredientItem[];
  seo_title: string;
  seo_description: string;
  seo_focus_keyword: string;
  seo_canonical_url: string;
  seo_og_title: string;
  seo_og_description: string;
  seo_og_image: string;
  seo_twitter_title: string;
  seo_twitter_description: string;
  seo_twitter_image: string;
  meta_image: string;
  schema_json: string;
  seo_noindex: boolean;
  seo_nofollow: boolean;
  is_featured: boolean;
  product_ids: string[];
};

type IngredientsResponse = {
  ingredients?: Ingredient[];
  ingredient?: Ingredient;
  relatedProducts?: Product[];
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
  icon: "",
  title: "",
  description: "",
});

const emptyFaqItem = (): FAQItem => ({
  question: "",
  answer: "",
});

const emptySidebarQuickFactItem = (): SidebarQuickFactItem => ({
  label: "",
  value: "",
});

function parseSchemaJson(value: JsonValue | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "{}";
  }

  return JSON.stringify(value, null, 2);
}

const emptyForm: IngredientFormState = {
  name: "",
  slug: "",
  status: ContentStatus.Draft,
  author_id: "",
  reviewer_id: "",
  scientific_name: "",
  ingredient_category: "",
  hero_badge: "",
  rating: "",
  evidence_level: "",
  origin_country: "",
  part_used: "",
  ingredient_form: "",
  taste_profile: "",
  typical_dose: "",
  best_for: "",
  safety_level: "",
  overview_title: "",
  overview_subtitle: "",
  short_description: "",
  full_description: "",
  overview_content: "",
  how_it_works_title: "",
  how_it_works_subtitle: "",
  how_it_works_highlight_title: "",
  how_it_works_highlight_description: "",
  how_it_works_content: "",
  interesting_fact_label: "Interesting Fact",
  interesting_fact: "",
  benefits_title: "",
  benefits_subtitle: "",
  uses_title: "",
  uses_subtitle: "",
  uses_content: "",
  uses_json: [],
  food_sources_title: "",
  food_sources_subtitle: "",
  food_sources_content: "",
  food_sources_json: [],
  dosage_title: "",
  dosage_subtitle: "",
  dosage_content: "",
  safety_title: "",
  safety_subtitle: "",
  research_title: "",
  research_subtitle: "",
  research_content: "",
  research_json: [],
  references_title: "",
  references_subtitle: "",
  references_json: [],
  faq_title: "",
  faq_subtitle: "",
  sidebar_profile_title: "",
  sidebar_profile_content: "",
  sidebar_quick_facts_json: [],
  sidebar_at_a_glance_content: "",
  benefits_json: [],
  side_effects_json: [],
  drug_interactions_json: [],
  who_should_avoid_json: [],
  faq_json: [],
  related_ingredients_json: [],
  seo_title: "",
  seo_description: "",
  seo_focus_keyword: "",
  seo_canonical_url: "",
  seo_og_title: "",
  seo_og_description: "",
  seo_og_image: "",
  seo_twitter_title: "",
  seo_twitter_description: "",
  seo_twitter_image: "",
  meta_image: "",
  schema_json: "{}",
  seo_noindex: false,
  seo_nofollow: false,
  is_featured: false,
  product_ids: [],
};

function cleanText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
}

function isValidHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function serializeStringList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function hasDuplicateValues(values: string[]) {
  const normalizedValues = values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set(normalizedValues).size !== normalizedValues.length;
}

function moveArrayItem<TItem>(items: TItem[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);

  return nextItems;
}

function serializeTitleDescriptionItems(items: TitleDescriptionItem[]) {
  return items
    .map((item) => ({
      icon: item.icon?.trim() ?? "",
      title: item.title.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.title && item.description)
    .map((item) => (item.icon ? item : { title: item.title, description: item.description }));
}

function serializeFaqItems(items: FAQItem[]) {
  return items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function serializeSidebarQuickFacts(items: SidebarQuickFactItem[]) {
  return items
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .filter((item) => item.label && item.value);
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
          const icon = typeof item.icon === "string" ? item.icon : "";
          const title = typeof item.title === "string" ? item.title : "";
          const description = typeof item.description === "string" ? item.description : "";

          return { icon, title, description };
        }

        return null;
      })
      .filter(Boolean) as TitleDescriptionItem[];

    if (items.length) {
      return items;
    }
  }

  return fallback.map((item) => ({ icon: "", title: item, description: item }));
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

function parseSidebarQuickFacts(value: IngredientSidebarQuickFact[] | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      label: item.label ?? "",
      value: item.value ?? "",
    }))
    .filter((item) => item.label || item.value);
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
    author_id: ingredient.author_id ?? "",
    reviewer_id: ingredient.reviewer_id ?? "",
    scientific_name: ingredient.scientific_name ?? "",
    ingredient_category: ingredient.ingredient_category ?? "",
    hero_badge: ingredient.hero_badge ?? "",
    rating: ingredient.rating !== null ? String(ingredient.rating) : "",
    evidence_level: ingredient.evidence_level ?? "",
    origin_country: ingredient.origin_country ?? "",
    part_used: ingredient.part_used ?? "",
    ingredient_form: ingredient.ingredient_form ?? "",
    taste_profile: ingredient.taste_profile ?? "",
    typical_dose: ingredient.typical_dose ?? ingredient.dosage ?? "",
    best_for: ingredient.best_for ?? "",
    safety_level: ingredient.safety_level ?? "",
    overview_title: ingredient.overview_title ?? "",
    overview_subtitle: ingredient.overview_subtitle ?? "",
    short_description: ingredient.short_description ?? "",
    full_description: ingredient.full_description ?? "",
    overview_content: ingredient.overview_content ?? "",
    how_it_works_title: ingredient.how_it_works_title ?? "",
    how_it_works_subtitle: ingredient.how_it_works_subtitle ?? "",
    how_it_works_highlight_title: ingredient.how_it_works_highlight_title ?? "",
    how_it_works_highlight_description: ingredient.how_it_works_highlight_description ?? "",
    how_it_works_content: ingredient.how_it_works_content ?? ingredient.scientific_notes ?? "",
    interesting_fact_label: ingredient.interesting_fact_label ?? "Interesting Fact",
    interesting_fact: ingredient.interesting_fact ?? "",
    benefits_title: ingredient.benefits_title ?? "",
    benefits_subtitle: ingredient.benefits_subtitle ?? "",
    uses_title: ingredient.uses_title ?? "",
    uses_subtitle: ingredient.uses_subtitle ?? "",
    uses_content: ingredient.uses_content ?? "",
    uses_json: parseTitleDescriptionItems(ingredient.uses_json, []),
    food_sources_title: ingredient.food_sources_title ?? "",
    food_sources_subtitle: ingredient.food_sources_subtitle ?? "",
    food_sources_content: ingredient.food_sources_content ?? "",
    food_sources_json: parseTitleDescriptionItems(ingredient.food_sources_json, []),
    dosage_title: ingredient.dosage_title ?? "",
    dosage_subtitle: ingredient.dosage_subtitle ?? "",
    dosage_content: ingredient.dosage_content ?? ingredient.dosage ?? "",
    safety_title: ingredient.safety_title ?? "",
    safety_subtitle: ingredient.safety_subtitle ?? "",
    research_title: ingredient.research_title ?? "",
    research_subtitle: ingredient.research_subtitle ?? "",
    research_content: ingredient.research_content ?? "",
    research_json: parseTitleDescriptionItems(ingredient.research_json, []),
    references_title: ingredient.references_title ?? "",
    references_subtitle: ingredient.references_subtitle ?? "",
    references_json: parseTitleDescriptionItems(ingredient.references_json, []),
    faq_title: ingredient.faq_title ?? "",
    faq_subtitle: ingredient.faq_subtitle ?? "",
    sidebar_profile_title: ingredient.sidebar_profile_title ?? "",
    sidebar_profile_content: ingredient.sidebar_profile_content ?? "",
    sidebar_quick_facts_json: parseSidebarQuickFacts(ingredient.sidebar_quick_facts_json),
    sidebar_at_a_glance_content: ingredient.sidebar_at_a_glance_content ?? "",
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
    seo_focus_keyword: ingredient.seo_focus_keyword ?? "",
    seo_canonical_url: ingredient.seo_canonical_url ?? "",
    seo_og_title: ingredient.seo_og_title ?? "",
    seo_og_description: ingredient.seo_og_description ?? "",
    seo_og_image: ingredient.seo_og_image ?? "",
    seo_twitter_title: ingredient.seo_twitter_title ?? "",
    seo_twitter_description: ingredient.seo_twitter_description ?? "",
    seo_twitter_image: ingredient.seo_twitter_image ?? "",
    meta_image: ingredient.meta_image ?? "",
    schema_json: parseSchemaJson(ingredient.schema_json),
    seo_noindex: ingredient.seo_noindex ?? false,
    seo_nofollow: ingredient.seo_nofollow ?? false,
    is_featured: ingredient.is_featured,
    product_ids: [],
  };
}

function validateStructuredForm(form: IngredientFormState) {
  const errors: string[] = [];

  const invalidBenefits = form.benefits_json.some(
    (item) => !item.title.trim() || !item.description.trim(),
  );
  if (invalidBenefits) {
    errors.push("Each benefit needs both a title and description.");
  }

  if (hasDuplicateValues(form.benefits_json.map((item) => item.title))) {
    errors.push("Benefit titles must be unique.");
  }

  const invalidSideEffects = form.side_effects_json.some(
    (item) => !item.title.trim() && !item.description.trim(),
  );
  if (invalidSideEffects) {
    errors.push("Side effects cannot contain empty items.");
  }

  const sideEffectTexts = form.side_effects_json.map((item) => item.description || item.title);
  if (hasDuplicateValues(sideEffectTexts)) {
    errors.push("Side effects cannot contain duplicate items.");
  }

  if (form.drug_interactions_json.some((item) => !item.trim())) {
    errors.push("Drug interactions cannot contain empty items.");
  }

  if (hasDuplicateValues(form.drug_interactions_json)) {
    errors.push("Drug interactions cannot contain duplicate items.");
  }

  if (form.who_should_avoid_json.some((item) => !item.trim())) {
    errors.push("Who should avoid cannot contain empty items.");
  }

  if (hasDuplicateValues(form.who_should_avoid_json)) {
    errors.push("Who should avoid cannot contain duplicate items.");
  }

  const invalidFaqs = form.faq_json.some(
    (item) => (item.question.trim() || item.answer.trim()) && !(item.question.trim() && item.answer.trim()),
  );
  if (invalidFaqs) {
    errors.push("Each FAQ needs both a question and answer.");
  }

  const faqQuestions = form.faq_json
    .map((item) => item.question.trim().toLowerCase())
    .filter(Boolean);
  if (new Set(faqQuestions).size !== faqQuestions.length) {
    errors.push("FAQ questions must be unique.");
  }

  const invalidSidebarQuickFacts = form.sidebar_quick_facts_json.some(
    (item) => (item.label.trim() || item.value.trim()) && !(item.label.trim() && item.value.trim()),
  );
  if (invalidSidebarQuickFacts) {
    errors.push("Each sidebar quick fact needs both a label and value.");
  }

  const sidebarQuickFactLabels = form.sidebar_quick_facts_json
    .map((item) => item.label.trim().toLowerCase())
    .filter(Boolean);
  if (new Set(sidebarQuickFactLabels).size !== sidebarQuickFactLabels.length) {
    errors.push("Sidebar quick fact labels must be unique.");
  }

  if (form.seo_canonical_url.trim() && !isValidHttpUrl(form.seo_canonical_url.trim())) {
    errors.push("Canonical URL override must be a valid HTTP or HTTPS URL.");
  }

  try {
    JSON.parse(form.schema_json || "{}");
  } catch {
    errors.push("Schema JSON must be valid JSON.");
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
  const seoTitle = cleanText(form.seo_title);
  const seoDescription = cleanText(form.seo_description);
  const seoFocusKeyword = cleanText(form.seo_focus_keyword);
  const benefitsJson = serializeTitleDescriptionItems(form.benefits_json);
  const sideEffectsJson = serializeTitleDescriptionItems(form.side_effects_json);
  const howItWorksContent = cleanText(form.how_it_works_content);
  const overviewContent = cleanText(form.overview_content);
  const typicalDose = cleanText(form.typical_dose);
  let schemaJson: JsonValue = {};

  try {
    schemaJson = form.schema_json.trim() ? (JSON.parse(form.schema_json) as JsonValue) : {};
  } catch {
    schemaJson = {};
  }

  return {
    name: form.name.trim(),
    slug: normalizedSlug || undefined,
    status: form.status,
    author_id: form.author_id || null,
    reviewer_id: form.reviewer_id || null,
    scientific_name: cleanText(form.scientific_name),
    ingredient_category: cleanText(form.ingredient_category),
    hero_badge: cleanText(form.hero_badge),
    rating: form.rating.trim() ? Number(form.rating) : null,
    evidence_level: cleanText(form.evidence_level),
    origin_country: cleanText(form.origin_country),
    part_used: cleanText(form.part_used),
    ingredient_form: cleanText(form.ingredient_form),
    taste_profile: cleanText(form.taste_profile),
    typical_dose: typicalDose,
    best_for: cleanText(form.best_for),
    safety_level: cleanText(form.safety_level),
    overview_title: cleanText(form.overview_title),
    overview_subtitle: cleanText(form.overview_subtitle),
    short_description: cleanText(form.short_description),
    full_description: cleanText(form.full_description),
    overview_content: overviewContent,
    how_it_works_title: cleanText(form.how_it_works_title),
    how_it_works_subtitle: cleanText(form.how_it_works_subtitle),
    how_it_works_highlight_title: cleanText(form.how_it_works_highlight_title),
    how_it_works_highlight_description: cleanText(form.how_it_works_highlight_description),
    how_it_works_content: howItWorksContent,
    interesting_fact_label: cleanText(form.interesting_fact_label),
    interesting_fact: cleanText(form.interesting_fact),
    benefits_title: cleanText(form.benefits_title),
    benefits_subtitle: cleanText(form.benefits_subtitle),
    uses_title: cleanText(form.uses_title),
    uses_subtitle: cleanText(form.uses_subtitle),
    uses_content: cleanText(form.uses_content),
    uses_json: serializeTitleDescriptionItems(form.uses_json),
    food_sources_title: cleanText(form.food_sources_title),
    food_sources_subtitle: cleanText(form.food_sources_subtitle),
    food_sources_content: cleanText(form.food_sources_content),
    food_sources_json: serializeTitleDescriptionItems(form.food_sources_json),
    dosage_title: cleanText(form.dosage_title),
    dosage_subtitle: cleanText(form.dosage_subtitle),
    dosage_content: cleanText(form.dosage_content),
    safety_title: cleanText(form.safety_title),
    safety_subtitle: cleanText(form.safety_subtitle),
    research_title: cleanText(form.research_title),
    research_subtitle: cleanText(form.research_subtitle),
    research_content: cleanText(form.research_content),
    research_json: serializeTitleDescriptionItems(form.research_json),
    references_title: cleanText(form.references_title),
    references_subtitle: cleanText(form.references_subtitle),
    references_json: serializeTitleDescriptionItems(form.references_json),
    faq_title: cleanText(form.faq_title),
    faq_subtitle: cleanText(form.faq_subtitle),
    sidebar_profile_title: cleanText(form.sidebar_profile_title),
    sidebar_profile_content: cleanText(form.sidebar_profile_content),
    sidebar_quick_facts_json: serializeSidebarQuickFacts(form.sidebar_quick_facts_json),
    sidebar_at_a_glance_content: cleanText(form.sidebar_at_a_glance_content),
    benefits_json: benefitsJson,
    side_effects_json: sideEffectsJson,
    drug_interactions_json: serializeStringList(form.drug_interactions_json),
    who_should_avoid_json: serializeStringList(form.who_should_avoid_json),
    faq_json: serializeFaqItems(form.faq_json),
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_focus_keyword: seoFocusKeyword,
    seo_canonical_url: cleanText(form.seo_canonical_url),
    seo_og_title: cleanText(form.seo_og_title),
    seo_og_description: cleanText(form.seo_og_description),
    seo_og_image: cleanText(form.seo_og_image),
    seo_twitter_title: cleanText(form.seo_twitter_title),
    seo_twitter_description: cleanText(form.seo_twitter_description),
    seo_twitter_image: cleanText(form.seo_twitter_image),
    meta_image: cleanText(form.meta_image),
    seo_noindex: form.seo_noindex,
    seo_nofollow: form.seo_nofollow,
    schema_json: schemaJson,
    is_featured: form.is_featured,
    product_ids: form.product_ids,
    benefits: benefitsJson.map((item) => item.title),
    side_effects: sideEffectsJson.map((item) => item.title),
    dosage: typicalDose,
    scientific_notes: howItWorksContent || overviewContent,
    meta_title: seoTitle,
    meta_description: seoDescription,
  };
}

export function DashboardIngredientsClient() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
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
      const ingredientResponse = await fetch("/api/ingredients", { cache: "no-store" });
      const ingredientPayload = (await ingredientResponse.json()) as IngredientsResponse;

      if (!ingredientResponse.ok) {
        throw new Error(ingredientPayload.error ?? "Unable to load ingredients.");
      }

      setIngredients(ingredientPayload.ingredients ?? []);
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

  function moveListValue(
    key: "drug_interactions_json" | "who_should_avoid_json",
    index: number,
    direction: -1 | 1,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: moveArrayItem(currentForm[key], index, direction),
    }));
  }

  function updateTitleDescriptionItem(
    key:
      | "benefits_json"
      | "side_effects_json"
      | "uses_json"
      | "food_sources_json"
      | "research_json"
      | "references_json",
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

  function addTitleDescriptionItem(
    key:
      | "benefits_json"
      | "side_effects_json"
      | "uses_json"
      | "food_sources_json"
      | "research_json"
      | "references_json",
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: [...currentForm[key], emptyTitleDescriptionItem()],
    }));
  }

  function removeTitleDescriptionItem(
    key:
      | "benefits_json"
      | "side_effects_json"
      | "uses_json"
      | "food_sources_json"
      | "research_json"
      | "references_json",
    index: number,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: currentForm[key].filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function moveTitleDescriptionItem(
    key:
      | "benefits_json"
      | "side_effects_json"
      | "uses_json"
      | "food_sources_json"
      | "research_json"
      | "references_json",
    index: number,
    direction: -1 | 1,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: moveArrayItem(currentForm[key], index, direction),
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

  function moveFaqItem(index: number, direction: -1 | 1) {
    setForm((currentForm) => ({
      ...currentForm,
      faq_json: moveArrayItem(currentForm.faq_json, index, direction),
    }));
  }

  function removeFaqItem(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      faq_json: currentForm.faq_json.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateSidebarQuickFact(
    index: number,
    field: keyof SidebarQuickFactItem,
    value: string,
  ) {
    setForm((currentForm) => {
      const items = [...currentForm.sidebar_quick_facts_json];
      items[index] = { ...items[index], [field]: value };

      return {
        ...currentForm,
        sidebar_quick_facts_json: items,
      };
    });
  }

  function addSidebarQuickFact() {
    setForm((currentForm) => ({
      ...currentForm,
      sidebar_quick_facts_json: [
        ...currentForm.sidebar_quick_facts_json,
        emptySidebarQuickFactItem(),
      ],
    }));
  }

  function moveSidebarQuickFact(index: number, direction: -1 | 1) {
    setForm((currentForm) => ({
      ...currentForm,
      sidebar_quick_facts_json: moveArrayItem(
        currentForm.sidebar_quick_facts_json,
        index,
        direction,
      ),
    }));
  }

  function removeSidebarQuickFact(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      sidebar_quick_facts_json: currentForm.sidebar_quick_facts_json.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
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

      const { product_ids: ignoredProductIds, ...payload } = formToPayload({
        ...form,
        slug: normalizedSlug,
      });
      void ignoredProductIds;
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
      <div className="overflow-x-auto pb-1">
        <input
          ref={importInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => void importIngredientsCsv(event)}
          className="hidden"
        />
        <div className="flex min-w-max items-center gap-3">
          <div className="flex h-12 w-[320px] shrink-0 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <Search className="size-4 text-primary" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ingredients..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <label className="inline-flex h-12 w-[216px] shrink-0 items-center gap-2 rounded-pill border border-border-light bg-white px-4 text-sm font-medium text-text-dark shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <span className="text-muted">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | ContentStatus)}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-text-dark outline-none"
            >
              <option value="all">All</option>
              <option value={ContentStatus.Draft}>Draft</option>
              <option value={ContentStatus.Published}>Published</option>
              <option value={ContentStatus.Archived}>Archived</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <FileDown className="size-4" />
            Download Sample CSV
          </button>
          <button
            type="button"
            onClick={exportIngredients}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <Download className="size-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
            Import CSV
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
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
            <table className="w-full min-w-[900px] border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-muted">
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
                  const warnings =
                    ingredientQualitySummary.warningMap.get(ingredient.id) ?? [];

                  return (
                    <tr
                      key={ingredient.id}
                      className="rounded-[20px] bg-cream text-sm shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                    >
                      <td className="rounded-l-[20px] px-4 py-4">
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
            <FormSection title="Hero" description="Only the visible hero copy for the ingredient detail page.">
              <InputField label="Ingredient Name" value={form.name} onChange={(value) => updateTextField("name", value)} required />
              <InputField label="Scientific Name" value={form.scientific_name} onChange={(value) => updateTextField("scientific_name", value)} />
              <RichTextEditor
                label="Hero Description"
                value={form.short_description}
                onChange={(value) => updateTextField("short_description", value)}
                className="lg:col-span-2"
                rows={4}
              />
            </FormSection>

            <FormSection
              title="Overview"
              description="Section heading and long-form overview content."
            >
              <InputField label="Section Title" value={form.overview_title} onChange={(value) => updateTextField("overview_title", value)} />
              <InputField label="Section Subtitle" value={form.overview_subtitle} onChange={(value) => updateTextField("overview_subtitle", value)} />
              <RichTextEditor label="Overview Content" value={form.overview_content} onChange={(value) => updateTextField("overview_content", value)} className="lg:col-span-2" rows={6} />
            </FormSection>

            <FormSection
              title="Interesting Fact"
              description="Short educational callout shown near the overview."
            >
              <InputField label="Label" value={form.interesting_fact_label} onChange={(value) => updateTextField("interesting_fact_label", value)} />
              <RichTextEditor label="Interesting Fact Content" value={form.interesting_fact} onChange={(value) => updateTextField("interesting_fact", value)} className="lg:col-span-2" rows={3} />
            </FormSection>

            <FormSection
              title="How It Works"
              description="Mechanism education and highlighted explanation content."
            >
              <InputField label="Section Title" value={form.how_it_works_title} onChange={(value) => updateTextField("how_it_works_title", value)} />
              <InputField label="Section Subtitle" value={form.how_it_works_subtitle} onChange={(value) => updateTextField("how_it_works_subtitle", value)} />
              <InputField label="Highlight Card Title" value={form.how_it_works_highlight_title} onChange={(value) => updateTextField("how_it_works_highlight_title", value)} />
              <RichTextEditor label="Highlight Card Description" value={form.how_it_works_highlight_description} onChange={(value) => updateTextField("how_it_works_highlight_description", value)} rows={4} />
              <RichTextEditor label="How It Works Content" value={form.how_it_works_content} onChange={(value) => updateTextField("how_it_works_content", value)} className="lg:col-span-2" rows={5} />
            </FormSection>

            <FormSection
              title="Benefits"
              description="Benefits are editable repeatable CMS cards."
            >
              <InputField label="Section Title" value={form.benefits_title} onChange={(value) => updateTextField("benefits_title", value)} />
              <InputField label="Section Subtitle" value={form.benefits_subtitle} onChange={(value) => updateTextField("benefits_subtitle", value)} />
              <RepeatableTitleDescriptionField
                label="Benefits"
                items={form.benefits_json}
                addLabel="Add Benefit"
                emptyLabel="No benefits added yet."
                showIcon
                onAdd={() => addTitleDescriptionItem("benefits_json")}
                onRemove={(index) => removeTitleDescriptionItem("benefits_json", index)}
                onMove={(index, direction) => moveTitleDescriptionItem("benefits_json", index, direction)}
                onChange={(index, field, value) =>
                  updateTitleDescriptionItem("benefits_json", index, field, value)
                }
              />
            </FormSection>

            <FormSection
              title="Typical Dosage"
              description="Dosage section title, intro, and rich explanatory content."
            >
              <InputField label="Section Title" value={form.dosage_title} onChange={(value) => updateTextField("dosage_title", value)} />
              <InputField label="Section Subtitle" value={form.dosage_subtitle} onChange={(value) => updateTextField("dosage_subtitle", value)} />
              <RichTextEditor label="Dosage Content" value={form.dosage_content} onChange={(value) => updateTextField("dosage_content", value)} className="lg:col-span-2" rows={4} />
            </FormSection>

            <FormSection
              title="Safety Information"
              description="Safety heading plus the three public safety repeaters."
            >
              <InputField label="Section Title" value={form.safety_title} onChange={(value) => updateTextField("safety_title", value)} />
              <InputField label="Subtitle" value={form.safety_subtitle} onChange={(value) => updateTextField("safety_subtitle", value)} />
              <div className="grid gap-4 lg:col-span-2 xl:grid-cols-2">
                <RepeatableTextBackedField
                  label="Side Effects"
                  items={form.side_effects_json}
                  addLabel="Add Side Effect"
                  emptyLabel="No side effects added yet."
                  onAdd={() => addTitleDescriptionItem("side_effects_json")}
                  onRemove={(index) => removeTitleDescriptionItem("side_effects_json", index)}
                  onMove={(index, direction) => moveTitleDescriptionItem("side_effects_json", index, direction)}
                  onChange={(index, field, value) =>
                    updateTitleDescriptionItem("side_effects_json", index, field, value)
                  }
                />
                <RepeatableStringField
                  label="Drug Interactions"
                  items={form.drug_interactions_json}
                  addLabel="Add Interaction"
                  emptyLabel="No interactions added yet."
                  onAdd={() => addListValue("drug_interactions_json")}
                  onRemove={(index) => removeListValue("drug_interactions_json", index)}
                  onMove={(index, direction) => moveListValue("drug_interactions_json", index, direction)}
                  onChange={(index, value) => updateListValue("drug_interactions_json", index, value)}
                />
              </div>
              <RepeatableStringField
                label="Who Should Avoid"
                items={form.who_should_avoid_json}
                addLabel="Add Avoidance Note"
                emptyLabel="No avoidance notes added yet."
                onAdd={() => addListValue("who_should_avoid_json")}
                onRemove={(index) => removeListValue("who_should_avoid_json", index)}
                onMove={(index, direction) => moveListValue("who_should_avoid_json", index, direction)}
                onChange={(index, value) => updateListValue("who_should_avoid_json", index, value)}
              />
            </FormSection>

            <FormSection title="FAQ" description="Questions and answers shown in the public FAQ accordion.">
              <div className="lg:col-span-2">
                <RepeatableFaqField
                  items={form.faq_json}
                  onAdd={addFaqItem}
                  onRemove={removeFaqItem}
                  onMove={moveFaqItem}
                  onChange={updateFaqItem}
                />
              </div>
            </FormSection>

            <FormSection title="Sidebar" description="Profile snapshot, quick facts, and at-a-glance signals.">
              <InputField
                label="Profile Snapshot Title"
                value={form.sidebar_profile_title}
                onChange={(value) => updateTextField("sidebar_profile_title", value)}
                placeholder="Profile Snapshot"
              />
              <RichTextEditor
                label="Profile Snapshot Content"
                value={form.sidebar_profile_content}
                onChange={(value) => updateTextField("sidebar_profile_content", value)}
                className="lg:col-span-2"
                rows={4}
              />
              <div className="lg:col-span-2">
                <RepeatableQuickFactField
                  items={form.sidebar_quick_facts_json}
                  onAdd={addSidebarQuickFact}
                  onRemove={removeSidebarQuickFact}
                  onMove={moveSidebarQuickFact}
                  onChange={updateSidebarQuickFact}
                />
              </div>
              <RichTextEditor
                label="At A Glance Content"
                value={form.sidebar_at_a_glance_content}
                onChange={(value) => updateTextField("sidebar_at_a_glance_content", value)}
                className="lg:col-span-2"
                rows={4}
              />
            </FormSection>

            <FormSection
              title="Advanced SEO"
              description="Control search metadata for this ingredient page."
            >
              <InputField
                label="SEO Title"
                value={form.seo_title}
                onChange={(value) => updateTextField("seo_title", value)}
              />
              <InputField
                label="Focus Keyword"
                value={form.seo_focus_keyword}
                onChange={(value) => updateTextField("seo_focus_keyword", value)}
              />
              <TextAreaField
                label="SEO Description"
                value={form.seo_description}
                onChange={(value) => updateTextField("seo_description", value)}
                className="lg:col-span-2"
                rows={3}
              />
              <InputField
                label="Canonical URL Override"
                value={form.seo_canonical_url}
                onChange={(value) => updateTextField("seo_canonical_url", value)}
                placeholder="https://suppriva.vercel.app/ingredient/example"
                className="lg:col-span-2"
              />
              <div className="grid gap-3 lg:col-span-2 md:grid-cols-2">
                <CheckboxField
                  label="No Index"
                  checked={form.seo_noindex}
                  onChange={(value) => updateTextField("seo_noindex", value)}
                />
                <CheckboxField
                  label="No Follow"
                  checked={form.seo_nofollow}
                  onChange={(value) => updateTextField("seo_nofollow", value)}
                />
              </div>
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

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-light bg-white px-4 text-sm font-semibold text-text-dark">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
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

function RichTextEditor({
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function insertMarkup(prefix: string, suffix = prefix, fallback = "text") {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${prefix}${selectedText}${suffix}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    });
  }

  function insertBulletList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "List item";
    const listText = selectedText
      .split("\n")
      .map((line) => `- ${line.replace(/^[-*]\s*/, "")}`)
      .join("\n");

    onChange(`${value.slice(0, start)}${listText}${value.slice(end)}`);
  }

  function insertNumberedList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "List item";
    const listText = selectedText
      .split("\n")
      .map((line, index) => `${index + 1}. ${line.replace(/^\d+[.)]\s*/, "")}`)
      .join("\n");

    onChange(`${value.slice(0, start)}${listText}${value.slice(end)}`);
  }

  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <div className="overflow-hidden rounded-[18px] border border-border-light bg-white focus-within:border-gold/80 focus-within:ring-4 focus-within:ring-gold/10">
        <div className="flex flex-wrap gap-2 border-b border-border-light bg-cream/50 px-3 py-2">
          <EditorButton label="Bold" onClick={() => insertMarkup("**", "**", "bold text")}>
            <Bold className="size-4" />
          </EditorButton>
          <EditorButton label="Italic" onClick={() => insertMarkup("*", "*", "italic text")}>
            <Italic className="size-4" />
          </EditorButton>
          <EditorButton label="Heading" onClick={() => insertMarkup("## ", "", "Heading")}>
            <Heading2 className="size-4" />
          </EditorButton>
          <EditorButton label="Bullet list" onClick={insertBulletList}>
            <List className="size-4" />
          </EditorButton>
          <EditorButton label="Numbered list" onClick={insertNumberedList}>
            <ListOrdered className="size-4" />
          </EditorButton>
          <EditorButton label="Link" onClick={() => insertMarkup("[", "](https://example.com)", "link text")}>
            <LinkIcon className="size-4" />
          </EditorButton>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y border-0 bg-white px-4 py-3 text-sm text-text-dark outline-none placeholder:text-muted/70"
        />
      </div>
    </label>
  );
}

function EditorButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border-light bg-white text-primary transition hover:border-gold/70 hover:bg-soft-green"
    >
      {children}
    </button>
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
  showIcon = false,
  onAdd,
  onRemove,
  onMove,
  onChange,
}: {
  label: string;
  items: TitleDescriptionItem[];
  addLabel: string;
  emptyLabel: string;
  showIcon?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (index: number, direction: -1 | 1) => void;
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
              <div className="mb-2 flex justify-end gap-2">
                {onMove ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onMove(index, -1)}
                      disabled={index === 0}
                      className="rounded-full border border-border-light p-1.5 text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${label} item ${index + 1} up`}
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(index, 1)}
                      disabled={index === items.length - 1}
                      className="rounded-full border border-border-light p-1.5 text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${label} item ${index + 1} down`}
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </>
                ) : null}
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
                {showIcon ? (
                  <InputField
                    label="Icon"
                    value={item.icon ?? ""}
                    onChange={(value) => onChange(index, "icon", value)}
                    placeholder="shield-check"
                  />
                ) : null}
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

function RepeatableTextBackedField({
  label,
  items,
  addLabel,
  emptyLabel,
  onAdd,
  onRemove,
  onMove,
  onChange,
}: {
  label: string;
  items: TitleDescriptionItem[];
  addLabel: string;
  emptyLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (index: number, direction: -1 | 1) => void;
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
            <div key={`${label}-${index}`} className="flex items-start gap-2">
              <div className="flex-1">
                <TextAreaField
                  label={`${label} ${index + 1}`}
                  value={item.description || item.title}
                  onChange={(value) => {
                    onChange(index, "title", value);
                    onChange(index, "description", value);
                  }}
                  rows={3}
                />
              </div>
              {onMove ? (
                <div className="mt-7 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    className="rounded-full border border-border-light p-2 text-primary transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Move ${label} item ${index + 1} up`}
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded-full border border-border-light p-2 text-primary transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Move ${label} item ${index + 1} down`}
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              ) : null}
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

function RepeatableStringField({
  label,
  items,
  addLabel,
  emptyLabel,
  onAdd,
  onRemove,
  onMove,
  onChange,
}: {
  label: string;
  items: string[];
  addLabel: string;
  emptyLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (index: number, direction: -1 | 1) => void;
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
              {onMove ? (
                <div className="mt-7 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    className="rounded-full border border-border-light p-2 text-primary transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Move ${label} item ${index + 1} up`}
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded-full border border-border-light p-2 text-primary transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Move ${label} item ${index + 1} down`}
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              ) : null}
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
  onMove,
  onChange,
}: {
  items: FAQItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
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
              <div className="mb-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="rounded-full border border-border-light p-1.5 text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move FAQ ${index + 1} up`}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-full border border-border-light p-1.5 text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move FAQ ${index + 1} down`}
                >
                  <ArrowDown className="size-3.5" />
                </button>
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

function RepeatableQuickFactField({
  items,
  onAdd,
  onRemove,
  onMove,
  onChange,
}: {
  items: SidebarQuickFactItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onChange: (index: number, field: keyof SidebarQuickFactItem, value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-border-light bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-heading text-sm font-semibold text-text-dark">Quick Facts</h4>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-pill border border-border-light px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-gold/70"
        >
          <Plus className="size-3.5" />
          Add Fact
        </button>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={`sidebar-quick-fact-${index}`}
              className="rounded-[18px] border border-border-light bg-cream p-3"
            >
              <div className="mb-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="rounded-full border border-border-light p-1.5 text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move quick fact ${index + 1} up`}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-full border border-border-light p-1.5 text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move quick fact ${index + 1} down`}
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-full border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                  aria-label={`Remove quick fact ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InputField
                  label="Label"
                  value={item.label}
                  onChange={(value) => onChange(index, "label", value)}
                />
                <InputField
                  label="Value"
                  value={item.value}
                  onChange={(value) => onChange(index, "value", value)}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No sidebar quick facts added yet.</p>
        )}
      </div>
    </div>
  );
}
