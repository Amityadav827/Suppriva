import type { Ingredient, Product } from "@/lib/database/types";
import { ContentStatus } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  IngredientCreateInput,
  IngredientUpdateInput,
} from "@/lib/validators/ingredient.validator";
import type { SlugRepository } from "./base.repository";

export interface IngredientsRepository extends SlugRepository<Ingredient> {
  getAllIngredients(): Promise<Ingredient[]>;
  getPublishedIngredients(): Promise<Ingredient[]>;
  getIngredientById(id: string): Promise<Ingredient | null>;
  getIngredientBySlug(slug: string): Promise<Ingredient | null>;
  getPublishedIngredientBySlug(slug: string): Promise<Ingredient | null>;
  createIngredient(input: IngredientCreateInput): Promise<Ingredient>;
  bulkCreateIngredients(inputs: IngredientCreateInput[]): Promise<Ingredient[]>;
  updateIngredient(id: string, input: IngredientUpdateInput): Promise<Ingredient>;
  deleteIngredient(id: string): Promise<void>;
  searchIngredients(query: string): Promise<Ingredient[]>;
  searchPublishedIngredients(query: string): Promise<Ingredient[]>;
  getFeaturedIngredients(): Promise<Ingredient[]>;
  getRelatedProductsForIngredient(ingredientId: string): Promise<Product[]>;
  getIngredientsForProduct(productId: string): Promise<Ingredient[]>;
  replaceProductRelationships(ingredientId: string, productIds: string[]): Promise<void>;
}

function isMissingIngredientsTable(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    error?.message?.includes("ingredients") && error.message.includes("schema cache")
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchesIngredientToProduct(product: Product, ingredient: Ingredient) {
  const ingredientTerms = new Set(
    [ingredient.name, ingredient.scientific_name ?? "", ingredient.slug]
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean),
  );

  return (product.ingredients ?? []).some((productIngredient) => {
    const ingredientName = (productIngredient.name ?? "").trim();
    const ingredientSlug = slugify(ingredientName);
    const haystack = [
      ingredientName,
      productIngredient.description ?? "",
      productIngredient.amount ?? "",
      ingredientSlug,
    ]
      .join(" ")
      .toLowerCase();

    return (
      ingredientTerms.has(ingredientSlug) ||
      [...ingredientTerms].some((term) => haystack.includes(term))
    );
  });
}

export class SupabaseIngredientsRepository implements IngredientsRepository {
  async getAllIngredients(): Promise<Ingredient[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      if (isMissingIngredientsTable(error)) return [];
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async getPublishedIngredients(): Promise<Ingredient[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      if (isMissingIngredientsTable(error)) return [];
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async getIngredientById(id: string): Promise<Ingredient | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      if (isMissingIngredientsTable(error)) return null;
      throw new DatabaseError(error.message);
    }

    return (data as Ingredient | null) ?? null;
  }

