import { AppError } from "@/lib/errors/AppError";
import { isAdmin } from "@/lib/auth/admin";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type AffiliateClickCreateInput,
  validateAffiliateClickInput,
} from "@/lib/validators/affiliate-click.validator";
import {
  AffiliateClickRepository,
  type AffiliateDashboardStats,
} from "@/repositories/affiliate-clicks.repository";
import { SupabaseProductsRepository } from "@/repositories/products.repository";

export class AffiliateClickService {
  constructor(
    private readonly affiliateClickRepository = new AffiliateClickRepository(),
    private readonly productsRepository = new SupabaseProductsRepository(),
  ) {}

  async getAllClicks() {
    await this.ensureAdminAccess();

    return this.affiliateClickRepository.getAllClicks();
  }

  async getClicksByProduct(productId: string) {
    await this.ensureAdminAccess();

    return this.affiliateClickRepository.getClicksByProduct(productId);
  }

  async getClicksByDateRange(startDate: string, endDate: string) {
    await this.ensureAdminAccess();

    return this.affiliateClickRepository.getClicksByDateRange(startDate, endDate);
  }

  async createClick(input: AffiliateClickCreateInput) {
    const validation = validateAffiliateClickInput(input);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const productId = await this.resolveProductId(input);
    const sourcePage = JSON.stringify({
      page: input.source_page ?? null,
      referrer: input.referrer ?? null,
      product_slug: input.product_slug ?? null,
      category: null,
      session_id: input.session_id ?? null,
      timestamp: new Date().toISOString(),
    });

    return this.affiliateClickRepository.createClick({
      product_id: productId,
      source_page: sourcePage,
      country: input.country ?? null,
      device: input.user_agent ?? null,
    });
  }

  async getDashboardStats(): Promise<AffiliateDashboardStats> {
    await this.ensureAdminAccess();

    return this.affiliateClickRepository.getDashboardStats();
  }

  private async ensureAdminAccess() {
    const allowed = await isAdmin();

    if (!allowed) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }
  }

  private async resolveProductId(input: AffiliateClickCreateInput) {
    if (input.product_id) {
      return input.product_id;
    }

    if (!input.product_slug) {
      throw new ValidationError("Product slug is required.");
    }

    const product = await this.productsRepository.getProductBySlug(input.product_slug);

    if (!product) {
      throw new AppError(
        "Product must exist in Supabase before affiliate clicks can be tracked.",
        "TRACKING_PRODUCT_NOT_FOUND",
        404,
      );
    }

    return product.id;
  }
}
