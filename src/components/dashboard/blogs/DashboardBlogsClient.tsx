"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MediaLibraryField } from "@/components/dashboard/media/MediaLibraryField";
import { MediaLibraryPickerModal } from "@/components/dashboard/media/MediaLibraryPickerModal";
import { ContentStatus } from "@/lib/database/constants";
import type { Author, Blog, Reviewer } from "@/lib/database/types";
import { MEDIA_LIBRARY_ACCEPT, uploadMediaLibraryFile, validateMediaLibraryFile } from "@/lib/media/upload-client";
import { motion } from "framer-motion";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Download,
  Eraser,
  FileDown,
  FilePlus2,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Image as ImageIcon,
  Indent,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Outdent,
  Palette,
  Pencil,
  Quote,
  Redo2,
  RefreshCw,
  Search,
  Sigma,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Trash2,
  Underline,
  Unlink,
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
  featured_image_alt: string;
  featured_image_title: string;
  featured_image_caption: string;
  category_id: string;
  author_id: string;
  reviewer_id: string;
  reading_time: string;
  tags: string;
  status: ContentStatus;
  seo_title: string;
  seo_focus_keyword: string;
  seo_description: string;
  seo_canonical_url: string;
  seo_noindex: boolean;
  seo_nofollow: boolean;
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
  featured_image_alt: "",
  featured_image_title: "",
  featured_image_caption: "",
  category_id: "",
  author_id: "",
  reviewer_id: "",
  reading_time: "",
  tags: "",
  status: ContentStatus.Draft,
  seo_title: "",
  seo_focus_keyword: "",
  seo_description: "",
  seo_canonical_url: "",
  seo_noindex: false,
  seo_nofollow: false,
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
    return contentToEditorHtml(content);
  }

  if (typeof content === "object" && content !== null && !Array.isArray(content)) {
    if ("body" in content && typeof content.body === "string") {
      return contentToEditorHtml(content.body);
    }

    if ("sections" in content && Array.isArray(content.sections)) {
      return contentToEditorHtml(
        content.sections
          .map((section) => {
            if (typeof section !== "object" || section === null) {
              return "";
            }

            const record = section as Record<string, unknown>;
            const title = typeof record.title === "string" ? `## ${record.title}` : "";
            const intro = typeof record.intro === "string" ? record.intro : "";
            const h3 = typeof record.h3 === "string" ? `### ${record.h3}` : "";
            const bullets = Array.isArray(record.bullets)
              ? record.bullets
                  .filter((item): item is string => typeof item === "string")
                  .map((item) => `- ${item}`)
                  .join("\n")
              : "";
            const quote = typeof record.quote === "string" ? `> ${record.quote}` : "";

            return [title, intro, h3, bullets, quote].filter(Boolean).join("\n\n");
          })
          .filter(Boolean)
          .join("\n\n"),
      );
    }
  }

  return "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function markdownInlineToHtml(value: string) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/__([^_]+)__/g, "<u>$1</u>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>");
}

function contentToEditorHtml(value: string) {
  const source = value.trim();

  if (!source) {
    return "";
  }

  if (looksLikeHtml(source)) {
    return source;
  }

  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const firstLine = lines[0]?.trim() ?? "";
      const heading = firstLine.match(/^(#{1,6})\s+(.+)$/);

      if (heading) {
        const level = Math.min(heading[1].length, 6);
        const rest = lines.slice(1).join(" ").trim();
        return [
          `<h${level}>${markdownInlineToHtml(heading[2])}</h${level}>`,
          rest ? `<p>${markdownInlineToHtml(rest)}</p>` : "",
        ]
          .filter(Boolean)
          .join("");
      }

      if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
        return `<ul>${lines
          .map((line) => `<li>${markdownInlineToHtml(line.trim().replace(/^[-*]\s+/, ""))}</li>`)
          .join("")}</ul>`;
      }

      if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
        return `<ol>${lines
          .map((line) => `<li>${markdownInlineToHtml(line.trim().replace(/^\d+\.\s+/, ""))}</li>`)
          .join("")}</ol>`;
      }

      if (lines.every((line) => /^>\s?/.test(line.trim()))) {
        return `<blockquote>${lines
          .map((line) => markdownInlineToHtml(line.trim().replace(/^>\s?/, "")))
          .join("<br />")}</blockquote>`;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(firstLine)) {
        return "<hr />";
      }

      return `<p>${markdownInlineToHtml(lines.join(" "))}</p>`;
    })
    .join("");
}

