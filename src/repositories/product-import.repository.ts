import type { ContentStatus } from "@/lib/database/constants";
import type {
  FAQItem,
  ProductImportLog,
  ProductImportStatus,
  ProductIngredient,
} from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProductImportLogCreateInput = {
  filename: string;
  total_rows: number;
  imported_rows?: number;
  failed_rows?: number;
  status?: ProductImportStatus;
};

export type ProductImportLogUpdateInput = {
  imported_rows: number;
  failed_rows: number;
  status: ProductImportStatus;
};

export type ProductImportUpsertInput = {
  title: string;
  slug: string;
  category_id: string;
  affiliate_url: string | null;
  short_description: string | null;
  rating: number | null;
  image: string | null;
  status: ContentStatus;
  pros: string[];
  cons: string[];
  faq: FAQItem[];
  ingredient_snapshot: ProductIngredient[];
  ingredient_ids: string[];
};

export interface ProductImportRepository {
  createImportLog(input: ProductImportLogCreateInput): Promise<ProductImportLog>;
  updateImportLog(id: string, input: ProductImportLogUpdateInput): Promise<ProductImportLog>;
  upsertProductImportRow(input: ProductImportUpsertInput): Promise<string>;
}

export class SupabaseProductImportRepository implements ProductImportRepository {
  async createImportLog(input: ProductImportLogCreateInput): Promise<ProductImportLog> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("product_import_logs")
      .insert({
        filename: input.filename,
        total_rows: input.total_rows,
        imported_rows: input.imported_rows ?? 0,
        failed_rows: input.failed_rows ?? 0,
        status: input.status ?? "pending",
      })
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as ProductImportLog;
  }

  async updateImportLog(id: string, input: ProductImportLogUpdateInput): Promise<ProductImportLog> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("product_import_logs")
      .update({
        imported_rows: input.imported_rows,
        failed_rows: input.failed_rows,
        status: input.status,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as ProductImportLog;
  }

  async upsertProductImportRow(input: ProductImportUpsertInput): Promise<string> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("upsert_product_import_row", {
      p_title: input.title,
      p_slug: input.slug,
      p_category_id: input.category_id,
      p_affiliate_url: input.affiliate_url,
      p_short_description: input.short_description,
      p_rating: input.rating,
      p_image: input.image,
      p_status: input.status,
      p_pros: input.pros,
      p_cons: input.cons,
      p_faq: input.faq,
      p_ingredient_snapshot: input.ingredient_snapshot,
      p_ingredient_ids: input.ingredient_ids,
    });

    if (error) {
      throw new DatabaseError(error.message);
    }

    if (!data || typeof data !== "string") {
      throw new DatabaseError("Bulk import did not return a product ID.");
    }

    return data;
  }
}
