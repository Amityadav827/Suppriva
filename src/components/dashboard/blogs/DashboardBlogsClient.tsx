"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  MediaGalleryField,
  MediaLibraryField,
} from "@/components/dashboard/media/MediaLibraryField";
import { ContentStatus } from "@/lib/database/constants";
import type { Author, Blog, Reviewer } from "@/lib/database/types";
import { motion } from "framer-motion";
import {
  Bold,
  Download,
  FileDown,
  FilePlus2,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pencil,
  Quote,
  Redo2,
  RefreshCw,
  Search,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  gallery: string[];
  category_id: string;
  author_id: string;
  reviewer_id: string;
  reading_time: string;
  tags: string;
  status: ContentStatus;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
};

type BlogsResponse = {
  blogs?: Blog[];
  blog?: Blog;
  error?: string;
};

type BlogCsvRow = Record<(typeof CSV_COLUMNS)[number], string>;
type ExpertProfilesResponse = {
  authors?: Author[];
  reviewers?: Reviewer[];
  error?: string;
};

const CSV_COLUMNS = [
  "title",
  "slug",
  "featured_image_url",
  "reading_time",
  "category_id",
  "tags",
  "status",
  "seo_title",
  "seo_keywords",
  "seo_description",
  "excerpt",
  "article_content",
] as const;

const emptyForm: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  gallery: [],
  category_id: "",
  author_id: "",
  reviewer_id: "",
  reading_time: "",
  tags: "",
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

function plainTextFromContent(content: Blog["content"]) {
  if (typeof content === "string") {
    return content;
  }

  if (typeof content === "object" && content !== null && !Array.isArray(content)) {
    if ("body" in content && typeof content.body === "string") {
      return content.body;
    }

    if ("sections" in content && Array.isArray(content.sections)) {
      return content.sections
        .map((section) => {
          if (
            typeof section === "object" &&
            section !== null
          ) {
            const title =
              "title" in section &&
              typeof section.title === "string" &&
              !/^section\s+\d+$/i.test(section.title)
                ? `## ${section.title}`
                : "";
            const intro =
              "intro" in section && typeof section.intro === "string"
                ? section.intro
                : "";
            const h3 =
              "h3" in section && typeof section.h3 === "string"
                ? `### ${section.h3}`
                : "";
            const bullets =
              "bullets" in section && Array.isArray(section.bullets)
                ? section.bullets
                    .filter((item): item is string => typeof item === "string")
                    .map((item) => `- ${item}`)
                    .join("\n")
                : "";
            const quote =
              "quote" in section && typeof section.quote === "string"
                ? `> ${section.quote}`
                : "";

            return [title, intro, h3, bullets, quote].filter(Boolean).join("\n\n");
          }

          return "";
        })
        .filter(Boolean)
        .join("\n\n");
    }
  }

  return "";
}

function galleryFromContent(content: Blog["content"]) {
  if (
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content) &&
    "gallery" in content &&
    Array.isArray(content.gallery)
  ) {
    return content.gallery.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function csvList(value: string) {
  const separator = value.includes(";") ? ";" : value.includes("|") ? "|" : ",";

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeCsvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function createCsv(rows: string[][]) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  return rows;
}

function parseBlogCsv(text: string) {
  const rows = parseCsv(text);
  const [header, ...bodyRows] = rows;
  const errors: string[] = [];

  if (!header) {
    return { rows: [] as BlogCsvRow[], errors: ["CSV file is empty."] };
  }

  const normalizedHeader = header.map((column) => column.trim());
  const missingColumns = CSV_COLUMNS.filter((column) => !normalizedHeader.includes(column));

  if (missingColumns.length) {
    errors.push(`Missing columns: ${missingColumns.join(", ")}.`);
  }

  const parsedRows = bodyRows.map((bodyRow) => {
    const entry = {} as BlogCsvRow;

    CSV_COLUMNS.forEach((column) => {
      const columnIndex = normalizedHeader.indexOf(column);
      entry[column] = columnIndex >= 0 ? bodyRow[columnIndex]?.trim() ?? "" : "";
    });

    return entry;
  });

  const slugSet = new Set<string>();
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  parsedRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const slug = row.slug || slugify(row.title);
    const status = row.status || ContentStatus.Draft;

    if (!row.title) {
      errors.push(`Row ${rowNumber}: title is required.`);
    }

    if (!slug) {
      errors.push(`Row ${rowNumber}: slug is required or title must generate one.`);
    }

    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`Row ${rowNumber}: slug must use lowercase letters, numbers, and hyphens.`);
    }

    if (slugSet.has(slug)) {
      errors.push(`Row ${rowNumber}: duplicate slug "${slug}" in CSV.`);
    }

    if (slug) {
      slugSet.add(slug);
    }

    if (row.category_id && !uuidPattern.test(row.category_id)) {
      errors.push(`Row ${rowNumber}: category_id must be a valid UUID.`);
    }

    if (!Object.values(ContentStatus).includes(status as ContentStatus)) {
      errors.push(`Row ${rowNumber}: status must be draft, published, or archived.`);
    }
  });

  return { rows: parsedRows, errors };
}

