"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  ExternalLink,
  FileImage,
  ImagePlus,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { MediaLibraryItem } from "@/lib/database/types";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { uploadMediaLibraryFile, validateMediaLibraryFile, MEDIA_LIBRARY_ACCEPT } from "@/lib/media/upload-client";

type MediaLibraryResponse = {
  items?: MediaLibraryItem[];
  error?: string;
};

type MediaItemResponse = {
  item?: MediaLibraryItem;
  error?: string;
};

type UploadQueueItem = {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  error?: string;
};

const emptyMetadata = {
  title: "",
  alt_text: "",
  caption: "",
  description: "",
  slug: "",
  tags: "",
};

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "--";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryClient() {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [editingItem, setEditingItem] = useState<MediaLibraryItem | null>(null);
  const [metadata, setMetadata] = useState(emptyMetadata);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set("q", search.trim());
      }
      if (mimeType) {
        params.set("mime", mimeType);
      }

      const response = await fetch(`/api/media-library?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as MediaLibraryResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load media library.");
      }

      setItems(payload.items ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load media library.");
    } finally {
      setLoading(false);
    }
  }, [mimeType, search]);

  useEffect(() => {
    void fetchMedia();
  }, [fetchMedia]);

  const summary = useMemo(
    () => ({
      total: items.length,
      jpg: items.filter((item) => item.mime_type === "image/jpeg").length,
      png: items.filter((item) => item.mime_type === "image/png").length,
      webp: items.filter((item) => item.mime_type === "image/webp").length,
    }),
    [items],
  );

  function setUploadQueueItem(id: string, updater: (current: UploadQueueItem) => UploadQueueItem) {
    setUploadQueue((currentQueue) =>
      currentQueue.map((item) => (item.id === id ? updater(item) : item)),
    );
  }

  async function handleFiles(files: File[]) {
    if (!files.length) {
      return;
    }

    setError("");
    setSuccess("");

    for (const file of files) {
      try {
        validateMediaLibraryFile(file);
      } catch (validationError) {
        setError(
          validationError instanceof Error
            ? validationError.message
            : "Unsupported image file.",
        );
        return;
      }
    }

    for (const file of files) {
      const queueId = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setUploadQueue((currentQueue) => [
        {
          id: queueId,
          fileName: file.name,
          progress: 0,
          status: "uploading",
        },
        ...currentQueue,
      ]);

      try {
        await uploadMediaLibraryFile({
          file,
          onProgress: (progress) =>
            setUploadQueueItem(queueId, (currentItem) => ({
              ...currentItem,
              progress,
            })),
        });

        setUploadQueueItem(queueId, (currentItem) => ({
          ...currentItem,
          progress: 100,
          status: "complete",
        }));
      } catch (uploadError) {
        setUploadQueueItem(queueId, (currentItem) => ({
          ...currentItem,
          status: "error",
          error: uploadError instanceof Error ? uploadError.message : "Upload failed.",
        }));
      }
    }

    await fetchMedia();
    setSuccess("Media library updated successfully.");
  }

  async function deleteItem(item: MediaLibraryItem) {
    const confirmed = window.confirm(`Delete ${item.title}?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/media-library/${item.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete media item.");
      }

      setSuccess("Media item deleted.");
      await fetchMedia();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete media item.");
    }
  }

  function openEdit(item: MediaLibraryItem) {
    setEditingItem(item);
    setMetadata({
      title: item.title,
      alt_text: item.alt_text ?? "",
      caption: item.caption ?? "",
      description: item.description ?? "",
      slug: item.slug,
      tags: item.tags.join(", "),
    });
  }

  async function saveMetadata() {
    if (!editingItem) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/media-library/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metadata.title,
          alt_text: metadata.alt_text || null,
          caption: metadata.caption || null,
          description: metadata.description || null,
          slug: metadata.slug,
          tags: metadata.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const payload = (await response.json()) as MediaItemResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update media item.");
      }

      setSuccess("Media metadata updated.");
      setEditingItem(null);
      setMetadata(emptyMetadata);
      await fetchMedia();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update media item.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Uploaded Images", value: summary.total },
          { label: "JPEG Assets", value: summary.jpg },
          { label: "PNG Assets", value: summary.png },
          { label: "WebP Assets", value: summary.webp },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[26px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
          >
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-3 font-heading text-3xl font-extrabold text-text-dark">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <DashboardCard
        title="Upload Images"
        description="Drop single or multiple assets here. Every image is stored in Supabase Storage and indexed with SEO metadata."
      >
        <div
          role="presentation"
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget === event.target) {
              setDragActive(false);
            }
          }}
          onDrop={async (event) => {
            event.preventDefault();
            setDragActive(false);
            const files = Array.from(event.dataTransfer.files).filter((file) =>
              file.type.startsWith("image/"),
            );
            await handleFiles(files);
          }}
          className={`rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${
            dragActive
              ? "border-primary bg-soft-green/50"
              : "border-border-light bg-cream"
          }`}
        >
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-white text-primary shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <UploadCloud className="size-7" />
          </div>
          <h3 className="font-heading text-xl font-bold text-text-dark">
            Drag and drop images here
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
            Upload one image or a full batch. Supported formats: JPG, PNG, WebP. Maximum file size: 5MB.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
          >
            <ImagePlus className="size-4" />
            Browse Files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={MEDIA_LIBRARY_ACCEPT}
            className="hidden"
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              await handleFiles(files);
            }}
          />
        </div>

        {uploadQueue.length ? (
          <div className="mt-5 grid gap-3">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="rounded-[20px] border border-border-light bg-white px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-text-dark">{item.fileName}</span>
                  <span
                    className={`text-xs font-semibold ${
                      item.status === "error"
                        ? "text-red-700"
                        : item.status === "complete"
                          ? "text-emerald-700"
                          : "text-primary"
                    }`}
                  >
                    {item.status === "complete"
                      ? "Uploaded"
                      : item.status === "error"
                        ? "Failed"
                        : `${item.progress}%`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-soft-green">
                  <div
                    className={`h-full rounded-pill ${
                      item.status === "error"
                        ? "bg-red-500"
                        : "bg-[linear-gradient(90deg,#0B5D3B,#D9A520)]"
                    }`}
                    style={{ width: `${item.status === "error" ? 100 : item.progress}%` }}
                  />
                </div>
                {item.error ? (
                  <p className="mt-2 text-xs font-medium text-red-700">{item.error}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </DashboardCard>

      <DashboardCard
        title="Media Library"
        description="Search, filter, preview, edit metadata, and reuse SEO-friendly images across products, ingredients, categories, and blogs."
      >
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <Search className="size-4 text-primary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, file name, alt text, or slug..."
                className="min-w-0 flex-1 bg-transparent text-sm text-text-dark outline-none placeholder:text-muted"
              />
            </label>
            <select
              value={mimeType}
              onChange={(event) => setMimeType(event.target.value)}
              className="min-h-12 rounded-pill border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
            >
              <option value="">All image types</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => void fetchMedia()}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin text-primary" />
            Loading media library...
          </div>
        ) : !items.length ? (
          <div className="rounded-[28px] border border-dashed border-border-light bg-cream px-6 py-12 text-center text-sm text-muted">
            No media uploaded yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[26px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
              >
                <div className="relative aspect-[16/10] bg-cream">
                  <Image
                    src={item.file_url}
                    alt={item.alt_text || item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-text-dark">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                        {item.slug}
                      </p>
                    </div>
                    <span className="rounded-pill bg-soft-green px-3 py-1 text-[11px] font-semibold text-primary">
                      {item.mime_type.replace("image/", "").toUpperCase()}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-text-dark">Dimensions:</span>{" "}
                      {item.width ?? "--"} x {item.height ?? "--"}
                    </p>
                    <p>
                      <span className="font-semibold text-text-dark">Size:</span>{" "}
                      {formatFileSize(item.file_size)}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-text-dark">Uploaded:</span>{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.file_url);
                        setSuccess("Media URL copied to clipboard.");
                      }}
                      className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                    >
                      <Copy className="size-3.5" />
                      Copy URL
                    </button>
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                    >
                      <ExternalLink className="size-3.5" />
                      Open Image
                    </a>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                    >
                      <Pencil className="size-3.5" />
                      Edit Metadata
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteItem(item)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-red-200 bg-red-50 px-4 font-heading text-xs font-semibold text-red-700 transition hover:border-red-300"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>

                  {item.tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-pill bg-cream px-3 py-1 text-[11px] font-semibold text-text-dark"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardCard>

      {editingItem ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-extrabold text-text-dark">
                  Edit Media Metadata
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Update SEO-friendly details for this media asset.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
                aria-label="Close media metadata form"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 md:col-span-2">
                <span className="font-heading text-sm font-semibold text-text-dark">Title</span>
                <input
                  value={metadata.title}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, title: event.target.value }))
                  }
                  className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
              </label>
              <label className="grid gap-2">
                <span className="font-heading text-sm font-semibold text-text-dark">Slug</span>
                <input
                  value={metadata.slug}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, slug: event.target.value }))
                  }
                  className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
              </label>
              <label className="grid gap-2">
                <span className="font-heading text-sm font-semibold text-text-dark">Tags</span>
                <input
                  value={metadata.tags}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="adaptogen, ingredient, hero"
                  className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="font-heading text-sm font-semibold text-text-dark">Alt Text</span>
                <input
                  value={metadata.alt_text}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, alt_text: event.target.value }))
                  }
                  className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="font-heading text-sm font-semibold text-text-dark">Caption</span>
                <input
                  value={metadata.caption}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, caption: event.target.value }))
                  }
                  className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="font-heading text-sm font-semibold text-text-dark">Description</span>
                <textarea
                  value={metadata.description}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={4}
                  className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void saveMetadata()}
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <FileImage className="size-4" />}
                Save Metadata
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-light px-6 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
