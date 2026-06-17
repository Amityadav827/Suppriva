"use client";

import { MediaLibraryField } from "@/components/dashboard/media/MediaLibraryField";
import { ContentStatus } from "@/lib/database/constants";
import type { Category } from "@/lib/database/types";
import { motion } from "framer-motion";
import {
  FolderPlus,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type CategoryFormState = {
  title: string;
  slug: string;
  description: string;
  image: string;
  status: ContentStatus;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
};

type CategoriesResponse = {
  categories?: Category[];
  category?: Category;
  error?: string;
};

const emptyForm: CategoryFormState = {
  title: "",
  slug: "",
  description: "",
  image: "",
  status: ContentStatus.Draft,
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

function commaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function categoryToForm(category: Category): CategoryFormState {
  return {
    title: category.title ?? category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    status: category.status,
    seo_title: category.seo_title ?? "",
    seo_description: category.seo_description ?? "",
    seo_keywords: category.seo_keywords.join(", "),
  };
}

function formToPayload(form: CategoryFormState) {
  return {
    title: form.title,
    slug: form.slug || undefined,
    description: form.description || null,
    image: form.image || null,
    status: form.status,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    seo_keywords: commaList(form.seo_keywords),
  };
}

export function DashboardCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/categories", { cache: "no-store" });
      const payload = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load categories.");
      }

      setCategories(payload.categories ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [
        category.title ?? category.name,
        category.slug,
        category.description ?? "",
        category.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [categories, search]);

  function updateForm<K extends keyof CategoryFormState>(key: K, value: CategoryFormState[K]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function openCreateForm() {
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setForm(categoryToForm(category));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories",
        {
          method: editingCategory ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(form)),
        },
      );
      const payload = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save category.");
      }

      setSuccess(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully.",
      );
      setIsFormOpen(false);
      setEditingCategory(null);
      setForm(emptyForm);
      await fetchCategories();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    const title = category.title ?? category.name;
    const shouldDelete = window.confirm(`Delete ${title}? This will soft delete it.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      const payload = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete category.");
      }

      setSuccess("Category deleted successfully.");
      await fetchCategories();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete category.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
          <Search className="size-4 text-primary" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void fetchCategories()}
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
            <FolderPlus className="size-4" />
            Add Category
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[20px] border border-primary/15 bg-soft-green px-4 py-3 text-sm font-medium text-primary">
          {success}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[28px] border border-border-light bg-white p-10 text-center text-sm text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading categories...
          </span>
        </div>
      ) : filteredCategories.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredCategories.map((category, index) => {
            const title = category.title ?? category.name;

            return (
              <article
                key={category.id}
                className="rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-premium"
              >
                <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
                  Category {index + 1}
                </p>
                <h2 className="mt-3 font-heading text-xl font-extrabold text-text-dark">
                  {title}
                </h2>
                <p className="mt-2 text-xs text-muted">{category.slug}</p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted">
                  {category.description ??
                    "SEO-ready supplement collection with product and article mapping."}
                </p>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold capitalize text-primary">
                    {category.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(category)}
                      className="rounded-pill border border-border-light p-2 text-primary transition hover:border-gold/70"
                      aria-label={`Edit ${title}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteCategory(category)}
                      className="rounded-pill border border-red-200 p-2 text-red-600 transition hover:border-red-300 hover:bg-red-50"
                      aria-label={`Delete ${title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-border-light bg-white p-10 text-center text-sm text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
          No categories found.
        </div>
      )}

      {isFormOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-border-light bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-text-dark">
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Manage category discovery, SEO metadata, and dashboard-ready status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label="Close category form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitCategory} className="grid gap-4 lg:grid-cols-2">
            <InputField
              label="Title"
              value={form.title}
              onChange={(value) => updateForm("title", value)}
              required
            />
            <InputField
              label="Slug"
              value={form.slug}
              onChange={(value) => updateForm("slug", value)}
              placeholder="auto-generated if empty"
            />
            <MediaLibraryField
              label="Category Image"
              value={form.image}
              onChange={(value) => updateForm("image", value)}
              className="lg:col-span-2"
              helperText="Upload a new image or choose an existing asset from the Media Library."
            />
            <label className="grid gap-2">
              <span className="font-heading text-sm font-semibold text-text-dark">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value as ContentStatus)}
                className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
              >
                <option value={ContentStatus.Draft}>Draft</option>
                <option value={ContentStatus.Published}>Published</option>
                <option value={ContentStatus.Archived}>Archived</option>
              </select>
            </label>
            <InputField
              label="SEO Title"
              value={form.seo_title}
              onChange={(value) => updateForm("seo_title", value)}
            />
            <InputField
              label="SEO Keywords"
              value={form.seo_keywords}
              onChange={(value) => updateForm("seo_keywords", value)}
              placeholder="weight loss, metabolism, wellness"
            />
            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) => updateForm("description", value)}
            />
            <TextAreaField
              label="SEO Description"
              value={form.seo_description}
              onChange={(value) => updateForm("seo_description", value)}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingCategory ? "Update Category" : "Create Category"}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}