function blogToForm(blog: Blog): BlogFormState {
  return {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    content: plainTextFromContent(blog.content),
    featured_image: blog.featured_image ?? "",
    gallery: galleryFromContent(blog.content),
    category_id: blog.category_id ?? "",
    author_id: blog.author_id ?? "",
    reviewer_id: blog.reviewer_id ?? "",
    reading_time: blog.reading_time ?? "",
    tags: blog.tags.join(", "),
    status: blog.status,
    seo_title: blog.seo_title ?? "",
    seo_description: blog.seo_description ?? "",
    seo_keywords: blog.seo_keywords.join(", "),
  };
}

function formToPayload(form: BlogFormState) {
  return {
    title: form.title,
    slug: form.slug || undefined,
    excerpt: form.excerpt || null,
    content: {
      body: form.content,
      gallery: [...new Set(form.gallery.map((item) => item.trim()).filter(Boolean))],
    },
    featured_image: form.featured_image || null,
    category_id: form.category_id || null,
    author_id: form.author_id || null,
    reviewer_id: form.reviewer_id || null,
    reading_time: form.reading_time || null,
    tags: commaList(form.tags),
    status: form.status,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    seo_keywords: commaList(form.seo_keywords),
  };
}

function csvRowToPayload(row: BlogCsvRow) {
  const content = row.article_content;

  return {
    title: row.title,
    slug: row.slug || slugify(row.title),
    excerpt: row.excerpt || null,
    content: {
      body: content,
    },
    featured_image: row.featured_image_url || null,
    category_id: row.category_id || null,
    reading_time: row.reading_time || null,
    tags: csvList(row.tags),
    status: (row.status || ContentStatus.Draft) as ContentStatus,
    seo_title: row.seo_title || null,
    seo_description: row.seo_description || null,
    seo_keywords: csvList(row.seo_keywords),
  };
}

