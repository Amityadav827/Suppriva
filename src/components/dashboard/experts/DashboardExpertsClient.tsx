"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MediaLibraryField } from "@/components/dashboard/media/MediaLibraryField";
import type {
  Author,
  Blog,
  Category,
  Expert,
  ExpertContentReviewedItem,
  Ingredient,
  Product,
  Reviewer,
} from "@/lib/database/types";
import { ContentStatus } from "@/lib/database/constants";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const EXPERTISE_OPTIONS = [
  "Integrative Healthcare",
  "Ayurveda",
  "Herbal Wellness",
  "Preventive Lifestyle",
  "Nutrition",
  "Supplement Education",
  "Public Health",
  "Wellness Research",
  "Lifestyle Medicine",
  "Wellness Coaching",
] as const;

type DashboardExpertsClientProps = {
  initialCreateOpen?: boolean;
};

type ExpertFormState = {
  name: string;
  slug: string;
  profile_image: string;
  designation: string;
  short_bio: string;
  full_bio: string;
  editorial_contribution: string;
  content_reviewed: ContentReviewedFormItem[];
  experience_years: string;
  linkedin_url: string;
  website_url: string;
  email: string;
  expertise_tags: string[];
  status: "active" | "inactive";
  display_order: string;
  featured_on_homepage: boolean;
  seo_title: string;
  seo_description: string;
  meta_image: string;
  linked_author_id: string;
  linked_reviewer_id: string;
};

type ContentReviewedFormItem = {
  label: string;
  value: string;
  description: string;
};

type ExpertResponse = {
  expert?: Expert;
  experts?: Expert[];
  error?: string;
};

type AuthorResponse = { authors?: Author[]; error?: string };
type ReviewerResponse = { reviewers?: Reviewer[]; error?: string };
type ProductResponse = { products?: Product[]; error?: string };
type BlogResponse = { blogs?: Blog[]; error?: string };
type IngredientResponse = { ingredients?: Ingredient[]; error?: string };
type CategoryResponse = { categories?: Category[]; error?: string };