  async getIngredientBySlug(slug: string): Promise<Ingredient | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      if (isMissingIngredientsTable(error)) return null;
      throw new DatabaseError(error.message);
    }

    return (data as Ingredient | null) ?? null;
  }

  async getPublishedIngredientBySlug(slug: string): Promise<Ingredient | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("slug", slug)
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      if (isMissingIngredientsTable(error)) return null;
      throw new DatabaseError(error.message);
    }

    return (data as Ingredient | null) ?? null;
  }

  async createIngredient(input: IngredientCreateInput): Promise<Ingredient> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Ingredient;
  }

  async bulkCreateIngredients(inputs: IngredientCreateInput[]): Promise<Ingredient[]> {
    if (!inputs.length) {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .insert(inputs.map((input) => this.toDatabaseInput(input)))
      .select("*");

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async updateIngredient(id: string, input: IngredientUpdateInput): Promise<Ingredient> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .update(this.toDatabaseInput(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Ingredient;
  }

  async deleteIngredient(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("ingredients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  async searchIngredients(query: string): Promise<Ingredient[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return this.getAllIngredients();
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .is("deleted_at", null)
      .or(
        `name.ilike.%${normalizedQuery}%,slug.ilike.%${normalizedQuery}%,scientific_name.ilike.%${normalizedQuery}%,ingredient_category.ilike.%${normalizedQuery}%,short_description.ilike.%${normalizedQuery}%,full_description.ilike.%${normalizedQuery}%`,
      )
      .order("name", { ascending: true });

    if (error) {
      if (isMissingIngredientsTable(error)) return [];
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async searchPublishedIngredients(query: string): Promise<Ingredient[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return this.getPublishedIngredients();
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .or(
        `name.ilike.%${normalizedQuery}%,slug.ilike.%${normalizedQuery}%,scientific_name.ilike.%${normalizedQuery}%,ingredient_category.ilike.%${normalizedQuery}%,short_description.ilike.%${normalizedQuery}%,full_description.ilike.%${normalizedQuery}%`,
      )
      .order("name", { ascending: true });

    if (error) {
      if (isMissingIngredientsTable(error)) return [];
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async getFeaturedIngredients(): Promise<Ingredient[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("is_featured", true)
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      if (isMissingIngredientsTable(error)) return [];
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async getRelatedProductsForIngredient(ingredientId: string): Promise<Product[]> {
    const supabase = await createSupabaseServerClient();
    const ingredient = await this.getIngredientById(ingredientId);

    if (!ingredient) {
      return [];
    }

    const { data: relations, error: relationError } = await supabase
      .from("product_ingredients")
      .select("product_id")
      .eq("ingredient_id", ingredientId);

    if (relationError) {
      if (isMissingIngredientsTable(relationError)) return [];
      throw new DatabaseError(relationError.message);
    }

    const relatedProductIds = (relations ?? [])
      .map((relation) => relation.product_id)
      .filter(Boolean) as string[];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    const publishedProducts = (data ?? []) as Product[];
    const relatedProductIdSet = new Set(relatedProductIds);
    const automatedMatches = publishedProducts.filter((product) =>
      matchesIngredientToProduct(product, ingredient),
    );

    return publishedProducts.filter(
      (product) => relatedProductIdSet.has(product.id) || automatedMatches.some((item) => item.id === product.id),
    );
  }

  async getIngredientsForProduct(productId: string): Promise<Ingredient[]> {
    const supabase = await createSupabaseServerClient();
    const { data: relations, error: relationError } = await supabase
      .from("product_ingredients")
      .select("ingredient_id")
      .eq("product_id", productId);

    if (relationError) {
      if (isMissingIngredientsTable(relationError)) return [];
      throw new DatabaseError(relationError.message);
    }

    const ingredientIds = (relations ?? [])
      .map((relation) => relation.ingredient_id)
      .filter(Boolean) as string[];

    if (!ingredientIds.length) {
      return [];
    }

    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .in("id", ingredientIds)
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      if (isMissingIngredientsTable(error)) return [];
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Ingredient[];
  }

  async replaceProductRelationships(ingredientId: string, productIds: string[]) {
    const supabase = await createSupabaseServerClient();
    const { error: deleteError } = await supabase
      .from("product_ingredients")
      .delete()
      .eq("ingredient_id", ingredientId);

    if (deleteError) {
      throw new DatabaseError(deleteError.message);
    }

    const uniqueProductIds = [...new Set(productIds)];

    if (!uniqueProductIds.length) {
      return;
    }

    const rows = uniqueProductIds.map((productId) => ({
      ingredient_id: ingredientId,
      product_id: productId,
    }));
    const { error } = await supabase.from("product_ingredients").insert(rows);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  getAll(): Promise<Ingredient[]> {
    return this.getAllIngredients();
  }

  getById(id: string): Promise<Ingredient | null> {
    return this.getIngredientById(id);
  }

  getBySlug(slug: string): Promise<Ingredient | null> {
    return this.getIngredientBySlug(slug);
  }

  create(input: IngredientCreateInput): Promise<Ingredient> {
    return this.createIngredient(input);
  }

  update(id: string, input: IngredientUpdateInput): Promise<Ingredient> {
    return this.updateIngredient(id, input);
  }

  delete(id: string): Promise<void> {
    return this.deleteIngredient(id);
  }

  private toDatabaseInput(input: IngredientCreateInput | IngredientUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("name" in input) payload.name = input.name;
    if ("slug" in input) payload.slug = input.slug;
    if ("author_id" in input) payload.author_id = input.author_id ?? null;
    if ("reviewer_id" in input) payload.reviewer_id = input.reviewer_id ?? null;
    if ("status" in input) payload.status = input.status ?? ContentStatus.Draft;
    if ("scientific_name" in input) payload.scientific_name = input.scientific_name ?? null;
    if ("ingredient_category" in input) {
      payload.ingredient_category = input.ingredient_category ?? null;
    }
    if ("hero_badge" in input) payload.hero_badge = input.hero_badge ?? null;
    if ("short_description" in input) {
      payload.short_description = input.short_description ?? null;
    }
    if ("full_description" in input) payload.full_description = input.full_description ?? null;
    if ("image_url" in input) payload.image_url = input.image_url ?? null;
    if ("rating" in input) payload.rating = input.rating ?? null;
    if ("evidence_level" in input) payload.evidence_level = input.evidence_level ?? null;
    if ("origin_country" in input) payload.origin_country = input.origin_country ?? null;
    if ("part_used" in input) payload.part_used = input.part_used ?? null;
    if ("ingredient_form" in input) payload.ingredient_form = input.ingredient_form ?? null;
    if ("taste_profile" in input) payload.taste_profile = input.taste_profile ?? null;
    if ("typical_dose" in input) payload.typical_dose = input.typical_dose ?? null;
    if ("best_for" in input) payload.best_for = input.best_for ?? null;
    if ("safety_level" in input) payload.safety_level = input.safety_level ?? null;
    if ("overview_title" in input) payload.overview_title = input.overview_title ?? null;
    if ("overview_subtitle" in input) payload.overview_subtitle = input.overview_subtitle ?? null;
    if ("overview_content" in input) payload.overview_content = input.overview_content ?? null;
    if ("how_it_works_title" in input) {
      payload.how_it_works_title = input.how_it_works_title ?? null;
    }
    if ("how_it_works_subtitle" in input) {
      payload.how_it_works_subtitle = input.how_it_works_subtitle ?? null;
    }
    if ("how_it_works_content" in input) {
      payload.how_it_works_content = input.how_it_works_content ?? null;
    }
    if ("interesting_fact" in input) payload.interesting_fact = input.interesting_fact ?? null;
    if ("benefits_title" in input) payload.benefits_title = input.benefits_title ?? null;
    if ("benefits_subtitle" in input) payload.benefits_subtitle = input.benefits_subtitle ?? null;
    if ("uses_title" in input) payload.uses_title = input.uses_title ?? null;
    if ("uses_subtitle" in input) payload.uses_subtitle = input.uses_subtitle ?? null;
    if ("uses_content" in input) payload.uses_content = input.uses_content ?? null;
    if ("uses_json" in input) payload.uses_json = input.uses_json ?? [];
    if ("food_sources_title" in input) payload.food_sources_title = input.food_sources_title ?? null;
    if ("food_sources_subtitle" in input) payload.food_sources_subtitle = input.food_sources_subtitle ?? null;
    if ("food_sources_content" in input) payload.food_sources_content = input.food_sources_content ?? null;
    if ("food_sources_json" in input) payload.food_sources_json = input.food_sources_json ?? [];
    if ("dosage_title" in input) payload.dosage_title = input.dosage_title ?? null;
    if ("dosage_subtitle" in input) payload.dosage_subtitle = input.dosage_subtitle ?? null;
    if ("dosage_content" in input) payload.dosage_content = input.dosage_content ?? null;
    if ("safety_title" in input) payload.safety_title = input.safety_title ?? null;
    if ("safety_subtitle" in input) payload.safety_subtitle = input.safety_subtitle ?? null;
    if ("research_title" in input) payload.research_title = input.research_title ?? null;
    if ("research_subtitle" in input) payload.research_subtitle = input.research_subtitle ?? null;
    if ("research_content" in input) payload.research_content = input.research_content ?? null;
    if ("research_json" in input) payload.research_json = input.research_json ?? [];
    if ("references_title" in input) payload.references_title = input.references_title ?? null;
    if ("references_subtitle" in input) payload.references_subtitle = input.references_subtitle ?? null;
    if ("references_json" in input) payload.references_json = input.references_json ?? [];
    if ("faq_title" in input) payload.faq_title = input.faq_title ?? null;
    if ("faq_subtitle" in input) payload.faq_subtitle = input.faq_subtitle ?? null;
    if ("benefits" in input) payload.benefits = input.benefits ?? [];
    if ("side_effects" in input) payload.side_effects = input.side_effects ?? [];
    if ("dosage" in input) payload.dosage = input.dosage ?? null;
    if ("scientific_notes" in input) payload.scientific_notes = input.scientific_notes ?? null;
    if ("benefits_json" in input) payload.benefits_json = input.benefits_json ?? [];
    if ("side_effects_json" in input) payload.side_effects_json = input.side_effects_json ?? [];
    if ("drug_interactions_json" in input) {
      payload.drug_interactions_json = input.drug_interactions_json ?? [];
    }
    if ("who_should_avoid_json" in input) {
      payload.who_should_avoid_json = input.who_should_avoid_json ?? [];
    }
    if ("faq_json" in input) payload.faq_json = input.faq_json ?? [];
    if ("related_ingredients_json" in input) {
      payload.related_ingredients_json = input.related_ingredients_json ?? [];
    }
    if ("featured_image" in input) payload.featured_image = input.featured_image ?? null;
    if ("meta_title" in input) payload.meta_title = input.meta_title ?? null;
    if ("meta_description" in input) payload.meta_description = input.meta_description ?? null;
    if ("seo_title" in input) payload.seo_title = input.seo_title ?? null;
    if ("seo_description" in input) payload.seo_description = input.seo_description ?? null;
    if ("seo_canonical_url" in input) payload.seo_canonical_url = input.seo_canonical_url ?? null;
    if ("seo_og_title" in input) payload.seo_og_title = input.seo_og_title ?? null;
    if ("seo_og_description" in input) {
      payload.seo_og_description = input.seo_og_description ?? null;
    }
    if ("seo_og_image" in input) payload.seo_og_image = input.seo_og_image ?? null;
    if ("seo_twitter_title" in input) {
      payload.seo_twitter_title = input.seo_twitter_title ?? null;
    }
    if ("seo_twitter_description" in input) {
      payload.seo_twitter_description = input.seo_twitter_description ?? null;
    }
    if ("seo_twitter_image" in input) {
      payload.seo_twitter_image = input.seo_twitter_image ?? null;
    }
    if ("meta_image" in input) payload.meta_image = input.meta_image ?? null;
    if ("seo_noindex" in input) payload.seo_noindex = input.seo_noindex ?? false;
    if ("seo_nofollow" in input) payload.seo_nofollow = input.seo_nofollow ?? false;
    if ("schema_json" in input) payload.schema_json = input.schema_json ?? {};
    if ("ingredient_layout_sections" in input) {
      payload.ingredient_layout_sections = input.ingredient_layout_sections ?? [];
    }
    if ("is_featured" in input) payload.is_featured = input.is_featured ?? false;

    return payload;
  }
}
