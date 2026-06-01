"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { PageType } from "@/lib/database/constants";
import type { JsonValue, SEO } from "@/lib/database/types";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type SeoFormState = {
  page_type: PageType;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  schema_json: string;
};

type SeoResponse = {
  seoRecords?: SEO[];
  seo?: SEO | null;
  error?: string;
};

const emptyForm: SeoFormState = {
  page_type: PageType.Home,
  page_slug: "home",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  schema_json: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"WebPage\"\n}",
};

function prettyJson(value: JsonValue) {
  return JSON.stringify(value ?? {}, null, 2);
}

function seoToForm(seo: SEO): SeoFormState {
  return {
    page_type: seo.page_type,
    page_slug: seo.page_slug ?? "",
    meta_title: seo.meta_title,
    meta_description: seo.meta_description,
    canonical_url: seo.canonical_url ?? "",
    schema_json: prettyJson(seo.schema_json),
  };
}

function formToPayload(form: SeoFormState) {
  return {
    page_type: form.page_type,
    page_slug: form.page_slug,
    meta_title: form.meta_title,
    meta_description: form.meta_description,
    canonical_url: form.canonical_url || null,
    schema_json: JSON.parse(form.schema_json) as JsonValue,
  };
}

export function DashboardSeoClient() {
  const [seoRecords, setSeoRecords] = useState<SEO[]>([]);
  const [form, setForm] = useState<SeoFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [editingSeo, setEditingSeo] = useState<SEO | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSeoRecords = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/seo", { cache: "no-store" });
      const payload = (await response.json()) as SeoResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load SEO records.");
      }

      setSeoRecords(payload.seoRecords ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load SEO records.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSeoRecords();
  }, [fetchSeoRecords]);

  const filteredSeoRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return seoRecords;
    }

    return seoRecords.filter((seo) =>
      [seo.page_type, seo.page_slug ?? "", seo.meta_title, seo.meta_description]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [seoRecords, search]);

  function updateForm<K extends keyof SeoFormState>(key: K, value: SeoFormState[K]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function openCreateForm() {
    setEditingSeo(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(seo: SEO) {
    setEditingSeo(seo);
    setForm(seoToForm(seo));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitSeo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = formToPayload(form);
      const response = await fetch(editingSeo ? `/api/seo/${editingSeo.id}` : "/api/seo", {
        method: editingSeo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = (await response.json()) as SeoResponse;

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Unable to save SEO record.");
      }

      setSuccess(
        editingSeo ? "SEO record updated successfully." : "SEO record created successfully.",
      );
      setIsFormOpen(false);
      setEditingSeo(null);
      setForm(emptyForm);
      await fetchSeoRecords();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save SEO record.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSeo(seo: SEO) {
    const shouldDelete = window.confirm(
      `Delete SEO metadata for ${seo.page_type}:${seo.page_slug}?`,
    );

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/seo/${seo.id}`, { method: "DELETE" });
      const payload = (await response.json()) as SeoResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete SEO record.");
      }

      setSuccess("SEO record deleted successfully.");
      await fetchSeoRecords();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete SEO record.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="SEO Records">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
            <Search className="size-4 text-primary" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search SEO records..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchSeoRecords()}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
            >
              <Plus className="size-4" />
              Add SEO
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-[20px] border border-primary/15 bg-soft-green px-4 py-3 text-sm font-medium text-primary">
            {success}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-[24px] border border-border-light">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-soft-green font-heading text-text-dark">
              <tr>
                <th className="px-5 py-4">Page</th>
                <th className="px-5 py-4">Meta Title</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      Loading SEO records...
                    </span>
                  </td>
                </tr>
              ) : filteredSeoRecords.length ? (
                filteredSeoRecords.map((seo) => (
                  <tr key={seo.id} className="border-t border-border-light">
                    <td className="px-5 py-4">
                      <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold capitalize text-primary">
                        {seo.page_type}
                      </span>
                      <p className="mt-2 text-xs text-muted">{seo.page_slug}</p>
                    </td>
                    <td className="px-5 py-4 font-heading font-semibold text-text-dark">
                      {seo.meta_title}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-muted">
                      {seo.meta_description}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(seo.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(seo)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteSeo(seo)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-red-200 px-4 py-2 font-heading text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    No SEO records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {isFormOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-border-light bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-text-dark">
                {editingSeo ? "Edit SEO Record" : "Create SEO Record"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Manage metadata, canonical URLs, and JSON-LD for live pages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label="Close SEO form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitSeo} className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-heading text-sm font-semibold text-text-dark">Page Type</span>
              <select
                value={form.page_type}
                onChange={(event) => updateForm("page_type", event.target.value as PageType)}
                className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
              >
                {Object.values(PageType).map((pageType) => (
                  <option key={pageType} value={pageType}>
                    {pageType}
                  </option>
                ))}
              </select>
            </label>
            <InputField
              label="Page Slug"
              value={form.page_slug}
              onChange={(value) => updateForm("page_slug", value)}
              placeholder="home, search, java-burn"
              required
            />
            <InputField
              label="Meta Title"
              value={form.meta_title}
              onChange={(value) => updateForm("meta_title", value)}
              required
            />
            <InputField
              label="Canonical URL"
              value={form.canonical_url}
              onChange={(value) => updateForm("canonical_url", value)}
              placeholder="https://suppriva.com/page"
            />
            <TextAreaField
              label="Meta Description"
              value={form.meta_description}
              onChange={(value) => updateForm("meta_description", value)}
              className="lg:col-span-2"
              rows={3}
              required
            />
            <TextAreaField
              label="Schema JSON-LD"
              value={form.schema_json}
              onChange={(value) => updateForm("schema_json", value)}
              className="lg:col-span-2"
              rows={8}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingSeo ? "Update SEO" : "Create SEO"}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-light px-6 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  className = "",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        required={required}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 font-mono text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}
