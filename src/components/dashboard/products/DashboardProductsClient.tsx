"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ImageUploader } from "@/components/dashboard/media/ImageUploader";
import { ContentStatus } from "@/lib/database/constants";
import type { Category, FAQItem, Ingredient, JsonValue, Product } from "@/lib/database/types";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ProductFormState = {
  title: string;
  slug: string;
  category_id: string;
  short_description: string;
  full_description: string;
  image: string;
  gallery: string;
  rating: string;
  affiliate_url: string;
  ingredients: string;
  benefits: string;
  pros: string;
  cons: string;
  faq: string;
  status: ContentStatus;
  seo_title: string;
  seo_description: string;
};

type ProductsResponse = {
  products?: Product[];
  product?: Product;
  error?: string;
};

type CategoriesResponse = {
  categories?: Category[];
  error?: string;
};

const emptyForm: ProductFormState = {
  title: "",
  slug: "",
  category_id: "",
  short_description: "",
  full_description: "",
  image: "",
  gallery: "",
  rating: "",
  affiliate_url: "",
  ingredients: "",
  benefits: "",
  pros: "",
  cons: "",
  faq: "",
  status: ContentStatus.Draft,
  seo_title: "",
  seo_description: "",
};

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseIngredients(value: string): Ingredient[] {
  return lines(value).map((item) => {
    const [name, description = ""] = item.split("|").map((part) => part.trim());

    return { name, description };
  });
}

function parseBenefits(value: string): JsonValue[] {
  return lines(value).map((item) => {
    const [title, description = ""] = item.split("|").map((part) => part.trim());

    return { title, description };
  });
}

function parseFaq(value: string): FAQItem[] {
  return lines(value).map((item) => {
    const [question, answer = ""] = item.split("|").map((part) => part.trim());

    return { question, answer };
  });
}

function productToForm(product: Product): ProductFormState {
  return {
    title: product.title,
    slug: product.slug,
    category_id: product.category_id ?? "",
    short_description: product.short_description ?? "",
    full_description: product.full_description ?? "",
    image: product.image ?? "",
    gallery: product.gallery.join(", "),
    rating: product.rating?.toString() ?? "",
    affiliate_url: product.affiliate_url ?? "",
    ingredients: product.ingredients
      .map((item) => `${item.name}${item.description ? ` | ${item.description}` : ""}`)
      .join("\n"),
    benefits: product.benefits
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const title = "title" in item && typeof item.title === "string" ? item.title : "";
          const description =
            "description" in item && typeof item.description === "string"
              ? item.description
              : "";

          return `${title}${description ? ` | ${description}` : ""}`;
        }

        return String(item ?? "");
      })
      .join("\n"),
    pros: product.pros.join("\n"),
    cons: product.cons.join("\n"),
    faq: product.faq.map((item) => `${item.question} | ${item.answer}`).join("\n"),
    status: product.status,
    seo_title: product.seo_title ?? "",
    seo_description: product.seo_description ?? "",
  };
}

function formToPayload(form: ProductFormState) {
  return {
    title: form.title,
    slug: form.slug || undefined,
    category_id: form.category_id || null,
    short_description: form.short_description || null,
    full_description: form.full_description || null,
    image: form.image || null,
    gallery: commaList(form.gallery),
    rating: form.rating ? Number(form.rating) : null,
    affiliate_url: form.affiliate_url || null,
    ingredients: parseIngredients(form.ingredients),
    benefits: parseBenefits(form.benefits),
    pros: lines(form.pros),
    cons: lines(form.cons),
    faq: parseFaq(form.faq),
    status: form.status,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
  };
}

function getCategoryTitle(categories: Category[], categoryId: string | null) {
  if (!categoryId) {
    return "Unassigned";
  }

  return categories.find((category) => category.id === categoryId)?.title ?? "Unknown category";
}

