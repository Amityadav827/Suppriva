"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import type { AffiliateClick, NewsletterSubscriber } from "@/lib/database/types";

type RecentActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string;
  status?: string;
};

type EnrichedClick = AffiliateClick & {
  product_title: string;
  source_label: string;
};

type DashboardOverview = {
  summary: {
    totalProducts: number;
    totalCategories: number;
    totalBlogs: number;
    totalIngredients: number;
    newsletterSubscribers: number;
    affiliateClicks: number;
    publishedContent: number;
  };
  storage: {
    uploadedImagesCount: number;
    categoryImages: number;
    productImages: number;
    blogImages: number;
    ingredientImages: number;
  };
  affiliate: {
    totalClicks: number;
    todayClicks: number;
    weeklyClicks: number;
    monthlyClicks: number;
    topProducts: { product_id: string; product_title: string; clicks: number }[];
    topCategories: { category: string; clicks: number }[];
    recentClicks: EnrichedClick[];
    trend: { label: string; clicks: number }[];
  };
  newsletter: {
    totalSubscribers: number;
    newToday: number;
    weeklySubscribers: number;
    monthlySubscribers: number;
    recentSubscribers: NewsletterSubscriber[];
    growth: { label: string; subscribers: number }[];
  };
  recentActivity: {
    products: RecentActivityItem[];
    blogs: RecentActivityItem[];
    ingredients: RecentActivityItem[];
    subscribers: RecentActivityItem[];
  };
  quickActions: {
    label: string;
    href: string;
  }[];
};

type DashboardOverviewResponse = {
  overview?: DashboardOverview;
  error?: string;
};

const emptyOverview: DashboardOverview = {
  summary: {
    totalProducts: 0,
    totalCategories: 0,
    totalBlogs: 0,
    totalIngredients: 0,
    newsletterSubscribers: 0,
    affiliateClicks: 0,
    publishedContent: 0,
  },
  storage: {
    uploadedImagesCount: 0,
    categoryImages: 0,
    productImages: 0,
    blogImages: 0,
    ingredientImages: 0,
  },
  affiliate: {
    totalClicks: 0,
    todayClicks: 0,
    weeklyClicks: 0,
    monthlyClicks: 0,
    topProducts: [],
    topCategories: [],
    recentClicks: [],
    trend: [],
  },
  newsletter: {
    totalSubscribers: 0,
    newToday: 0,
    weeklySubscribers: 0,
    monthlySubscribers: 0,
    recentSubscribers: [],
    growth: [],
  },
  recentActivity: {
    products: [],
    blogs: [],
    ingredients: [],
    subscribers: [],
  },
  quickActions: [],
};

