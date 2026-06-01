"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import type { AffiliateClick, NewsletterSubscriber } from "@/lib/database/types";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type DashboardStats = {
  totalClicks: number;
  todayClicks: number;
  weeklyClicks: number;
  monthlyClicks: number;
  topProducts: { product_id: string; clicks: number }[];
  topCategories: { category: string; clicks: number }[];
  recentClicks: AffiliateClick[];
  trend: { label: string; clicks: number }[];
};

type StatsResponse = {
  stats?: DashboardStats;
  error?: string;
};

type NewsletterStats = {
  totalSubscribers: number;
  newToday: number;
  weeklySubscribers: number;
  monthlySubscribers: number;
  recentSubscribers: NewsletterSubscriber[];
  growth: { label: string; subscribers: number }[];
};

type NewsletterStatsResponse = {
  stats?: NewsletterStats;
  error?: string;
};

const emptyStats: DashboardStats = {
  totalClicks: 0,
  todayClicks: 0,
  weeklyClicks: 0,
  monthlyClicks: 0,
  topProducts: [],
  topCategories: [],
  recentClicks: [],
  trend: [],
};

const emptyNewsletterStats: NewsletterStats = {
  totalSubscribers: 0,
  newToday: 0,
  weeklySubscribers: 0,
  monthlySubscribers: 0,
  recentSubscribers: [],
  growth: [],
};

export function DashboardAnalyticsClient() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [newsletterStats, setNewsletterStats] =
    useState<NewsletterStats>(emptyNewsletterStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [affiliateResponse, newsletterResponse] = await Promise.all([
        fetch("/api/affiliate-clicks/stats", { cache: "no-store" }),
        fetch("/api/newsletter/stats", { cache: "no-store" }),
      ]);
      const affiliatePayload = (await affiliateResponse.json()) as StatsResponse;
      const newsletterPayload =
        (await newsletterResponse.json()) as NewsletterStatsResponse;

      if (!affiliateResponse.ok) {
        throw new Error(affiliatePayload.error ?? "Unable to load affiliate analytics.");
      }

      if (!newsletterResponse.ok) {
        throw new Error(
          newsletterPayload.error ?? "Unable to load newsletter analytics.",
        );
      }

      setStats(affiliatePayload.stats ?? emptyStats);
      setNewsletterStats(newsletterPayload.stats ?? emptyNewsletterStats);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load affiliate analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const statCards = useMemo(
    () => [
      { label: "Total Clicks", value: String(stats.totalClicks), change: "Live" },
      { label: "Today's Clicks", value: String(stats.todayClicks), change: "Today" },
      { label: "Weekly Clicks", value: String(stats.weeklyClicks), change: "7 days" },
      { label: "Monthly Clicks", value: String(stats.monthlyClicks), change: "30 days" },
      {
        label: "Top Products",
        value: String(stats.topProducts.length),
        change: "Ranked",
      },
      {
        label: "Subscribers",
        value: String(newsletterStats.totalSubscribers),
        change: "Active",
      },
    ],
    [stats, newsletterStats],
  );

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-border-light bg-white p-10 text-center text-sm text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          Loading affiliate analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void fetchStats()}
          className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
        >
          <RefreshCw className="size-4" />
          Refresh Analytics
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "New Subscribers Today",
            value: String(newsletterStats.newToday),
            change: "Today",
          },
          {
            label: "Weekly Subscribers",
            value: String(newsletterStats.weeklySubscribers),
            change: "7 days",
          },
          {
            label: "Monthly Subscribers",
            value: String(newsletterStats.monthlySubscribers),
            change: "30 days",
          },
          {
            label: "Recent Subscribers",
            value: String(newsletterStats.recentSubscribers.length),
            change: "Latest",
          },
        ].map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Click Trend Chart" description="Affiliate click activity over recent days.">
          <BarChart values={stats.trend.map((item) => item.clicks)} labels={stats.trend.map((item) => item.label)} />
        </DashboardCard>
        <DashboardCard title="Recent Click Activity">
          <RecentClicks clicks={stats.recentClicks} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard
          title="Subscriber Growth Chart"
          description="Newsletter subscriber growth over recent days."
        >
          <BarChart
            values={newsletterStats.growth.map((item) => item.subscribers)}
            labels={newsletterStats.growth.map((item) => item.label)}
          />
        </DashboardCard>
        <DashboardCard title="Recent Subscribers">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => exportSubscribersCsv(newsletterStats.recentSubscribers)}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
            >
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
          <RecentSubscribers subscribers={newsletterStats.recentSubscribers} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Top Products Chart">
          <RankingChart
            rows={stats.topProducts.map((item) => ({
              label: item.product_id.slice(0, 8),
              value: item.clicks,
            }))}
          />
        </DashboardCard>
        <DashboardCard title="Category Performance Chart">
          <RankingChart
            rows={stats.topCategories.map((item) => ({
              label: item.category,
              value: item.clicks,
            }))}
          />
        </DashboardCard>
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
    <div className="flex h-[320px] items-end gap-3 rounded-[24px] bg-[linear-gradient(135deg,#F7F6F2,#EAF4EC)] p-5">
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
    return <p className="rounded-[24px] bg-cream p-6 text-sm text-muted">No click data yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-2 flex justify-between gap-4 text-sm">
            <span className="font-heading font-semibold text-text-dark">{row.label}</span>
            <span className="text-muted">{row.value}</span>
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

function RecentClicks({ clicks }: { clicks: AffiliateClick[] }) {
  if (!clicks.length) {
    return <p className="rounded-[24px] bg-cream p-6 text-sm text-muted">No recent clicks yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-[24px] border border-border-light">
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
                {click.product_id.slice(0, 8)}
              </td>
              <td className="px-5 py-4 text-muted">{click.source_page ?? "Direct"}</td>
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
    <div className="overflow-x-auto rounded-[24px] border border-border-light">
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
