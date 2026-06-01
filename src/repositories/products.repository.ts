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

    return (data ?? []) as Product[];
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

    return (data as Product | null) ?? null;
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

    return (data as Product | null) ?? null;
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

    return data as Product;
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

    return data as Product;
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
}
