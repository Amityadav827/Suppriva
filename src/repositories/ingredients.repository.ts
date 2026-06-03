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
  getIngredientById(id: string): Promise<Ingredient | null>;
  getIngredientBySlug(slug: string): Promise<Ingredient | null>;
  createIngredient(input: IngredientCreateInput): Promise<Ingredient>;
  updateIngredient(id: string, input: IngredientUpdateInput): Promise<Ingredient>;
  deleteIngredient(id: string): Promise<void>;
  searchIngredients(query: string): Promise<Ingredient[]>;
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
        `name.ilike.%${normalizedQuery}%,slug.ilike.%${normalizedQuery}%,short_description.ilike.%${normalizedQuery}%`,
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
    const { data: relations, error: relationError } = await supabase
      .from("product_ingredients")
      .select("product_id")
      .eq("ingredient_id", ingredientId);

    if (relationError) {
      if (isMissingIngredientsTable(relationError)) return [];
      throw new DatabaseError(relationError.message);
    }

    const productIds = (relations ?? [])
      .map((relation) => relation.product_id)
      .filter(Boolean) as string[];

    if (!productIds.length) {
      return [];
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("status", ContentStatus.Published)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Product[];
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
    if ("short_description" in input) {
      payload.short_description = input.short_description ?? null;
    }
    if ("full_description" in input) payload.full_description = input.full_description ?? null;
    if ("benefits" in input) payload.benefits = input.benefits ?? [];
    if ("side_effects" in input) payload.side_effects = input.side_effects ?? [];
    if ("dosage" in input) payload.dosage = input.dosage ?? null;
    if ("scientific_notes" in input) payload.scientific_notes = input.scientific_notes ?? null;
    if ("featured_image" in input) payload.featured_image = input.featured_image ?? null;
    if ("meta_title" in input) payload.meta_title = input.meta_title ?? null;
    if ("meta_description" in input) payload.meta_description = input.meta_description ?? null;
    if ("is_featured" in input) payload.is_featured = input.is_featured ?? false;

    return payload;
  }
}
