"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw, Save } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

type HomepageSectionsResponse = {
  sections?: HomepageSectionConfig[];
  error?: string;
};

function sortSections(sections: HomepageSectionConfig[]) {
  return [...sections].sort((a, b) => a.sort_order - b.sort_order);
}

export function DashboardHomepageClient() {
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sortedSections = useMemo(() => sortSections(sections), [sections]);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-sections", { cache: "no-store" });
      const payload = (await response.json()) as HomepageSectionsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load homepage sections.");
      }

      setSections(sortSections(payload.sections ?? []));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load homepage sections.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSections();
  }, [fetchSections]);

  function updateSection(
    sectionKey: string,
    field: keyof HomepageSectionConfig,
    value: string | number | boolean | null,
  ) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section_key === sectionKey ? { ...section, [field]: value } : section,
      ),
    );
  }

  async function saveSections() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-sections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      });
      const payload = (await response.json()) as HomepageSectionsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save homepage sections.");
      }

      setSections(sortSections(payload.sections ?? []));
      setSuccess("Homepage CMS settings saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save homepage sections.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardCard
      title="Homepage CMS"
      description="Control homepage section visibility, order, titles, subtitles, and CTA defaults."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm leading-6 text-muted">
          {sections.length} homepage sections configured for the public landing page.
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void fetchSections()}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void saveSections()}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save Homepage CMS"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-border-light">
        <div className="hidden grid-cols-[1.1fr_120px_140px_1fr_1fr] gap-4 bg-soft-green px-5 py-4 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary lg:grid">
          <span>Section</span>
          <span>Visible</span>
          <span>Order</span>
          <span>Title / Subtitle</span>
          <span>CTA</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-muted">
            Loading homepage sections...
          </div>
        ) : sortedSections.length ? (
          sortedSections.map((section) => (
            <div
              key={section.section_key}
              className="grid gap-4 border-t border-border-light px-5 py-5 first:border-t-0 lg:grid-cols-[1.1fr_120px_140px_1fr_1fr] lg:items-start"
            >
              <div>
                <p className="font-heading text-base font-extrabold text-text-dark">
                  {section.section_name}
                </p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  {section.section_key}
                </p>
              </div>

              <label className="inline-flex w-fit items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-3 font-heading text-sm font-semibold text-text-dark">
                <input
                  type="checkbox"
                  checked={section.is_visible}
                  onChange={(event) =>
                    updateSection(section.section_key, "is_visible", event.target.checked)
                  }
                  className="size-4 accent-primary"
                />
                {section.is_visible ? (
                  <Eye className="size-4 text-primary" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-4 text-muted" aria-hidden="true" />
                )}
                Visible
              </label>

              <label className="grid gap-2">
                <span className="font-heading text-xs font-semibold text-muted lg:hidden">
                  Sort Order
                </span>
                <input
                  type="number"
                  min={0}
                  value={section.sort_order}
                  onChange={(event) =>
                    updateSection(
                      section.section_key,
                      "sort_order",
                      Number(event.target.value),
                    )
                  }
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
              </label>

              <div className="grid gap-3">
                <input
                  type="text"
                  value={section.title ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "title", event.target.value)
                  }
                  placeholder="Section title"
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
                <textarea
                  value={section.subtitle ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "subtitle", event.target.value)
                  }
                  placeholder="Section subtitle"
                  rows={3}
                  className="rounded-2xl border border-border-light bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-gold"
                />
              </div>

              <div className="grid gap-3">
                <input
                  type="text"
                  value={section.cta_label ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "cta_label", event.target.value)
                  }
                  placeholder="CTA label"
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
                <input
                  type="text"
                  value={section.cta_url ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "cta_url", event.target.value)
                  }
                  placeholder="/example or https://example.com"
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-12 text-center text-muted">
            No homepage sections found.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