export function DashboardProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const payload = (await response.json()) as ProductsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load products.");
      }

      setProducts(payload.products ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);

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
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
  }, [fetchCategories, fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.title,
        product.slug,
        product.status,
        product.short_description ?? "",
        getCategoryTitle(categories, product.category_id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [categories, products, search]);

  function updateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function openCreateForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm(productToForm(product));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingProduct ? `/api/products/${editingProduct.id}` : "/api/products",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(form)),
        },
      );
      const payload = (await response.json()) as ProductsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save product.");
      }

      setSuccess(editingProduct ? "Product updated successfully." : "Product created successfully.");
      setIsFormOpen(false);
      setEditingProduct(null);
      setForm(emptyForm);
      await fetchProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const shouldDelete = window.confirm(`Delete ${product.title}? This will soft delete it.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const payload = (await response.json()) as ProductsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete product.");
      }

      setSuccess("Product deleted successfully.");
      await fetchProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Product Library">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
            <Search className="size-4 text-primary" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchProducts()}
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
              Add Product
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
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-soft-green font-heading text-text-dark">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      Loading products...
                    </span>
                  </td>
                </tr>
              ) : filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-border-light">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-heading font-semibold text-text-dark">
                          {product.title}
                        </span>
                        <p className="mt-1 text-xs text-muted">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {getCategoryTitle(categories, product.category_id)}
                    </td>
                    <td className="px-5 py-4 text-muted">{product.rating ?? "Not rated"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold capitalize text-primary">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProduct(product)}
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
                    No products found.
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
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Add Supabase-ready product content, affiliate fields, and SEO metadata.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label="Close product form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitProduct} className="grid gap-4 lg:grid-cols-2">
            <InputField label="Title" value={form.title} onChange={(value) => updateForm("title", value)} required />
            <InputField label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} placeholder="auto-generated if empty" />
            <CategorySelect
              value={form.category_id}
              categories={categories}
              isLoading={isCategoriesLoading}
              onChange={(value) => updateForm("category_id", value)}
            />
            <InputField label="Rating" value={form.rating} onChange={(value) => updateForm("rating", value)} placeholder="4.8" />
            <ImageUploader
              label="Product Image"
              value={form.image}
              onChange={(value) => updateForm("image", value)}
              bucket={STORAGE_BUCKETS.products}
              folder="products"
              className="lg:col-span-2"
            />
            <InputField label="Affiliate URL" value={form.affiliate_url} onChange={(value) => updateForm("affiliate_url", value)} />
            <InputField label="SEO Title" value={form.seo_title} onChange={(value) => updateForm("seo_title", value)} />
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
            <TextAreaField label="Short Description" value={form.short_description} onChange={(value) => updateForm("short_description", value)} />
            <TextAreaField label="SEO Description" value={form.seo_description} onChange={(value) => updateForm("seo_description", value)} />
            <TextAreaField label="Full Description" value={form.full_description} onChange={(value) => updateForm("full_description", value)} className="lg:col-span-2" rows={4} />
            <TextAreaField label="Gallery URLs" value={form.gallery} onChange={(value) => updateForm("gallery", value)} placeholder="Comma separated URLs" />
            <TextAreaField label="Pros" value={form.pros} onChange={(value) => updateForm("pros", value)} placeholder="One item per line" />
            <TextAreaField label="Cons" value={form.cons} onChange={(value) => updateForm("cons", value)} placeholder="One item per line" />
            <TextAreaField label="Ingredients" value={form.ingredients} onChange={(value) => updateForm("ingredients", value)} placeholder="Name | Benefit, one per line" />
            <TextAreaField label="Benefits" value={form.benefits} onChange={(value) => updateForm("benefits", value)} placeholder="Title | Description, one per line" />
            <TextAreaField label="FAQ" value={form.faq} onChange={(value) => updateForm("faq", value)} placeholder="Question | Answer, one per line" />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingProduct ? "Update Product" : "Create Product"}
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

function CategorySelect({
  categories,
  isLoading,
  onChange,
  value,
}: {
  categories: Category[];
  isLoading: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const selectedCategory = categories.find((category) => category.id === value);
  const [query, setQuery] = useState(selectedCategory?.title ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedCategory?.title ?? "");
  }, [selectedCategory?.title]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery || selectedCategory?.title === query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.title, category.name, category.slug]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [categories, query, selectedCategory?.title]);

  return (
    <label className="relative grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">Category</span>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary"
          aria-hidden="true"
        />
        <input
          value={query}
          onBlur={() => {
            window.setTimeout(() => {
              setIsOpen(false);
              setQuery(selectedCategory?.title ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery(selectedCategory?.title ?? "");
          }}
          placeholder={isLoading ? "Loading categories..." : "Search and select category"}
          className="min-h-12 w-full rounded-[18px] border border-border-light bg-white px-11 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
        />
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[76px] z-20 max-h-64 overflow-y-auto rounded-[20px] border border-border-light bg-white p-2 shadow-[0_20px_52px_rgba(15,23,42,0.12)]">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
              <Loader2 className="size-4 animate-spin text-primary" />
              Loading categories...
            </div>
          ) : filteredCategories.length ? (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(category.id);
                  setQuery(category.title);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-3 text-left text-sm transition hover:bg-soft-green ${
                  category.id === value ? "bg-soft-green text-primary" : "text-text-dark"
                }`}
              >
                <span className="font-heading font-semibold">{category.title}</span>
                <span className="text-xs capitalize text-muted">{category.status}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-muted">No categories found.</div>
          )}
        </div>
      ) : null}

      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setQuery("");
          }}
          className="w-fit font-heading text-xs font-semibold text-muted transition hover:text-primary"
        >
          Clear category
        </button>
      ) : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}
