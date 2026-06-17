import { randomUUID } from "node:crypto";
import type { AffiliateClick } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AffiliateClickCreateRecord = {
  product_id: string;
  source_page?: string | null;
  country?: string | null;
  device?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
  referrer?: string | null;
};

export type AffiliateDashboardStats = {
  totalClicks: number;
  todayClicks: number;
  weeklyClicks: number;
  monthlyClicks: number;
  topProducts: { product_id: string; clicks: number }[];
  topCategories: { category: string; clicks: number }[];
  recentClicks: AffiliateClick[];
  trend: { label: string; clicks: number }[];
};

export class AffiliateClickRepository {
  async getAllClicks(): Promise<AffiliateClick[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("affiliate_clicks")
      .select("*")
      .is("deleted_at", null)
      .order("clicked_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as AffiliateClick[];
  }

  async getClicksByProduct(productId: string): Promise<AffiliateClick[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("affiliate_clicks")
      .select("*")
      .eq("product_id", productId)
      .is("deleted_at", null)
      .order("clicked_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as AffiliateClick[];
  }

  async getClicksByDateRange(startDate: string, endDate: string): Promise<AffiliateClick[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("affiliate_clicks")
      .select("*")
      .gte("clicked_at", startDate)
      .lte("clicked_at", endDate)
      .is("deleted_at", null)
      .order("clicked_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as AffiliateClick[];
  }

  async createClick(input: AffiliateClickCreateRecord): Promise<AffiliateClick> {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const click: AffiliateClick = {
      id: randomUUID(),
      product_id: input.product_id,
      clicked_at: now,
      source_page: input.source_page ?? null,
      country: input.country ?? null,
      device: input.device ?? null,
      user_agent: input.user_agent ?? null,
      ip_hash: input.ip_hash ?? null,
      referrer: input.referrer ?? null,
      created_at: now,
      deleted_at: null,
    };

    const { error } = await supabase.from("affiliate_clicks").insert(click);

    if (error) {
      throw new DatabaseError(error.message);
    }

    return click;
  }

  async getDashboardStats(): Promise<AffiliateDashboardStats> {
    const clicks = await this.getAllClicks();
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now);
    startOfMonth.setMonth(now.getMonth() - 1);

    const productCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    const trendCounts = new Map<string, number>();

    clicks.forEach((click) => {
      productCounts.set(click.product_id, (productCounts.get(click.product_id) ?? 0) + 1);
      const category = this.extractMeta(click.source_page, "category") ?? "Uncategorized";
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      const label = this.toTrendKey(click.clicked_at);
      trendCounts.set(label, (trendCounts.get(label) ?? 0) + 1);
    });

    const trend = Array.from({ length: 30 }, (_, index) => {
      const pointDate = new Date(now);
      pointDate.setDate(now.getDate() - (29 - index));
      const key = this.toTrendKey(pointDate.toISOString());

      return {
        label: pointDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        clicks: trendCounts.get(key) ?? 0,
      };
    });

    return {
      totalClicks: clicks.length,
      todayClicks: clicks.filter((click) => new Date(click.clicked_at) >= startOfToday).length,
      weeklyClicks: clicks.filter((click) => new Date(click.clicked_at) >= startOfWeek).length,
      monthlyClicks: clicks.filter((click) => new Date(click.clicked_at) >= startOfMonth).length,
      topProducts: [...productCounts.entries()]
        .map(([product_id, count]) => ({ product_id, clicks: count }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      topCategories: [...categoryCounts.entries()]
        .map(([category, count]) => ({ category, clicks: count }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      recentClicks: clicks.slice(0, 8),
      trend,
    };
  }

  private extractMeta(sourcePage: string | null, key: string) {
    if (!sourcePage?.startsWith("{")) {
      return null;
    }

    try {
      const parsed = JSON.parse(sourcePage) as Record<string, unknown>;
      const value = parsed[key];

      return typeof value === "string" ? value : null;
    } catch {
      return null;
    }
  }

  private toTrendKey(dateValue: string) {
    const date = new Date(dateValue);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