export function DashboardBlogsClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/blogs", { cache: "no-store" });
      const payload = (await response.json()) as BlogsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load blogs.");
      }

      setBlogs(payload.blogs ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load blogs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpertProfiles = useCallback(async () => {
    try {
      const [authorsResponse, reviewersResponse] = await Promise.all([
        fetch("/api/authors?active=true", { cache: "no-store" }),
        fetch("/api/reviewers?active=true", { cache: "no-store" }),
      ]);
      const authorsPayload = (await authorsResponse.json()) as ExpertProfilesResponse;
      const reviewersPayload = (await reviewersResponse.json()) as ExpertProfilesResponse;

      if (!authorsResponse.ok) {
        throw new Error(authorsPayload.error ?? "Unable to load authors.");
      }

      if (!reviewersResponse.ok) {
        throw new Error(reviewersPayload.error ?? "Unable to load reviewers.");
      }

      setAuthors(authorsPayload.authors ?? []);
      setReviewers(reviewersPayload.reviewers ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load EEAT profiles.");
    }
  }, []);

  useEffect(() => {
    void fetchBlogs();
    void fetchExpertProfiles();
  }, [fetchBlogs, fetchExpertProfiles]);

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return blogs;
    }

    return blogs.filter((blog) =>
      [blog.title, blog.slug, blog.status, blog.excerpt ?? "", blog.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [blogs, search]);

  function updateForm<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function openCreateForm() {
    setEditingBlog(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(blog: Blog) {
    setEditingBlog(blog);
    setForm(blogToForm(blog));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitBlog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(editingBlog ? `/api/blogs/${editingBlog.id}` : "/api/blogs", {
        method: editingBlog ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const payload = (await response.json()) as BlogsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save blog.");
      }

      setSuccess(editingBlog ? "Blog updated successfully." : "Blog created successfully.");
      setIsFormOpen(false);
      setEditingBlog(null);
      setForm(emptyForm);
      await fetchBlogs();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save blog.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBlog(blog: Blog) {
    const shouldDelete = window.confirm(`Delete ${blog.title}? This will soft delete it.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
      const payload = (await response.json()) as BlogsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete blog.");
      }

      setSuccess("Blog deleted successfully.");
      await fetchBlogs();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete blog.");
    }
  }

  function exportBlogs() {
    const rows = [
      [...CSV_COLUMNS],
      ...blogs.map((blog) => [
        blog.title,
        blog.slug,
        blog.featured_image ?? "",
        blog.reading_time ?? "",
        blog.category_id ?? "",
        blog.tags.join("; "),
        blog.status,
        blog.seo_title ?? "",
        blog.seo_keywords.join("; "),
        blog.seo_description ?? "",
        blog.excerpt ?? "",
        plainTextFromContent(blog.content),
      ]),
    ];

    downloadCsv("suppriva-blogs-export.csv", createCsv(rows));
  }

  function downloadSampleCsv() {
    const rows = [
      [...CSV_COLUMNS],
      [
        "10 Best Supplements for Weight Loss",
        "best-weight-loss-supplements",
        "https://example.com/blog-image.webp",
        "8 min read",
        "",
        "weight loss; supplements; wellness",
        ContentStatus.Published,
        "10 Best Supplements for Weight Loss | Suppriva",
        "weight loss; supplements; metabolism",
        "Explore the best supplements for weight loss, metabolism support, and healthy wellness routines.",
        "A practical guide to supplement options for healthy weight management.",
        "Start with a balanced wellness plan, then compare supplements based on ingredients, safety, and daily usability.",
      ],
    ];

    downloadCsv("suppriva-blog-import-sample.csv", createCsv(rows));
  }

  async function loadCurrentBlogs() {
    const response = await fetch("/api/blogs", { cache: "no-store" });
    const payload = (await response.json()) as BlogsResponse;

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to load existing blogs.");
    }

    setBlogs(payload.blogs ?? []);

    return payload.blogs ?? [];
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setIsImporting(true);

    try {
      const text = await file.text();
      const { rows, errors } = parseBlogCsv(text);

      if (errors.length) {
        throw new Error(errors.slice(0, 12).join(" "));
      }

      if (!rows.length) {
        throw new Error("CSV must include at least one blog row.");
      }

      const existingBlogs = await loadCurrentBlogs();
      const existingBySlug = new Map(existingBlogs.map((blog) => [blog.slug, blog]));
      let created = 0;
      let updated = 0;
      const failed: string[] = [];

      for (const row of rows) {
        const payload = csvRowToPayload(row);
        const existingBlog = existingBySlug.get(payload.slug);
        const endpoint = existingBlog ? `/api/blogs/${existingBlog.id}` : "/api/blogs";
        const method = existingBlog ? "PUT" : "POST";
        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const responsePayload = (await response.json()) as BlogsResponse;

        if (!response.ok) {
          failed.push(`${payload.slug}: ${responsePayload.error ?? "Unable to import blog."}`);
          continue;
        }

        if (existingBlog) {
          updated += 1;
        } else {
          created += 1;
        }

        if (responsePayload.blog) {
          existingBySlug.set(responsePayload.blog.slug, responsePayload.blog);
        }
      }

      await fetchBlogs();

      const summary = `CSV import complete. Created: ${created}. Updated: ${updated}. Failed: ${failed.length}.`;
      setSuccess(summary);

      if (failed.length) {
        setError(failed.slice(0, 8).join(" "));
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Unable to import CSV.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Blog Management">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void importCsv(event)}
            className="hidden"
          />
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
            <Search className="size-4 text-primary" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search blogs..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchBlogs()}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <FileDown className="size-4" />
              Sample CSV
            </button>
            <button
              type="button"
              onClick={exportBlogs}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <Download className="size-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImporting ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
              Import CSV
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
            >
              <FilePlus2 className="size-4" />
              Add Blog
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
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Tags</th>
                <th className="px-5 py-4">Status</th>
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
                      Loading blogs...
                    </span>
                  </td>
                </tr>
              ) : filteredBlogs.length ? (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="border-t border-border-light">
                    <td className="px-5 py-4">
                      <span className="font-heading font-semibold text-text-dark">
                        {blog.title}
                      </span>
                      <p className="mt-1 text-xs text-muted">{blog.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {blog.tags.length ? blog.tags.slice(0, 2).join(", ") : "No tags"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold capitalize text-primary">
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(blog.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(blog)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteBlog(blog)}
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
                    No blogs found.
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
                {editingBlog ? "Edit Blog" : "Create Blog"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Manage editorial content, SEO metadata, and publish-ready blog status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label="Close blog form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitBlog} className="grid gap-4 lg:grid-cols-2">
            <InputField label="Title" value={form.title} onChange={(value) => updateForm("title", value)} required />
            <InputField label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} placeholder="auto-generated if empty" />
            <MediaLibraryField
              label="Featured Image"
              value={form.featured_image}
              onChange={(value) => updateForm("featured_image", value)}
              className="lg:col-span-2"
              helperText="Choose the primary blog hero image from the Media Library."
            />
            <MediaGalleryField
              label="Blog Gallery"
              values={form.gallery}
              onChange={(value) => updateForm("gallery", value)}
              className="lg:col-span-2"
              helperText="Optional supporting images stored in the blog content payload."
            />
            <InputField label="Reading Time" value={form.reading_time} onChange={(value) => updateForm("reading_time", value)} placeholder="7 min read" />
            <InputField label="Category ID" value={form.category_id} onChange={(value) => updateForm("category_id", value)} placeholder="Optional UUID" />
            <ProfileSelect
              label="Author"
              value={form.author_id}
              options={authors}
              onChange={(value) => updateForm("author_id", value)}
            />
            <ProfileSelect
              label="Reviewer"
              value={form.reviewer_id}
              options={reviewers}
              onChange={(value) => updateForm("reviewer_id", value)}
            />
            <InputField label="Tags" value={form.tags} onChange={(value) => updateForm("tags", value)} placeholder="weight loss, wellness" />
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
            <InputField label="SEO Title" value={form.seo_title} onChange={(value) => updateForm("seo_title", value)} />
            <InputField label="SEO Keywords" value={form.seo_keywords} onChange={(value) => updateForm("seo_keywords", value)} placeholder="supplements, health guide" />
            <TextAreaField label="Excerpt" value={form.excerpt} onChange={(value) => updateForm("excerpt", value)} />
            <TextAreaField label="SEO Description" value={form.seo_description} onChange={(value) => updateForm("seo_description", value)} />
            <RichTextEditor
              label="Article Content"
              value={form.content}
              onChange={(value) => updateForm("content", value)}
              className="lg:col-span-2"
              rows={12}
              helperText="Use headings for real article sections. The blog table of contents is generated from H2 and H3 headings."
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingBlog ? "Update Blog" : "Create Blog"}
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

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  rows = 8,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function replaceSelection(nextText: string, selectionOffset = 0, selectionLength = nextText.length) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${nextText}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + selectionOffset, start + selectionOffset + selectionLength);
    });
  }

  function insertMarkup(prefix: string, suffix = "", fallback = "text") {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || fallback;
    const nextText = `${prefix}${selectedText}${suffix}`;

    replaceSelection(nextText, prefix.length, selectedText.length);
  }

  function insertHeading(level: number) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end).trim() || "Article heading";
    const prefix = "#".repeat(level);
    const needsLeadingBreak = start > 0 && !value.slice(0, start).endsWith("\n") ? "\n\n" : "";
    const nextText = `${needsLeadingBreak}${prefix} ${selectedText}\n\n`;

    replaceSelection(nextText, needsLeadingBreak.length + prefix.length + 1, selectedText.length);
  }

  function insertBulletList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "List item";
    const listText = selectedText
      .split("\n")
      .map((line) => `- ${line.replace(/^[-*]\s*/, "")}`)
      .join("\n");

    replaceSelection(listText, 0, listText.length);
  }

  function insertNumberedList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "List item";
    const listText = selectedText
      .split("\n")
      .map((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s*/, "")}`)
      .join("\n");

    replaceSelection(listText, 0, listText.length);
  }

  function insertBlockQuote() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "Quote text";
    const quoteText = selectedText
      .split("\n")
      .map((line) => `> ${line.replace(/^>\s*/, "")}`)
      .join("\n");

    replaceSelection(quoteText, 2, selectedText.length);
  }

  function insertTable() {
    replaceSelection("| Column 1 | Column 2 |\n| --- | --- |\n| Value 1 | Value 2 |", 2, 8);
  }

  function insertImage() {
    replaceSelection("![Image alt text](https://example.com/image.jpg)", 2, 14);
  }

  function insertHorizontalRule() {
    replaceSelection("\n\n---\n\n", 2, 3);
  }

  function runNativeCommand(command: "undo" | "redo") {
    textareaRef.current?.focus();
    document.execCommand(command);
  }

  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <div className="overflow-hidden rounded-[18px] border border-border-light bg-white focus-within:border-gold/80 focus-within:ring-4 focus-within:ring-gold/10">
        <div className="flex flex-wrap gap-2 border-b border-border-light bg-cream/50 px-3 py-2">
          <EditorButton label="H1" onClick={() => insertHeading(1)}>
            <Heading1 className="size-4" />
          </EditorButton>
          <EditorButton label="H2" onClick={() => insertHeading(2)}>
            <Heading2 className="size-4" />
          </EditorButton>
          <EditorButton label="H3" onClick={() => insertHeading(3)}>
            <Heading3 className="size-4" />
          </EditorButton>
          <EditorButton label="H4" onClick={() => insertHeading(4)}>
            <Heading4 className="size-4" />
          </EditorButton>
          <EditorButton label="H5" onClick={() => insertHeading(5)}>
            <Heading5 className="size-4" />
          </EditorButton>
          <EditorButton label="H6" onClick={() => insertHeading(6)}>
            <Heading6 className="size-4" />
          </EditorButton>
          <EditorButton label="Bold" onClick={() => insertMarkup("**", "**", "bold text")}>
            <Bold className="size-4" />
          </EditorButton>
          <EditorButton label="Italic" onClick={() => insertMarkup("*", "*", "italic text")}>
            <Italic className="size-4" />
          </EditorButton>
          <EditorButton label="Underline" onClick={() => insertMarkup("__", "__", "underlined text")}>
            <Underline className="size-4" />
          </EditorButton>
          <EditorButton label="Strike" onClick={() => insertMarkup("~~", "~~", "struck text")}>
            <Strikethrough className="size-4" />
          </EditorButton>
          <EditorButton label="Bullet list" onClick={insertBulletList}>
            <List className="size-4" />
          </EditorButton>
          <EditorButton label="Numbered list" onClick={insertNumberedList}>
            <ListOrdered className="size-4" />
          </EditorButton>
          <EditorButton label="Block quote" onClick={insertBlockQuote}>
            <Quote className="size-4" />
          </EditorButton>
          <EditorButton label="Link" onClick={() => insertMarkup("[", "](https://example.com)", "link text")}>
            <LinkIcon className="size-4" />
          </EditorButton>
          <EditorButton label="Table" onClick={insertTable}>
            <Table2 className="size-4" />
          </EditorButton>
          <EditorButton label="Image" onClick={insertImage}>
            <ImageIcon className="size-4" />
          </EditorButton>
          <EditorButton label="Horizontal rule" onClick={insertHorizontalRule}>
            <Minus className="size-4" />
          </EditorButton>
          <EditorButton label="Undo" onClick={() => runNativeCommand("undo")}>
            <Undo2 className="size-4" />
          </EditorButton>
          <EditorButton label="Redo" onClick={() => runNativeCommand("redo")}>
            <Redo2 className="size-4" />
          </EditorButton>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? "Use headings, paragraphs, lists, links, tables, images, quotes, and dividers."}
          rows={rows}
          className="w-full resize-y border-0 bg-white px-4 py-3 text-sm text-text-dark outline-none placeholder:text-muted/70"
        />
      </div>
      {helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
    </label>
  );
}

function EditorButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border-light bg-white text-primary transition hover:border-gold/70 hover:bg-soft-green"
    >
      {children}
    </button>
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

function ProfileSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<Author | Reviewer>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      >
        <option value="">Use default profile</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
            {option.designation ? ` - ${option.designation}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
