import type {
  Product,
  ProductCmsCard,
  ProductCompareProduct,
  ProductHowItWorksStep,
  ProductIngredientOverride,
  ProductRelatedBlog,
  ProductRelatedIngredient,
  ProductRelatedProduct,
  ProductSafetyItem,
  ProductSidebarFact,
  ProductSidebarTrustBadge,
  ProductTocItem,
  ProductLayoutSection,
} from "@/lib/database/types";
import { ContentStatus } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ProductCmsCardInput,
  ProductCompareProductInput,
  ProductCreateInput,
  ProductHowItWorksStepInput,
  ProductIngredientOverrideInput,
  ProductRelatedBlogInput,
  ProductRelatedIngredientInput,
  ProductRelatedProductInput,
  ProductSafetyItemInput,
  ProductSidebarFactInput,
  ProductSidebarTrustBadgeInput,
  ProductTocItemInput,
  ProductLayoutSectionInput,
  ProductUpdateInput,
} from "@/lib/validators/product.validator";
import type { SlugRepository } from "./base.repository";

type ProductCmsRelationInput = Partial<
  Pick<
    ProductCreateInput,
    | "standout_points"
    | "how_it_works_steps"
    | "best_for_items"
    | "safety_items"
    | "buying_guide_items"
    | "sidebar_facts"
    | "sidebar_trust_badges"
    | "toc_items"
    | "product_layout_sections"
    | "ingredient_overrides"
    | "related_product_relations"
    | "compare_product_relations"
    | "related_blog_relations"
    | "related_ingredient_relations"
  >
>;

export interface ProductsRepository extends SlugRepository<Product> {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(input: ProductCreateInput): Promise<Product>;
  updateProduct(id: string, input: ProductUpdateInput): Promise<Product>;
  getProductIngredientIds(productId: string): Promise<string[]>;
  syncProductIngredients(productId: string, ingredientIds: string[]): Promise<void>;
  syncProductCmsRelations(productId: string, input: ProductCmsRelationInput): Promise<void>;
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

    return this.attachProductData((data ?? []) as Product[]);
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

    return this.attachProductDataToProduct((data as Product | null) ?? null);
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