function imageMetadataFromContent(content: Blog["content"]) {
  if (typeof content === "object" && content !== null && !Array.isArray(content)) {
    const record = content as Record<string, unknown>;
    const metadataValue = record.featuredImageMetadata;

    if (
      typeof metadataValue === "object" &&
      metadataValue !== null &&
      !Array.isArray(metadataValue)
    ) {
      const metadata = metadataValue as Record<string, unknown>;

      return {
        alt: typeof metadata.alt === "string" ? metadata.alt : "",
        title: typeof metadata.title === "string" ? metadata.title : "",
        caption: typeof metadata.caption === "string" ? metadata.caption : "",
      };
    }
  }

  return {
    alt: "",
    title: "",
    caption: "",
  };
}

function isValidImageUrl(value: string) {
  if (!value) {
    return true;
  }

  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateArticleHtml(html: string) {
  const errors: string[] = [];

  if (typeof window === "undefined" || !html.trim()) {
    return errors;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<article>${html}</article>`, "text/html");
  const parserError = doc.querySelector("parsererror");

  if (parserError) {
    errors.push("Article HTML contains broken markup.");
  }

  doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((heading) => {
    if (!heading.textContent?.trim()) {
      errors.push("Article headings cannot be empty.");
    }
  });

  doc.querySelectorAll("img").forEach((image, index) => {
    if (!image.getAttribute("src")?.trim()) {
      errors.push(`Image ${index + 1}: source URL is required.`);
    }
  });

  doc.querySelectorAll("a").forEach((link, index) => {
    const href = link.getAttribute("href")?.trim() ?? "";

    if (!href) {
      errors.push(`Link ${index + 1}: URL is required.`);
      return;
    }

    if (href.startsWith("#") || href.startsWith("/") || href.startsWith("mailto:")) {
      return;
    }

    if (!isValidHttpUrl(href)) {
      errors.push(`Link ${index + 1}: URL must be absolute HTTP/HTTPS or site-relative.`);
    }
  });

  return [...new Set(errors)];
}

function validateBlogForm(form: BlogFormState) {
  const errors: string[] = [];
  const slug = form.slug.trim();

  if (!form.title.trim()) {
    errors.push("Blog title is required.");
  }

  if (!slug) {
    errors.push("Blog slug is required.");
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  errors.push(...validateArticleHtml(form.content));

  if (form.featured_image && !isValidImageUrl(form.featured_image)) {
    errors.push("Featured image must be a valid URL or site-relative path.");
  }

  if (form.featured_image && !form.featured_image_alt.trim()) {
    errors.push("Featured image alt text is required.");
  }

  if (form.featured_image && !form.featured_image_title.trim()) {
    errors.push("Featured image title is required.");
  }

  if (form.seo_canonical_url.trim() && !isValidHttpUrl(form.seo_canonical_url.trim())) {
    errors.push("Canonical URL override must be a valid HTTP or HTTPS URL.");
  }

  return errors;
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
  const imageMetadata = imageMetadataFromContent(blog.content);

  return {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    content: plainTextFromContent(blog.content),
    featured_image: blog.featured_image ?? "",
    featured_image_alt: imageMetadata.alt,
    featured_image_title: imageMetadata.title,
    featured_image_caption: imageMetadata.caption,
    category_id: blog.category_id ?? "",
    author_id: blog.author_id ?? "",
    reviewer_id: blog.reviewer_id ?? "",
    reading_time: blog.reading_time ?? "",
    tags: blog.tags.join(", "),
    status: blog.status,
    seo_title: blog.seo_title ?? "",
    seo_focus_keyword: blog.seo_focus_keyword ?? "",
    seo_description: blog.seo_description ?? "",
    seo_canonical_url: blog.seo_canonical_url ?? "",
    seo_noindex: blog.seo_noindex ?? false,
    seo_nofollow: blog.seo_nofollow ?? false,
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
      featuredImageMetadata: {
        alt: form.featured_image_alt.trim(),
        title: form.featured_image_title.trim(),
        caption: form.featured_image_caption.trim(),
      },
    },
    featured_image: form.featured_image || null,
    category_id: form.category_id || null,
    author_id: form.author_id || null,
    reviewer_id: form.reviewer_id || null,
    reading_time: form.reading_time || null,
    tags: commaList(form.tags),
    status: form.status,
    seo_title: form.seo_title || null,
    seo_focus_keyword: form.seo_focus_keyword || null,
    seo_description: form.seo_description || null,
    seo_canonical_url: form.seo_canonical_url || null,
    seo_noindex: form.seo_noindex,
    seo_nofollow: form.seo_nofollow,
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
      body: contentToEditorHtml(content),
      featuredImageMetadata: {
        alt: "",
        title: "",
        caption: "",
      },
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
      const validationErrors = validateBlogForm(form);

      if (validationErrors.length) {
        throw new Error(validationErrors.join(" "));
      }

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
            <InputField
              label="Image Alt Text"
              value={form.featured_image_alt}
              onChange={(value) => updateForm("featured_image_alt", value)}
              placeholder="Describe the featured image for accessibility"
            />
            <InputField
              label="Image Title"
              value={form.featured_image_title}
              onChange={(value) => updateForm("featured_image_title", value)}
              placeholder="Short image title"
            />
            <TextAreaField
              label="Image Caption"
              value={form.featured_image_caption}
              onChange={(value) => updateForm("featured_image_caption", value)}
              placeholder="Optional caption shown below the featured image"
              className="lg:col-span-2"
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
            <TextAreaField label="Excerpt" value={form.excerpt} onChange={(value) => updateForm("excerpt", value)} />
            <RichTextEditor
              label="Article Content"
              value={form.content}
              onChange={(value) => updateForm("content", value)}
              className="lg:col-span-2"
              rows={12}
              helperText="Use headings for real article sections. The blog table of contents is generated from H2 and H3 headings."
            />
            <div className="grid gap-4 rounded-[24px] border border-border-light bg-cream/55 p-4 lg:col-span-2 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <h3 className="font-heading text-lg font-extrabold text-text-dark">
                  Advanced SEO
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Control search metadata for this blog article.
                </p>
              </div>
              <InputField
                label="SEO Title"
                value={form.seo_title}
                onChange={(value) => updateForm("seo_title", value)}
              />
              <InputField
                label="Focus Keyword"
                value={form.seo_focus_keyword}
                onChange={(value) => updateForm("seo_focus_keyword", value)}
              />
              <TextAreaField
                label="SEO Description"
                value={form.seo_description}
                onChange={(value) => updateForm("seo_description", value)}
                rows={3}
                className="lg:col-span-2"
              />
              <InputField
                label="Canonical URL Override"
                value={form.seo_canonical_url}
                onChange={(value) => updateForm("seo_canonical_url", value)}
                placeholder="https://suppriva.vercel.app/blog/example"
                className="lg:col-span-2"
              />
              <div className="grid gap-3 lg:col-span-2 md:grid-cols-2">
                <CheckboxField
                  label="No Index"
                  checked={form.seo_noindex}
                  onChange={(value) => updateForm("seo_noindex", value)}
                />
                <CheckboxField
                  label="No Follow"
                  checked={form.seo_nofollow}
                  onChange={(value) => updateForm("seo_nofollow", value)}
                />
              </div>
            </div>
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
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
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

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-light bg-white px-4 text-sm font-semibold text-text-dark">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editorError, setEditorError] = useState("");

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || mode !== "visual") {
      return;
    }

    if (document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [mode, value]);

  function syncFromEditor() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function saveSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const editor = editorRef.current;
    const range = selection.getRangeAt(0);

    if (editor && editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();

    if (savedRangeRef.current) {
      selection?.addRange(savedRangeRef.current);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection?.addRange(range);
  }

  function runCommand(command: string, commandValue?: string) {
    restoreSelection();
    document.execCommand(command, false, commandValue);
    syncFromEditor();
    saveSelection();
  }

  function insertHtml(html: string) {
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    syncFromEditor();
    saveSelection();
  }

  function insertHeading(level: number) {
    runCommand("formatBlock", `H${level}`);
  }

  function insertLink() {
    const href = window.prompt("Link URL");

    if (!href) {
      return;
    }

    const title = window.prompt("Title attribute (optional)") ?? "";
    const openNewTab = window.confirm("Open link in a new tab?");
    const nofollow = window.confirm("Add nofollow?");
    const sponsored = window.confirm("Add sponsored?");
    const rel = [
      openNewTab ? "noopener noreferrer" : "",
      nofollow ? "nofollow" : "",
      sponsored ? "sponsored" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const selectedText = window.getSelection()?.toString() || href;
    const attrs = [
      `href="${escapeHtml(href)}"`,
      title ? `title="${escapeHtml(title)}"` : "",
      openNewTab ? 'target="_blank"' : "",
      rel ? `rel="${rel}"` : "",
    ]
      .filter(Boolean)
      .join(" ");

    insertHtml(`<a ${attrs}>${escapeHtml(selectedText)}</a>`);
  }

  function insertImage(url: string) {
    const alt = window.prompt("Image alt text", "") ?? "";
    const title = window.prompt("Image title (optional)", "") ?? "";
    const caption = window.prompt("Caption (optional)", "") ?? "";
    const width = window.prompt("Width (optional, e.g. 720 or 100%)", "") ?? "";
    const height = window.prompt("Height (optional)", "") ?? "";
    const style = width
      ? ` style="max-width:100%;width:${escapeHtml(width)};"`
      : ' style="max-width:100%;height:auto;"';
    const sizeAttrs = [
      width && /^\d+$/.test(width) ? `width="${width}"` : "",
      height && /^\d+$/.test(height) ? `height="${height}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const imageHtml = `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}" ${sizeAttrs}${style} />`;

    insertHtml(
      caption
        ? `<figure>${imageHtml}<figcaption>${escapeHtml(caption)}</figcaption></figure>`
        : imageHtml,
    );
  }

  async function uploadAndInsertImage(file: File) {
    setEditorError("");
    setIsUploadingImage(true);

    try {
      validateMediaLibraryFile(file);
      const item = await uploadMediaLibraryFile({ file });
      insertImage(item.file_url);
    } catch (uploadError) {
      setEditorError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function insertTable() {
    insertHtml(
      '<table><thead><tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr></thead><tbody><tr><td>Value 1</td><td>Value 2</td><td>Value 3</td></tr><tr><td>Value 4</td><td>Value 5</td><td>Value 6</td></tr></tbody></table>',
    );
  }

  function insertChecklist() {
    insertHtml('<ul data-list="checklist"><li><input type="checkbox" /> Checklist item</li></ul>');
  }

  function insertBlockQuote() {
    insertHtml("<blockquote>Quote text</blockquote>");
  }

  function insertHorizontalRule() {
    insertHtml("<hr />");
  }

  function insertSpecialCharacter() {
    const character = window.prompt("Special character", "®");

    if (character) {
      insertHtml(escapeHtml(character));
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/"),
    );

    if (!imageItem) {
      return;
    }

    const file = imageItem.getAsFile();

    if (file) {
      event.preventDefault();
      void uploadAndInsertImage(file);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const file = Array.from(event.dataTransfer.files).find((item) =>
      item.type.startsWith("image/"),
    );

    if (!file) {
      return;
    }

    event.preventDefault();
    void uploadAndInsertImage(file);
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <div className="overflow-hidden rounded-[22px] border border-border-light bg-white shadow-[0_16px_38px_rgba(15,23,42,0.06)] focus-within:border-gold/80 focus-within:ring-4 focus-within:ring-gold/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light bg-cream/70 px-3 py-2">
          <div className="flex flex-wrap gap-2">
            {(["visual", "html", "preview"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  saveSelection();
                  setMode(tab);
                }}
                className={`rounded-pill px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] transition ${
                  mode === tab
                    ? "bg-primary text-white shadow-[0_10px_24px_rgba(11,93,59,0.18)]"
                    : "bg-white text-primary hover:bg-soft-green"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {isUploadingImage ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
              <Loader2 className="size-3.5 animate-spin" />
              Uploading image
            </span>
          ) : null}
        </div>

        {mode === "visual" ? (
        <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-border-light bg-cream/90 px-3 py-2 backdrop-blur">
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
          <EditorButton label="Bold" onClick={() => runCommand("bold")}>
            <Bold className="size-4" />
          </EditorButton>
          <EditorButton label="Italic" onClick={() => runCommand("italic")}>
            <Italic className="size-4" />
          </EditorButton>
          <EditorButton label="Underline" onClick={() => runCommand("underline")}>
            <Underline className="size-4" />
          </EditorButton>
          <EditorButton label="Strike" onClick={() => runCommand("strikeThrough")}>
            <Strikethrough className="size-4" />
          </EditorButton>
          <EditorButton label="Superscript" onClick={() => runCommand("superscript")}>
            <Superscript className="size-4" />
          </EditorButton>
          <EditorButton label="Subscript" onClick={() => runCommand("subscript")}>
            <Subscript className="size-4" />
          </EditorButton>
          <EditorButton label="Text color" onClick={() => runCommand("foreColor", window.prompt("Text color", "#0B5D3B") || "#0B5D3B")}>
            <Palette className="size-4" />
          </EditorButton>
          <EditorButton label="Background color" onClick={() => runCommand("hiliteColor", window.prompt("Background color", "#F4FAF6") || "#F4FAF6")}>
            <Highlighter className="size-4" />
          </EditorButton>
          <EditorButton label="Align left" onClick={() => runCommand("justifyLeft")}>
            <AlignLeft className="size-4" />
          </EditorButton>
          <EditorButton label="Align center" onClick={() => runCommand("justifyCenter")}>
            <AlignCenter className="size-4" />
          </EditorButton>
          <EditorButton label="Align right" onClick={() => runCommand("justifyRight")}>
            <AlignRight className="size-4" />
          </EditorButton>
          <EditorButton label="Justify" onClick={() => runCommand("justifyFull")}>
            <AlignJustify className="size-4" />
          </EditorButton>
          <EditorButton label="Bullet list" onClick={() => runCommand("insertUnorderedList")}>
            <List className="size-4" />
          </EditorButton>
          <EditorButton label="Numbered list" onClick={() => runCommand("insertOrderedList")}>
            <ListOrdered className="size-4" />
          </EditorButton>
          <EditorButton label="Checklist" onClick={insertChecklist}>
            <CheckSquare className="size-4" />
          </EditorButton>
          <EditorButton label="Indent" onClick={() => runCommand("indent")}>
            <Indent className="size-4" />
          </EditorButton>
          <EditorButton label="Outdent" onClick={() => runCommand("outdent")}>
            <Outdent className="size-4" />
          </EditorButton>
          <EditorButton label="Block quote" onClick={insertBlockQuote}>
            <Quote className="size-4" />
          </EditorButton>
          <EditorButton label="Link" onClick={insertLink}>
            <LinkIcon className="size-4" />
          </EditorButton>
          <EditorButton label="Unlink" onClick={() => runCommand("unlink")}>
            <Unlink className="size-4" />
          </EditorButton>
          <EditorButton label="Table" onClick={insertTable}>
            <Table2 className="size-4" />
          </EditorButton>
          <EditorButton
            label="Image URL"
            onClick={() => {
              const url = window.prompt("Image URL");
              if (url) insertImage(url);
            }}
          >
            <ImageIcon className="size-4" />
          </EditorButton>
          <EditorButton label="Upload image" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="size-4" />
          </EditorButton>
          <EditorButton label="Choose from media library" onClick={() => setIsPickerOpen(true)}>
            <Search className="size-4" />
          </EditorButton>
          <EditorButton label="Horizontal rule" onClick={insertHorizontalRule}>
            <Minus className="size-4" />
          </EditorButton>
          <EditorButton label="Code block" onClick={() => insertHtml("<pre><code>Code block</code></pre>")}>
            <Code className="size-4" />
          </EditorButton>
          <EditorButton label="Inline code" onClick={() => insertHtml("<code>inline code</code>")}>
            <Sigma className="size-4" />
          </EditorButton>
          <EditorButton label="Special character" onClick={insertSpecialCharacter}>
            <span className="text-sm font-bold">Ω</span>
          </EditorButton>
          <EditorButton label="Clear formatting" onClick={() => runCommand("removeFormat")}>
            <Eraser className="size-4" />
          </EditorButton>
          <EditorButton label="Undo" onClick={() => runCommand("undo")}>
            <Undo2 className="size-4" />
          </EditorButton>
          <EditorButton label="Redo" onClick={() => runCommand("redo")}>
            <Redo2 className="size-4" />
          </EditorButton>
        </div>
        ) : null}

        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncFromEditor}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={saveSelection}
            onPaste={handlePaste}
            onDrop={handleDrop}
            className="prose-editor max-h-[640px] min-h-[360px] overflow-y-auto bg-white px-5 py-4 text-base leading-8 text-text-dark outline-none"
            style={{ minHeight: `${Math.max(rows, 10) * 34}px` }}
            data-placeholder={placeholder ?? "Write the complete article with headings, tables, images, links, quotes, and FAQ content."}
          />
        ) : null}

        {mode === "html" ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={Math.max(rows, 16)}
            spellCheck={false}
            className="min-h-[520px] w-full resize-y border-0 bg-slate-950 px-5 py-4 font-mono text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-400"
            placeholder="<h2>Section heading</h2><p>Article paragraph...</p>"
          />
        ) : null}

        {mode === "preview" ? (
          <div className="max-h-[640px] min-h-[360px] overflow-y-auto bg-white px-5 py-4">
            <div
              className="prose-editor text-base leading-8 text-text-dark"
              dangerouslySetInnerHTML={{ __html: value || "<p>Preview will appear here.</p>" }}
            />
          </div>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={MEDIA_LIBRARY_ACCEPT}
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";

          if (file) {
            await uploadAndInsertImage(file);
          }
        }}
      />
      <MediaLibraryPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(items) => {
          const item = items[0];
          if (item) {
            insertImage(item.file_url);
          }
        }}
      />
      {editorError ? <span className="text-xs font-medium text-red-700">{editorError}</span> : null}
      {helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
    </div>
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
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
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
