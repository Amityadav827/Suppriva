import type { Product } from "@/lib/database/types";
import { ContentStatus } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validators/product.validator";
import type { SlugRepository } from "./base.repository";

export interface ProductsRepository extends SlugRepository<Product> {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(input: ProductCreateInput): Promise<Product>;
  updateProduct(id: string, input: ProductUpdateInput): Promise<Product>;
  getProductIngredientIds(productId: string): Promise<string[]>;
  syncProductIngredients(productId: string, ingredientIds: string[]): Promise<void>;
  deleteProductIngredients(productId: string): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}

export class SupabaseProductsRepository implements ProductsRepository {
  async getAllProducts(): Promise<Product[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return this.attachIngredientIds((data ?? []) as Product[]);
  }

  async getProductById(id: string): Promise<Product | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return this.attachIngredientIdsToProduct((data as Product | null) ?? null);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return this.attachIngredientIdsToProduct((data as Product | null) ?? null);
  }

  async createProduct(input: ProductCreateInput): Promise<Product> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (await this.attachIngredientIdsToProduct(data as Product)) as Product;
  }

  async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .update(this.toDatabaseInput(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (await this.attachIngredientIdsToProduct(data as Product)) as Product;
  }

  async getProductIngredientIds(productId: string): Promise<string[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("product_ingredients")
      .select("ingredient_id")
      .eq("product_id", productId);

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? [])
      .map((relation) => relation.ingredient_id)
      .filter(Boolean) as string[];
  }

  async syncProductIngredients(productId: string, ingredientIds: string[]): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const uniqueIngredientIds = [...new Set(ingredientIds)];
    const currentIngredientIds = await this.getProductIngredientIds(productId);
    const currentIngredientIdSet = new Set(currentIngredientIds);
    const nextIngredientIdSet = new Set(uniqueIngredientIds);
    const ingredientIdsToDelete = currentIngredientIds.filter(
      (ingredientId) => !nextIngredientIdSet.has(ingredientId),
    );
    const ingredientIdsToInsert = uniqueIngredientIds.filter(
      (ingredientId) => !currentIngredientIdSet.has(ingredientId),
    );

    if (ingredientIdsToDelete.length) {
      const { error: deleteError } = await supabase
        .from("product_ingredients")
        .delete()
        .eq("product_id", productId)
        .in("ingredient_id", ingredientIdsToDelete);

      if (deleteError) {
        throw new DatabaseError(deleteError.message);
      }
    }

    if (!ingredientIdsToInsert.length) {
      return;
    }

    const { error: insertError } = await supabase
      .from("product_ingredients")
      .upsert(
        ingredientIdsToInsert.map((ingredientId) => ({
          product_id: productId,
          ingredient_id: ingredientId,
        })),
        {
          onConflict: "product_id,ingredient_id",
          ignoreDuplicates: true,
        },
      );

    if (insertError) {
      throw new DatabaseError(insertError.message);
    }
  }

  async deleteProductIngredients(productId: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("product_ingredients")
      .delete()
      .eq("product_id", productId);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  getAll(): Promise<Product[]> {
    return this.getAllProducts();
  }

  getById(id: string): Promise<Product | null> {
    return this.getProductById(id);
  }

  getBySlug(slug: string): Promise<Product | null> {
    return this.getProductBySlug(slug);
  }

  create(input: ProductCreateInput): Promise<Product> {
    return this.createProduct(input);
  }

  update(id: string, input: ProductUpdateInput): Promise<Product> {
    return this.updateProduct(id, input);
  }

  delete(id: string): Promise<void> {
    return this.deleteProduct(id);
  }

  private toDatabaseInput(input: ProductCreateInput | ProductUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("category_id" in input) payload.category_id = input.category_id ?? null;
    if ("author_id" in input) payload.author_id = input.author_id ?? null;
    if ("reviewer_id" in input) payload.reviewer_id = input.reviewer_id ?? null;
    if ("title" in input) payload.title = input.title;
    if ("slug" in input) payload.slug = input.slug;
    if ("short_description" in input) {
      payload.short_description = input.short_description ?? null;
    }
    if ("full_description" in input) payload.full_description = input.full_description ?? null;
    if ("image" in input) payload.image = input.image ?? null;
    if ("gallery" in input) payload.gallery = input.gallery ?? [];
    if ("rating" in input) payload.rating = input.rating ?? null;
    if ("affiliate_url" in input) payload.affiliate_url = input.affiliate_url ?? null;
    if ("ingredients" in input) payload.ingredients = input.ingredients ?? [];
    if ("benefits" in input) payload.benefits = input.benefits ?? [];
    if ("pros" in input) payload.pros = input.pros ?? [];
    if ("cons" in input) payload.cons = input.cons ?? [];
    if ("faq" in input) payload.faq = input.faq ?? [];
    if ("status" in input) payload.status = input.status ?? ContentStatus.Draft;
    if ("published_at" in input) payload.published_at = input.published_at ?? null;
    if ("seo_title" in input) payload.seo_title = input.seo_title ?? null;
    if ("seo_description" in input) payload.seo_description = input.seo_description ?? null;

    return payload;
  }

  private async attachIngredientIds(products: Product[]): Promise<Product[]> {
    if (!products.length) {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const productIds = products.map((product) => product.id);
    const { data, error } = await supabase
      .from("product_ingredients")
      .select("product_id, ingredient_id")
      .in("product_id", productIds);

    if (error) {
      throw new DatabaseError(error.message);
    }

    const ingredientIdsByProductId = new Map<string, string[]>();

    (data ?? []).forEach((relation) => {
      const productIngredientIds = ingredientIdsByProductId.get(relation.product_id) ?? [];
      productIngredientIds.push(relation.ingredient_id);
      ingredientIdsByProductId.set(relation.product_id, productIngredientIds);
    });

    return products.map((product) => ({
      ...product,
      ingredient_ids: ingredientIdsByProductId.get(product.id) ?? [],
    }));
  }

  private async attachIngredientIdsToProduct(product: Product | null): Promise<Product | null> {
    if (!product) {
      return null;
    }

    const ingredientIds = await this.getProductIngredientIds(product.id);

    return {
      ...product,
      ingredient_ids: ingredientIds,
    };
  }
}