    return this.attachProductDataToProduct((data as Product | null) ?? null);
  }

  async createProduct(input: ProductCreateInput): Promise<Product> {
    const supabase = await createSupabaseServerClient();
    const payload = this.toDatabaseInput(input);
    let pendingPayload = { ...payload };

    for (let attempt = 0; attempt <= Object.keys(payload).length; attempt += 1) {
      const { data, error } = await supabase
        .from("products")
        .insert(pendingPayload)
        .select("*")
        .single();

      if (!error) {
        return (await this.attachProductDataToProduct(data as Product)) as Product;
      }

      const missingColumn = this.getMissingSchemaColumn(error.message);

      if (!missingColumn || !(missingColumn in pendingPayload)) {
        throw new DatabaseError(error.message);
      }

      pendingPayload = this.omitPayloadColumn(pendingPayload, missingColumn);
    }

    throw new DatabaseError("Could not create product because the products schema is out of date.");
  }

  async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
    const supabase = await createSupabaseServerClient();
    const payload = this.toDatabaseInput(input);
    let pendingPayload = { ...payload };

    for (let attempt = 0; attempt <= Object.keys(payload).length; attempt += 1) {
      if (!Object.keys(pendingPayload).length) {
        const { data: existingData, error: existingError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .is("deleted_at", null)
          .single();

        if (existingError) {
          throw new DatabaseError(existingError.message);
        }

        return (await this.attachProductDataToProduct(existingData as Product)) as Product;
      }

      const { data, error } = await supabase
        .from("products")
        .update(pendingPayload)
        .eq("id", id)
        .is("deleted_at", null)
        .select("*")
        .single();

      if (!error) {
        return (await this.attachProductDataToProduct(data as Product)) as Product;
      }

      const missingColumn = this.getMissingSchemaColumn(error.message);

      if (!missingColumn || !(missingColumn in pendingPayload)) {
        throw new DatabaseError(error.message);
      }

      pendingPayload = this.omitPayloadColumn(pendingPayload, missingColumn);
    }

    throw new DatabaseError("Could not update product because the products schema is out of date.");
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

  async syncProductCmsRelations(productId: string, input: ProductCmsRelationInput): Promise<void> {
    const syncJobs: Array<Promise<void>> = [];

    if ("standout_points" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_standout_points",
          productId,
          (input.standout_points ?? []).map((item, index) =>
            this.cmsCardToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("how_it_works_steps" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_how_it_works_steps",
          productId,
          (input.how_it_works_steps ?? []).map((item, index) =>
            this.howItWorksStepToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("best_for_items" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_best_for_items",
          productId,
          (input.best_for_items ?? []).map((item, index) =>
            this.cmsCardToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("safety_items" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_safety_items",
          productId,
          (input.safety_items ?? []).map((item, index) =>
            this.safetyItemToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("buying_guide_items" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_buying_guide_items",
          productId,
          (input.buying_guide_items ?? []).map((item, index) =>
            this.cmsCardToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("sidebar_facts" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_sidebar_facts",
          productId,
          (input.sidebar_facts ?? []).map((item, index) =>
            this.sidebarFactToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("sidebar_trust_badges" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_sidebar_trust_badges",
          productId,
          (input.sidebar_trust_badges ?? []).map((item, index) =>
            this.sidebarTrustBadgeToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("toc_items" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_toc_items",
          productId,
          (input.toc_items ?? []).map((item, index) =>
            this.tocItemToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("product_layout_sections" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_layout_sections",
          productId,
          (input.product_layout_sections ?? []).map((item, index) =>
            this.productLayoutSectionToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("ingredient_overrides" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_ingredient_overrides",
          productId,
          (input.ingredient_overrides ?? []).map((item, index) =>
            this.ingredientOverrideToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("related_product_relations" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_related_products",
          productId,
          (input.related_product_relations ?? []).map((item, index) =>
            this.relatedProductToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("compare_product_relations" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_compare_products",
          productId,
          (input.compare_product_relations ?? []).map((item, index) =>
            this.compareProductToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("related_blog_relations" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_related_blogs",
          productId,
          (input.related_blog_relations ?? []).map((item, index) =>
            this.relatedBlogToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    if ("related_ingredient_relations" in input) {
      syncJobs.push(
        this.replaceRows(
          "product_related_ingredients",
          productId,
          (input.related_ingredient_relations ?? []).map((item, index) =>
            this.relatedIngredientToRow(productId, item, index),
          ),
          true,
        ),
      );
    }

    await Promise.all(syncJobs);
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
    if ("hero_badge" in input) payload.hero_badge = input.hero_badge ?? null;
    if ("hero_title" in input) payload.hero_title = input.hero_title ?? null;
    if ("hero_subtitle" in input) payload.hero_subtitle = input.hero_subtitle ?? null;
    if ("hero_description" in input) payload.hero_description = input.hero_description ?? null;
    if ("hero_image_alt" in input) payload.hero_image_alt = input.hero_image_alt ?? null;
    if ("hero_cta_label" in input) payload.hero_cta_label = input.hero_cta_label ?? null;
    if ("hero_cta_target" in input) payload.hero_cta_target = input.hero_cta_target ?? null;
    if ("hero_secondary_cta_label" in input) {
      payload.hero_secondary_cta_label = input.hero_secondary_cta_label ?? null;
    }
    if ("hero_secondary_cta_target" in input) {
      payload.hero_secondary_cta_target = input.hero_secondary_cta_target ?? null;
    }
    if ("hero_checklist" in input) payload.hero_checklist = input.hero_checklist ?? [];
    if ("hero_show_rating" in input) payload.hero_show_rating = input.hero_show_rating ?? true;
    if ("hero_show_badge" in input) payload.hero_show_badge = input.hero_show_badge ?? true;
    if ("review_count" in input) payload.review_count = input.review_count ?? null;
    if ("rating_label" in input) payload.rating_label = input.rating_label ?? null;
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
    if ("overview_title" in input) payload.overview_title = input.overview_title ?? null;
    if ("overview_subtitle" in input) payload.overview_subtitle = input.overview_subtitle ?? null;
    if ("overview_content" in input) payload.overview_content = input.overview_content ?? null;
    if ("how_it_works_title" in input) payload.how_it_works_title = input.how_it_works_title ?? null;
    if ("how_it_works_subtitle" in input) {
      payload.how_it_works_subtitle = input.how_it_works_subtitle ?? null;
    }
    if ("how_it_works_content" in input) payload.how_it_works_content = input.how_it_works_content ?? null;
    if ("benefits_title" in input) payload.benefits_title = input.benefits_title ?? null;
    if ("benefits_subtitle" in input) payload.benefits_subtitle = input.benefits_subtitle ?? null;
    if ("ingredients_title" in input) payload.ingredients_title = input.ingredients_title ?? null;
    if ("ingredients_subtitle" in input) payload.ingredients_subtitle = input.ingredients_subtitle ?? null;
    if ("best_for_title" in input) payload.best_for_title = input.best_for_title ?? null;
    if ("best_for_subtitle" in input) payload.best_for_subtitle = input.best_for_subtitle ?? null;
    if ("safety_title" in input) payload.safety_title = input.safety_title ?? null;
    if ("safety_subtitle" in input) payload.safety_subtitle = input.safety_subtitle ?? null;
    if ("pros_cons_title" in input) payload.pros_cons_title = input.pros_cons_title ?? null;
    if ("pros_cons_subtitle" in input) payload.pros_cons_subtitle = input.pros_cons_subtitle ?? null;
    if ("faq_title" in input) payload.faq_title = input.faq_title ?? null;
    if ("faq_subtitle" in input) payload.faq_subtitle = input.faq_subtitle ?? null;
    if ("verdict_title" in input) payload.verdict_title = input.verdict_title ?? null;
    if ("verdict_subtitle" in input) payload.verdict_subtitle = input.verdict_subtitle ?? null;
    if ("verdict_summary" in input) payload.verdict_summary = input.verdict_summary ?? null;
    if ("verdict_best_for" in input) payload.verdict_best_for = input.verdict_best_for ?? null;
    if ("verdict_not_ideal_for" in input) {
      payload.verdict_not_ideal_for = input.verdict_not_ideal_for ?? null;
    }
    if ("verdict_recommendation" in input) {
      payload.verdict_recommendation = input.verdict_recommendation ?? null;
    }
    if ("verdict_conclusion" in input) {
      payload.verdict_conclusion = input.verdict_conclusion ?? null;
    }
    if ("buying_guide_title" in input) payload.buying_guide_title = input.buying_guide_title ?? null;
    if ("buying_guide_subtitle" in input) {
      payload.buying_guide_subtitle = input.buying_guide_subtitle ?? null;
    }
    if ("buying_cta_label" in input) payload.buying_cta_label = input.buying_cta_label ?? null;
    if ("related_ingredients_title" in input) {
      payload.related_ingredients_title = input.related_ingredients_title ?? null;
    }
    if ("related_ingredients_subtitle" in input) {
      payload.related_ingredients_subtitle = input.related_ingredients_subtitle ?? null;
    }
    if ("related_blogs_title" in input) payload.related_blogs_title = input.related_blogs_title ?? null;
    if ("related_blogs_subtitle" in input) {
      payload.related_blogs_subtitle = input.related_blogs_subtitle ?? null;
    }
    if ("compare_title" in input) payload.compare_title = input.compare_title ?? null;
    if ("compare_subtitle" in input) payload.compare_subtitle = input.compare_subtitle ?? null;
    if ("related_products_title" in input) {
      payload.related_products_title = input.related_products_title ?? null;
    }
    if ("related_products_subtitle" in input) {
      payload.related_products_subtitle = input.related_products_subtitle ?? null;
    }
    if ("health_needs_title" in input) payload.health_needs_title = input.health_needs_title ?? null;
    if ("health_needs_subtitle" in input) {
      payload.health_needs_subtitle = input.health_needs_subtitle ?? null;
    }
    if ("sidebar_heading" in input) payload.sidebar_heading = input.sidebar_heading ?? null;
    if ("sidebar_description" in input) {
      payload.sidebar_description = input.sidebar_description ?? null;
    }
    if ("sidebar_cta_title" in input) payload.sidebar_cta_title = input.sidebar_cta_title ?? null;
    if ("sidebar_cta_description" in input) {
      payload.sidebar_cta_description = input.sidebar_cta_description ?? null;
    }
    if ("sidebar_cta_label" in input) payload.sidebar_cta_label = input.sidebar_cta_label ?? null;
    if ("sidebar_cta_url" in input) payload.sidebar_cta_url = input.sidebar_cta_url ?? null;
    if ("sidebar_cta_type" in input) payload.sidebar_cta_type = input.sidebar_cta_type ?? null;
    if ("sidebar_sticky_enabled" in input) {
      payload.sidebar_sticky_enabled = input.sidebar_sticky_enabled ?? true;
    }
    if ("seo_title" in input) payload.seo_title = input.seo_title ?? null;
    if ("seo_description" in input) payload.seo_description = input.seo_description ?? null;
    if ("seo_canonical_url" in input) payload.seo_canonical_url = input.seo_canonical_url ?? null;
    if ("seo_og_title" in input) payload.seo_og_title = input.seo_og_title ?? null;
    if ("seo_og_description" in input) payload.seo_og_description = input.seo_og_description ?? null;
    if ("seo_og_image" in input) payload.seo_og_image = input.seo_og_image ?? null;
    if ("seo_noindex" in input) payload.seo_noindex = input.seo_noindex ?? false;
    if ("seo_focus_keyword" in input) payload.seo_focus_keyword = input.seo_focus_keyword ?? null;
    if ("seo_nofollow" in input) payload.seo_nofollow = input.seo_nofollow ?? false;
    if ("seo_twitter_title" in input) payload.seo_twitter_title = input.seo_twitter_title ?? null;
    if ("seo_twitter_description" in input) {
      payload.seo_twitter_description = input.seo_twitter_description ?? null;
    }
    if ("seo_twitter_image" in input) payload.seo_twitter_image = input.seo_twitter_image ?? null;
    if ("schema_brand" in input) payload.schema_brand = input.schema_brand ?? null;
    if ("schema_sku" in input) payload.schema_sku = input.schema_sku ?? null;
    if ("schema_mpn" in input) payload.schema_mpn = input.schema_mpn ?? null;
    if ("schema_gtin" in input) payload.schema_gtin = input.schema_gtin ?? null;
    if ("schema_price" in input) payload.schema_price = input.schema_price ?? null;
    if ("schema_currency" in input) payload.schema_currency = input.schema_currency ?? null;
    if ("schema_availability" in input) payload.schema_availability = input.schema_availability ?? null;
    if ("schema_aggregate_rating" in input) {
      payload.schema_aggregate_rating = input.schema_aggregate_rating ?? null;
    }
    if ("schema_review_count" in input) payload.schema_review_count = input.schema_review_count ?? null;
    if ("schema_offer_url" in input) payload.schema_offer_url = input.schema_offer_url ?? null;
    if ("schema_enable_product" in input) {
      payload.schema_enable_product = input.schema_enable_product ?? true;
    }
    if ("schema_enable_faq" in input) payload.schema_enable_faq = input.schema_enable_faq ?? true;
    if ("schema_enable_breadcrumb" in input) {
      payload.schema_enable_breadcrumb = input.schema_enable_breadcrumb ?? true;
    }
    if ("schema_enable_review" in input) {
      payload.schema_enable_review = input.schema_enable_review ?? true;
    }
    if ("schema_enable_organization" in input) {
      payload.schema_enable_organization = input.schema_enable_organization ?? true;
    }
    if ("schema_json" in input) payload.schema_json = input.schema_json ?? {};
    if ("product_image_metadata" in input) {
      payload.product_image_metadata = input.product_image_metadata ?? {};
    }
    if ("gallery_image_metadata" in input) {
      payload.gallery_image_metadata = input.gallery_image_metadata ?? [];
    }

    return payload;
  }

  private cmsCardToRow(productId: string, item: ProductCmsCardInput, index: number) {
    return {
      product_id: productId,
      title: item.title.trim(),
      description: item.description?.trim() || null,
      icon: item.icon?.trim() || null,
      display_order: item.display_order ?? index,
      is_active: item.is_active ?? true,
    };
  }

  private howItWorksStepToRow(
    productId: string,
    item: ProductHowItWorksStepInput,
    index: number,
  ) {
    return {
      product_id: productId,
      title: item.title?.trim() || null,
      description: (item.description ?? "").trim(),
      icon: item.icon?.trim() || null,
      display_order: item.display_order ?? index,
      is_active: item.is_active ?? true,
    };
  }

  private safetyItemToRow(productId: string, item: ProductSafetyItemInput, index: number) {
    return {
      product_id: productId,
      item_type: item.item_type,
      title: item.title.trim(),
      description: item.description?.trim() || null,
      icon: item.icon?.trim() || null,
      display_order: item.display_order ?? index,
      is_active: item.is_active ?? true,
    };
  }

  private sidebarFactToRow(productId: string, item: ProductSidebarFactInput, index: number) {
    return {
      product_id: productId,
      label: item.label.trim(),
      value: item.value.trim(),
      icon: item.icon?.trim() || null,
      display_order: item.display_order ?? index,
      is_active: item.is_active ?? true,
    };
  }

  private sidebarTrustBadgeToRow(
    productId: string,
    item: ProductSidebarTrustBadgeInput,
    index: number,
  ) {
    return {
      product_id: productId,
      title: item.title.trim(),
      description: item.description?.trim() || null,
      icon: item.icon?.trim() || null,
      display_order: item.display_order ?? index,
      is_active: item.is_active ?? true,
    };
  }

  private tocItemToRow(productId: string, item: ProductTocItemInput, index: number) {
    return {
      product_id: productId,
      label: item.label.trim(),
      anchor_id: item.anchor_id.trim(),
      icon: item.icon?.trim() || null,
      display_order: item.display_order ?? index,
      is_visible: item.is_visible ?? true,
      is_active: item.is_active ?? true,
    };
  }

  private productLayoutSectionToRow(
    productId: string,
    item: ProductLayoutSectionInput,
    index: number,
  ) {
    return {
      product_id: productId,
      section_key: item.section_key,
      is_visible: item.is_visible,
      sort_order: item.sort_order ?? index,
      title_override: item.title_override?.trim() || null,
      subtitle_override: item.subtitle_override?.trim() || null,
      background_style: item.background_style || "default",
      animation_enabled: item.animation_enabled,
    };
  }

  private ingredientOverrideToRow(
    productId: string,
    item: ProductIngredientOverrideInput,
    index: number,
  ) {
    return {
      product_id: productId,
      ingredient_id: item.ingredient_id,
      display_order: item.display_order ?? index,
      purpose: item.purpose?.trim() || null,
      dosage: item.dosage?.trim() || null,
      description_override: item.description_override?.trim() || null,
      custom_note: item.custom_note?.trim() || null,
      is_highlighted: item.is_highlighted ?? false,
    };
  }

  private relatedProductToRow(productId: string, item: ProductRelatedProductInput, index: number) {
    return {
      product_id: productId,
      related_product_id: item.related_product_id,
      display_order: item.display_order ?? index,
      relationship_type: item.relationship_type?.trim() || "related",
      title_override: item.title_override?.trim() || null,
      description_override: item.description_override?.trim() || null,
      is_active: item.is_active ?? true,
    };
  }

  private compareProductToRow(productId: string, item: ProductCompareProductInput, index: number) {
    return {
      product_id: productId,
      compared_product_id: item.compared_product_id,
      display_order: item.display_order ?? index,
      title_override: item.title_override?.trim() || null,
      description_override: item.description_override?.trim() || null,
      is_active: item.is_active ?? true,
    };
  }

  private relatedBlogToRow(productId: string, item: ProductRelatedBlogInput, index: number) {
    return {
      product_id: productId,
      blog_id: item.blog_id,
      display_order: item.display_order ?? index,
      title_override: item.title_override?.trim() || null,
      description_override: item.description_override?.trim() || null,
      is_active: item.is_active ?? true,
    };
  }

  private relatedIngredientToRow(
    productId: string,
    item: ProductRelatedIngredientInput,
    index: number,
  ) {
    return {
      product_id: productId,
      ingredient_id: item.ingredient_id,
      display_order: item.display_order ?? index,
      title_override: item.title_override?.trim() || null,
      description_override: item.description_override?.trim() || null,
      is_active: item.is_active ?? true,
    };
  }

  private async replaceRows(
    table: string,
    productId: string,
    rows: Record<string, unknown>[],
    optional = false,
  ) {
    const supabase = await createSupabaseServerClient();
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      if (optional && this.isMissingOptionalCmsRelation(deleteError.message)) {
        return;
      }

      throw new DatabaseError(deleteError.message);
    }

    if (!rows.length) {
      return;
    }

    let pendingRows = rows.map((row) => ({ ...row }));

    for (let attempt = 0; attempt <= Object.keys(rows[0] ?? {}).length; attempt += 1) {
      const { error: insertError } = await supabase.from(table).insert(pendingRows);

      if (!insertError) {
        return;
      }

      const missingColumn = this.getMissingSchemaColumn(insertError.message);

      if (
        optional &&
        missingColumn &&
        pendingRows.some((row) => missingColumn in row)
      ) {
        pendingRows = pendingRows.map((row) => this.omitPayloadColumn(row, missingColumn));
        continue;
      }

      if (optional && this.isMissingOptionalCmsRelation(insertError.message)) {
        return;
      }

      throw new DatabaseError(insertError.message);
    }
  }

  private async attachProductData(products: Product[]): Promise<Product[]> {
    const productsWithIngredientIds = await this.attachIngredientIds(products);
    return this.attachProductCmsRelations(productsWithIngredientIds);
  }

  private async attachProductDataToProduct(product: Product | null): Promise<Product | null> {
    if (!product) {
      return null;
    }

    const [productWithData] = await this.attachProductData([product]);
    return productWithData ?? null;
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

  private async attachProductCmsRelations(products: Product[]): Promise<Product[]> {
    if (!products.length) {
      return [];
    }

    const productIds = products.map((product) => product.id);
    const [
      standoutPoints,
      howItWorksSteps,
      bestForItems,
      safetyItems,
      buyingGuideItems,
      sidebarFacts,
      sidebarTrustBadges,
      tocItems,
      productLayoutSections,
      ingredientOverrides,
      relatedProducts,
      compareProducts,
      relatedBlogs,
      relatedIngredients,
    ] = await Promise.all([
      this.fetchProductRows<ProductCmsCard>("product_standout_points", productIds, true),
      this.fetchProductRows<ProductHowItWorksStep>("product_how_it_works_steps", productIds, true),
      this.fetchProductRows<ProductCmsCard>("product_best_for_items", productIds, true),
      this.fetchProductRows<ProductSafetyItem>("product_safety_items", productIds, true),
      this.fetchProductRows<ProductCmsCard>("product_buying_guide_items", productIds, true),
      this.fetchProductRows<ProductSidebarFact>("product_sidebar_facts", productIds, true),
      this.fetchProductRows<ProductSidebarTrustBadge>("product_sidebar_trust_badges", productIds, true),
      this.fetchProductRows<ProductTocItem>("product_toc_items", productIds, true),
      this.fetchProductRows<ProductLayoutSection>(
        "product_layout_sections",
        productIds,
        true,
        "sort_order",
      ),
      this.fetchProductRows<ProductIngredientOverride>("product_ingredient_overrides", productIds, true),
      this.fetchProductRows<ProductRelatedProduct>("product_related_products", productIds, true),
      this.fetchProductRows<ProductCompareProduct>("product_compare_products", productIds, true),
      this.fetchProductRows<ProductRelatedBlog>("product_related_blogs", productIds, true),
      this.fetchProductRows<ProductRelatedIngredient>("product_related_ingredients", productIds, true),
    ]);

    return products.map((product) => ({
      ...product,
      standout_points: this.rowsForProduct(standoutPoints, product.id),
      how_it_works_steps: this.rowsForProduct(howItWorksSteps, product.id),
      best_for_items: this.rowsForProduct(bestForItems, product.id),
      safety_items: this.rowsForProduct(safetyItems, product.id),
      buying_guide_items: this.rowsForProduct(buyingGuideItems, product.id),
      sidebar_facts: this.rowsForProduct(sidebarFacts, product.id),
      sidebar_trust_badges: this.rowsForProduct(sidebarTrustBadges, product.id),
      toc_items: this.rowsForProduct(tocItems, product.id),
      product_layout_sections: this.rowsForProduct(productLayoutSections, product.id),
      ingredient_overrides: this.rowsForProduct(ingredientOverrides, product.id),
      related_product_relations: this.rowsForProduct(relatedProducts, product.id),
      compare_product_relations: this.rowsForProduct(compareProducts, product.id),
      related_blog_relations: this.rowsForProduct(relatedBlogs, product.id),
      related_ingredient_relations: this.rowsForProduct(relatedIngredients, product.id),
    }));
  }

  private async fetchProductRows<TRow extends { product_id: string }>(
    table: string,
    productIds: string[],
    optional = false,
    orderColumn = "display_order",
  ): Promise<TRow[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .in("product_id", productIds)
      .order(orderColumn, { ascending: true });

    if (error) {
      if (optional && this.isMissingOptionalCmsRelation(error.message)) {
        return [];
      }

      throw new DatabaseError(error.message);
    }

    return (data ?? []) as TRow[];
  }

  private isMissingOptionalCmsRelation(message: string) {
    const normalized = message.toLowerCase();

    return (
      normalized.includes("schema cache") &&
      (normalized.includes("could not find the table") ||
        normalized.includes("could not find the column"))
    );
  }

  private getMissingSchemaColumn(message: string) {
    if (!this.isMissingOptionalCmsRelation(message)) {
      return null;
    }

    return /Could not find the '([^']+)' column/i.exec(message)?.[1] ?? null;
  }

  private omitPayloadColumn(payload: Record<string, unknown>, column: string) {
    const { [column]: _removedColumn, ...nextPayload } = payload;
    void _removedColumn;
    return nextPayload;
  }

  private rowsForProduct<TRow extends { product_id: string }>(
    rows: TRow[],
    productId: string,
  ): TRow[] {
    return rows.filter((row) => row.product_id === productId);
  }
}