export function DashboardAnalyticsClient() {
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard/overview", { cache: "no-store" });
      const payload = (await response.json()) as DashboardOverviewResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load dashboard overview.");
      }

      setOverview(payload.overview ?? emptyOverview);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load dashboard overview.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const primaryCards = useMemo(
    () => [
      {
        label: "Total Products",
        value: String(overview.summary.totalProducts),
        change: "Live Supabase count",
      },
      {
        label: "Total Categories",
        value: String(overview.summary.totalCategories),
        change: "Live Supabase count",
      },
      {
        label: "Total Blogs",
        value: String(overview.summary.totalBlogs),
        change: "Live Supabase count",
      },
      {
        label: "Newsletter Subscribers",
        value: String(overview.summary.newsletterSubscribers),
        change: `${overview.newsletter.newToday} joined today`,
      },
      {
        label: "Affiliate Clicks",
        value: String(overview.summary.affiliateClicks),
        change: `${overview.affiliate.weeklyClicks} in the last 7 days`,
      },
      {
        label: "Published Content",
        value: String(overview.summary.publishedContent),
        change: `${overview.summary.totalIngredients} ingredient records tracked`,
      },
    ],
    [overview],
  );

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-border-light bg-white p-10 text-center text-sm text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          Loading dashboard analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-clip">
      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => void fetchOverview()}
          className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
        >
          <RefreshCw className="size-4" />
          Refresh Analytics
        </button>
      </div>

      <div className="grid min-w-0 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {primaryCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid min-w-0 items-start gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="min-w-0">
          <DashboardCard
            title="Quick Actions"
            description="Jump straight into the high-frequency workflows for content, media, and SEO."
          >
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {overview.quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group min-w-0 rounded-[24px] border border-border-light bg-cream px-4 py-5 transition hover:border-gold/70 hover:bg-white"
                >
                  <p className="font-heading text-base font-bold text-text-dark">
                    {action.label}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open
                    <ExternalLink className="size-4 transition group-hover:translate-x-0.5" />
                  </p>
                </Link>
              ))}
            </div>
          </DashboardCard>
        </div>

        <div className="min-w-0">
          <DashboardCard
            title="Storage Overview"
            description="Live media usage snapshot across the CMS and storefront."
          >
            <div className="grid gap-3">
              {[
                ["Uploaded Images Count", overview.storage.uploadedImagesCount],
                ["Categories Images", overview.storage.categoryImages],
                ["Product Images", overview.storage.productImages],
                ["Blog Images", overview.storage.blogImages],
                ["Ingredient Images", overview.storage.ingredientImages],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between gap-4 rounded-[20px] border border-border-light bg-white px-4 py-3 text-sm"
                >
                  <span className="min-w-0 flex-1 leading-5 text-text-dark">{label}</span>
                  <span className="shrink-0 font-heading text-lg font-bold text-primary">{value}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          <DashboardCard
            title="Click Trend Chart"
            description="Affiliate click activity over the last 30 days."
          >
            <BarChart
              values={overview.affiliate.trend.map((item) => item.clicks)}
              labels={overview.affiliate.trend.map((item) => item.label)}
            />
          </DashboardCard>
        </div>
        <div className="min-w-0">
          <DashboardCard title="Top Products Chart" description="Products ranked by tracked affiliate clicks.">
            <RankingChart
              rows={overview.affiliate.topProducts.map((item) => ({
                label: item.product_title,
                value: item.clicks,
              }))}
            />
          </DashboardCard>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          <DashboardCard
            title="Subscriber Growth Chart"
            description="Newsletter subscriber growth over the last 30 days."
          >
            <BarChart
              values={overview.newsletter.growth.map((item) => item.subscribers)}
              labels={overview.newsletter.growth.map((item) => item.label)}
            />
          </DashboardCard>
        </div>
        <div className="min-w-0">
          <DashboardCard title="Recent Click Activity">
            <RecentClicks clicks={overview.affiliate.recentClicks} />
          </DashboardCard>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-6 2xl:grid-cols-2">
        <div className="min-w-0">
          <DashboardCard title="Recent Subscribers">
            <div className="mb-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => exportSubscribersCsv(overview.newsletter.recentSubscribers)}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
              >
                <Download className="size-4" />
                Export CSV
              </button>
            </div>
            <RecentSubscribers subscribers={overview.newsletter.recentSubscribers} />
          </DashboardCard>
        </div>
        <div className="min-w-0">
          <DashboardCard title="Category Performance Chart">
            <RankingChart
              rows={overview.affiliate.topCategories.map((item) => ({
                label: item.category,
                value: item.clicks,
              }))}
            />
          </DashboardCard>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <div className="min-w-0">
          <DashboardCard title="Latest Products">
            <RecentActivityList items={overview.recentActivity.products} />
          </DashboardCard>
        </div>
        <div className="min-w-0">
          <DashboardCard title="Latest Blogs">
            <RecentActivityList items={overview.recentActivity.blogs} />
          </DashboardCard>
        </div>
        <div className="min-w-0 xl:col-span-2 2xl:col-span-1">
          <DashboardCard title="Latest Ingredients">
            <RecentActivityList items={overview.recentActivity.ingredients} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

function exportSubscribersCsv(subscribers: NewsletterSubscriber[]) {
  const headers = ["email", "status", "source_page", "created_at"];
  const rows = subscribers.map((subscriber) =>
    [
      subscriber.email,
      subscriber.status,
      subscriber.source_page ?? "",
      subscriber.created_at,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "suppriva-newsletter-subscribers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const chartValues = values.length ? values : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...chartValues, 1);

  return (
    <div className="flex h-[280px] w-full min-w-0 items-end gap-2 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#F7F6F2,#EAF4EC)] p-4 md:h-[320px] md:gap-3 md:p-5">
      {chartValues.map((value, index) => (
        <div key={`${labels[index] ?? index}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end rounded-pill bg-white/70 p-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div
              className="w-full rounded-pill bg-[linear-gradient(180deg,#D9A520,#0B5D3B)]"
              style={{ height: `${Math.max((value / max) * 100, value ? 12 : 4)}%` }}
            />
          </div>
          <span className="max-w-full truncate text-[10px] text-muted">{labels[index] ?? "-"}</span>
        </div>
      ))}
    </div>
  );
}

function RankingChart({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  if (!rows.length) {
    return <p className="rounded-[24px] bg-cream p-6 text-sm text-muted">No ranking data yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-2 flex justify-between gap-4 text-sm">
            <span className="min-w-0 flex-1 break-words pr-3 font-heading font-semibold text-text-dark">{row.label}</span>
            <span className="shrink-0 text-muted">{row.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-pill bg-soft-green">
            <div
              className="h-full rounded-pill bg-[linear-gradient(90deg,#0B5D3B,#D9A520)]"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentClicks({ clicks }: { clicks: EnrichedClick[] }) {
  if (!clicks.length) {
    return <p className="rounded-[24px] bg-cream p-6 text-sm text-muted">No recent clicks yet.</p>;
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-[24px] border border-border-light">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-soft-green font-heading text-text-dark">
          <tr>
            <th className="px-5 py-4">Product</th>
            <th className="px-5 py-4">Source</th>
            <th className="px-5 py-4">Time</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {clicks.map((click) => (
            <tr key={click.id} className="border-t border-border-light">
              <td className="px-5 py-4 font-heading font-semibold text-text-dark">
                {click.product_title}
              </td>
              <td className="px-5 py-4 text-muted">{click.source_label}</td>
              <td className="px-5 py-4 text-muted">
                {new Date(click.clicked_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentSubscribers({
  subscribers,
}: {
  subscribers: NewsletterSubscriber[];
}) {
  if (!subscribers.length) {
    return (
      <p className="rounded-[24px] bg-cream p-6 text-sm text-muted">
        No newsletter subscribers yet.
      </p>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-[24px] border border-border-light">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-soft-green font-heading text-text-dark">
          <tr>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Source</th>
            <th className="px-5 py-4">Joined</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {subscribers.map((subscriber) => (
            <tr key={subscriber.id} className="border-t border-border-light">
              <td className="px-5 py-4 font-heading font-semibold text-text-dark">
                {subscriber.email}
              </td>
              <td className="px-5 py-4">
                <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold capitalize text-primary">
                  {subscriber.status}
                </span>
              </td>
              <td className="px-5 py-4 text-muted">
                {subscriber.source_page ?? "Unknown"}
              </td>
              <td className="px-5 py-4 text-muted">
                {new Date(subscriber.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentActivityList({ items }: { items: RecentActivityItem[] }) {
  if (!items.length) {
    return <p className="rounded-[24px] bg-cream p-6 text-sm text-muted">No activity yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="rounded-[20px] border border-border-light bg-white px-4 py-4 transition hover:border-gold/70"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-heading text-base font-bold text-text-dark">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
            </div>
            {item.status ? (
              <span className="rounded-pill bg-soft-green px-3 py-1 text-[11px] font-semibold capitalize text-primary">
                {item.status}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-muted">
            Updated {new Date(item.updatedAt).toLocaleString()}
          </p>
        </Link>
      ))}
    </div>
  );
}