const emptyForm: ExpertFormState = {
  name: "",
  slug: "",
  profile_image: "",
  designation: "",
  short_bio: "",
  full_bio: "",
  editorial_contribution: "",
  content_reviewed: [
    {
      label: "Ingredient Guides",
      value: "0",
      description: "Published ingredient education and research resources.",
    },
    {
      label: "Product Reviews",
      value: "0",
      description: "Supplement product reviews and comparison resources.",
    },
    {
      label: "Wellness Articles",
      value: "0",
      description: "Educational wellness articles and practical guides.",
    },
    {
      label: "Health Goal Pages",
      value: "0",
      description: "Health goal pages and wellness category resources.",
    },
  ],
  experience_years: "",
  linkedin_url: "",
  website_url: "",
  email: "",
  expertise_tags: [],
  status: "active",
  display_order: "0",
  featured_on_homepage: false,
  seo_title: "",
  seo_description: "",
  meta_image: "",
  linked_author_id: "",
  linked_reviewer_id: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isPublishedRecord<T extends { status?: ContentStatus; deleted_at?: string | null }>(
  item: T,
) {
  return item.status === ContentStatus.Published && item.deleted_at === null;
}

function contentReviewedToForm(
  items?: ExpertContentReviewedItem[] | null,
): ContentReviewedFormItem[] {
  if (!items?.length) {
    return emptyForm.content_reviewed.map((item) => ({ ...item }));
  }

  return items.map((item) => ({
    label: item.label,
    value: item.value.toString(),
    description: item.description ?? "",
  }));
}

function contentReviewedToPayload(
  items: ContentReviewedFormItem[],
): ExpertContentReviewedItem[] {
  return items
    .map((item) => ({
      label: item.label.trim(),
      value: Math.max(0, Math.trunc(Number(item.value) || 0)),
      description: item.description.trim() || null,
    }))
    .filter((item) => item.label);
}

function getContentReviewedTotal(expert: Expert, fallbackTotal: number) {
  if (!expert.content_reviewed?.length) {
    return fallbackTotal;
  }

  return expert.content_reviewed.reduce((total, item) => total + (Number(item.value) || 0), 0);
}

function expertToForm(expert: Expert): ExpertFormState {
  return {
    name: expert.name,
    slug: expert.slug,
    profile_image: expert.profile_image ?? "",
    designation: expert.designation ?? "",
    short_bio: expert.short_bio ?? "",
    full_bio: expert.full_bio ?? "",
    editorial_contribution: expert.editorial_contribution ?? "",
    content_reviewed: contentReviewedToForm(expert.content_reviewed),
    experience_years: expert.experience_years?.toString() ?? "",
    linkedin_url: expert.linkedin_url ?? "",
    website_url: expert.website_url ?? "",
    email: expert.email ?? "",
    expertise_tags: expert.expertise_tags ?? [],
    status: expert.status,
    display_order: expert.display_order.toString(),
    featured_on_homepage: expert.featured_on_homepage,
    seo_title: expert.seo_title ?? "",
    seo_description: expert.seo_description ?? "",
    meta_image: expert.meta_image ?? "",
    linked_author_id: expert.linked_author_id ?? "",
    linked_reviewer_id: expert.linked_reviewer_id ?? "",
  };
}

function formToPayload(form: ExpertFormState) {
  return {
    name: form.name,
    slug: form.slug || undefined,
    profile_image: form.profile_image || null,
    designation: form.designation || null,
    short_bio: form.short_bio || null,
    full_bio: form.full_bio || null,
    editorial_contribution: form.editorial_contribution || null,
    content_reviewed: contentReviewedToPayload(form.content_reviewed),
    experience_years: form.experience_years ? Number(form.experience_years) : null,
    linkedin_url: form.linkedin_url || null,
    website_url: form.website_url || null,
    email: form.email || null,
    expertise_tags: form.expertise_tags,
    status: form.status,
    display_order: form.display_order ? Number(form.display_order) : 0,
    featured_on_homepage: form.featured_on_homepage,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    meta_image: form.meta_image || null,
    linked_author_id: form.linked_author_id || null,
    linked_reviewer_id: form.linked_reviewer_id || null,
  };
}

function matchesExpert(expert: Expert, record: { author_id?: string | null; reviewer_id?: string | null }) {
  return Boolean(
    (expert.linked_author_id && record.author_id === expert.linked_author_id) ||
      (expert.linked_reviewer_id && record.reviewer_id === expert.linked_reviewer_id),
  );
}

export function DashboardExpertsClient({
  initialCreateOpen = false,
}: DashboardExpertsClientProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ExpertFormState>(emptyForm);
  const [customTag, setCustomTag] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(initialCreateOpen);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [
        expertsResponse,
        authorsResponse,
        reviewersResponse,
        productsResponse,
        blogsResponse,
        ingredientsResponse,
        categoriesResponse,
      ] = await Promise.all([
        fetch("/api/experts", { cache: "no-store" }),
        fetch("/api/authors?active=true", { cache: "no-store" }),
        fetch("/api/reviewers?active=true", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/blogs", { cache: "no-store" }),
        fetch("/api/ingredients", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      const expertsPayload = (await expertsResponse.json()) as ExpertResponse;
      const authorsPayload = (await authorsResponse.json()) as AuthorResponse;
      const reviewersPayload = (await reviewersResponse.json()) as ReviewerResponse;
      const productsPayload = (await productsResponse.json()) as ProductResponse;
      const blogsPayload = (await blogsResponse.json()) as BlogResponse;
      const ingredientsPayload = (await ingredientsResponse.json()) as IngredientResponse;
      const categoriesPayload = (await categoriesResponse.json()) as CategoryResponse;

      if (!expertsResponse.ok) throw new Error(expertsPayload.error ?? "Unable to load experts.");
      if (!authorsResponse.ok) throw new Error(authorsPayload.error ?? "Unable to load authors.");
      if (!reviewersResponse.ok) throw new Error(reviewersPayload.error ?? "Unable to load reviewers.");
      if (!productsResponse.ok) throw new Error(productsPayload.error ?? "Unable to load products.");
      if (!blogsResponse.ok) throw new Error(blogsPayload.error ?? "Unable to load blogs.");
      if (!ingredientsResponse.ok) throw new Error(ingredientsPayload.error ?? "Unable to load ingredients.");
      if (!categoriesResponse.ok) throw new Error(categoriesPayload.error ?? "Unable to load categories.");

      setExperts(expertsPayload.experts ?? []);
      setAuthors(authorsPayload.authors ?? []);
      setReviewers(reviewersPayload.reviewers ?? []);
      setProducts(productsPayload.products ?? []);
      setBlogs(blogsPayload.blogs ?? []);
      setIngredients(ingredientsPayload.ingredients ?? []);
      setCategories(categoriesPayload.categories ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load experts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const expertCounts = useMemo(() => {
    const publishedProducts = products.filter(isPublishedRecord);
    const publishedBlogs = blogs.filter(isPublishedRecord);
    const publishedIngredients = ingredients.filter(isPublishedRecord);
    const publishedCategories = categories.filter(isPublishedRecord);

    return new Map(
      experts.map((expert) => {
        const relatedProducts = publishedProducts.filter((product) => matchesExpert(expert, product));
        const relatedBlogs = publishedBlogs.filter((blog) => matchesExpert(expert, blog));
        const relatedIngredients = publishedIngredients.filter((ingredient) =>
          matchesExpert(expert, ingredient),
        );
        const categoryIds = new Set(
          [...relatedProducts, ...relatedBlogs]
            .map((record) => record.category_id)
            .filter((value): value is string => Boolean(value)),
        );
        const relatedCategories = publishedCategories.filter((category) => categoryIds.has(category.id));

        return [
          expert.id,
          relatedProducts.length +
            relatedBlogs.length +
            relatedIngredients.length +
            relatedCategories.length,
        ];
      }),
    );
  }, [blogs, categories, experts, ingredients, products]);

  const filteredExperts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experts.filter((expert) => {
      const matchesStatus =
        statusFilter === "all" ? true : expert.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        expert.name,
        expert.slug,
        expert.designation ?? "",
        expert.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [experts, search, statusFilter]);

  function updateForm<K extends keyof ExpertFormState>(key: K, value: ExpertFormState[K]) {
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [key]: value };

      if (key === "name" && !currentForm.slug.trim()) {
        nextForm.slug = slugify(String(value));
      }

      return nextForm;
    });
  }

  function toggleTag(tag: string) {
    setForm((current) => ({
      ...current,
      expertise_tags: current.expertise_tags.includes(tag)
        ? current.expertise_tags.filter((item) => item !== tag)
        : [...current.expertise_tags, tag],
    }));
  }

  function addCustomTag() {
    const tag = customTag.trim();

    if (!tag || form.expertise_tags.includes(tag)) {
      setCustomTag("");
      return;
    }

    updateForm("expertise_tags", [...form.expertise_tags, tag]);
    setCustomTag("");
  }

  function updateContentReviewedItem(
    index: number,
    key: keyof ContentReviewedFormItem,
    value: string,
  ) {
    updateForm(
      "content_reviewed",
      form.content_reviewed.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function addContentReviewedItem() {
    updateForm("content_reviewed", [
      ...form.content_reviewed,
      { label: "", value: "0", description: "" },
    ]);
  }

  function removeContentReviewedItem(index: number) {
    updateForm(
      "content_reviewed",
      form.content_reviewed.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function openCreateForm() {
    setEditingExpert(null);
    setForm(emptyForm);
    setCustomTag("");
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(expert: Expert) {
    setEditingExpert(expert);
    setForm(expertToForm(expert));
    setCustomTag("");
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitExpert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingExpert ? `/api/experts/${editingExpert.id}` : "/api/experts",
        {
          method: editingExpert ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(form)),
        },
      );
      const payload = (await response.json()) as ExpertResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save expert.");
      }

      setSuccess(editingExpert ? "Expert updated successfully." : "Expert created successfully.");
      setIsFormOpen(false);
      setEditingExpert(null);
      setForm(emptyForm);
      setCustomTag("");
      await fetchData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save expert.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteExpert(expert: Expert) {
    const shouldDelete = window.confirm(`Delete ${expert.name}?`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/experts/${expert.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete expert.");
      }

      setSuccess("Expert deleted successfully.");
      await fetchData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete expert.");
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Experts Directory">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
              <Search className="size-4 text-primary" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search experts..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <label className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 text-sm font-medium text-text-dark shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <span className="text-muted">Status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | "active" | "inactive")
                }
                className="bg-transparent font-semibold outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchData()}
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
              Add Expert
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
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-soft-green font-heading text-text-dark">
              <tr>
                <th className="px-5 py-4">Expert</th>
                <th className="px-5 py-4">Designation</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Experience</th>
                <th className="px-5 py-4">Content Reviewed</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      Loading experts...
                    </span>
                  </td>
                </tr>
              ) : filteredExperts.length ? (
                filteredExperts.map((expert) => (
                  <tr key={expert.id} className="border-t border-border-light align-top">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-soft-green">
                          {expert.profile_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={expert.profile_image}
                              alt={expert.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-heading text-sm font-bold text-primary">
                              {expert.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-text-dark">{expert.name}</p>
                          <p className="text-xs text-muted">{expert.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{expert.designation || "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-pill px-3 py-1 text-xs font-semibold ${
                          expert.status === "active"
                            ? "bg-soft-green text-primary"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {expert.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-pill px-3 py-1 text-xs font-semibold ${
                          expert.featured_on_homepage
                            ? "bg-gold/15 text-primary"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {expert.featured_on_homepage ? "Featured" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{expert.display_order}</td>
                    <td className="px-5 py-4 text-muted">
                      {expert.experience_years ? `${expert.experience_years} years` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-heading font-semibold text-text-dark">
                        {getContentReviewedTotal(expert, expertCounts.get(expert.id) ?? 0)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(expert.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/experts/${expert.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <ExternalLink className="size-3.5" />
                          Preview
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditForm(expert)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteExpert(expert)}
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
                  <td colSpan={9} className="px-5 py-10 text-center text-muted">
                    No experts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {isFormOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_24px_80px_rgba(6,57,33,0.09)] md:p-8"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
                {editingExpert ? "Edit Expert" : "Add Expert"}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-text-dark md:text-3xl">
                {editingExpert ? editingExpert.name : "Create a new expert profile"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingExpert(null);
                setForm(emptyForm);
                setCustomTag("");
              }}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border-light text-muted transition hover:text-text-dark"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitExpert} className="space-y-8">
            <section className="grid gap-5 lg:grid-cols-2">
              <MediaLibraryField
                label="Profile Image"
                value={form.profile_image}
                onChange={(value) => updateForm("profile_image", value)}
                helperText="Use a clear portrait image for the public advisory board."
              />

              <div className="grid gap-4">
                <InputField label="Name" value={form.name} onChange={(value) => updateForm("name", value)} required />
                <InputField label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} required />
                <InputField label="Designation" value={form.designation} onChange={(value) => updateForm("designation", value)} />
                <InputField
                  label="Experience Years"
                  type="number"
                  value={form.experience_years}
                  onChange={(value) => updateForm("experience_years", value)}
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <InputField label="LinkedIn URL" value={form.linkedin_url} onChange={(value) => updateForm("linkedin_url", value)} />
              <InputField label="Website URL" value={form.website_url} onChange={(value) => updateForm("website_url", value)} />
              <InputField label="Email" type="email" value={form.email} onChange={(value) => updateForm("email", value)} />
              <InputField
                label="Display Order"
                type="number"
                value={form.display_order}
                onChange={(value) => updateForm("display_order", value)}
              />
            </section>

            <section className="grid gap-4">
              <TextAreaField
                label="Short Bio"
                value={form.short_bio}
                onChange={(value) => updateForm("short_bio", value)}
                rows={4}
              />
              <TextAreaField
                label="Full Bio"
                value={form.full_bio}
                onChange={(value) => updateForm("full_bio", value)}
                rows={8}
                helperText="Supports paragraphs and list lines using - or *."
              />
              <TextAreaField
                label="Editorial Contribution"
                value={form.editorial_contribution}
                onChange={(value) => updateForm("editorial_contribution", value)}
                rows={5}
                helperText="Shown on the public expert profile page. Supports paragraphs."
              />
            </section>

            <section className="grid gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-heading text-sm font-semibold text-text-dark">
                    Content Reviewed
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    These cards appear on the public expert profile page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addContentReviewedItem}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                >
                  <Plus className="size-3.5" />
                  Add Reviewed Item
                </button>
              </div>

              <div className="grid gap-3">
                {form.content_reviewed.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="rounded-[20px] border border-border-light bg-cream/40 p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_auto] md:items-end">
                      <InputField
                        label="Card Label"
                        value={item.label}
                        onChange={(value) => updateContentReviewedItem(index, "label", value)}
                      />
                      <InputField
                        label="Count"
                        type="number"
                        value={item.value}
                        onChange={(value) => updateContentReviewedItem(index, "value", value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeContentReviewedItem(index)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-red-200 bg-white px-4 font-heading text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    </div>
                    <div className="mt-3">
                      <InputField
                        label="Description"
                        value={item.description}
                        onChange={(value) =>
                          updateContentReviewedItem(index, "description", value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <InputField
                label="SEO Title"
                value={form.seo_title}
                onChange={(value) => updateForm("seo_title", value)}
              />
              <InputField
                label="SEO Description"
                value={form.seo_description}
                onChange={(value) => updateForm("seo_description", value)}
              />
              <div className="lg:col-span-2">
                <MediaLibraryField
                  label="Meta Image"
                  value={form.meta_image}
                  onChange={(value) => updateForm("meta_image", value)}
                  helperText="Optional social preview image. Defaults to the profile image when empty."
                />
              </div>
            </section>

            <section className="grid gap-4">
              <div>
                <p className="font-heading text-sm font-semibold text-text-dark">Expertise Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.map((tag) => {
                    const active = form.expertise_tags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-pill px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-primary text-white shadow-[0_12px_30px_rgba(11,93,59,0.18)]"
                            : "border border-border-light bg-white text-text-dark hover:border-gold/70"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={customTag}
                  onChange={(event) => setCustomTag(event.target.value)}
                  placeholder="Add custom expertise tag"
                  className="min-h-12 flex-1 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-light bg-white px-5 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
                >
                  Add Tag
                </button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Linked Author Profile"
                value={form.linked_author_id}
                onChange={(value) => updateForm("linked_author_id", value)}
                options={authors.map((author) => ({ value: author.id, label: author.name }))}
              />
              <SelectField
                label="Linked Reviewer Profile"
                value={form.linked_reviewer_id}
                onChange={(value) => updateForm("linked_reviewer_id", value)}
                options={reviewers.map((reviewer) => ({ value: reviewer.id, label: reviewer.name }))}
              />
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => updateForm("status", value as "active" | "inactive")}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <label className="flex items-center gap-3 rounded-[18px] border border-border-light bg-cream/40 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.featured_on_homepage}
                  onChange={(event) => updateForm("featured_on_homepage", event.target.checked)}
                  className="size-4 accent-[#0B5D3B]"
                />
                <span className="text-sm font-semibold text-text-dark">Featured on homepage</span>
              </label>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingExpert ? "Update Expert" : "Create Expert"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingExpert(null);
                  setForm(emptyForm);
                  setCustomTag("");
                }}
                className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-5 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
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
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  helperText?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
      {helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      >
        <option value="">None</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
