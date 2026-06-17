"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import type { MediaLibraryItem } from "@/lib/database/types";
import { cn } from "@/lib/utils";

type MediaLibraryPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaLibraryItem[]) => void;
  multiple?: boolean;
  selectedUrls?: string[];
};

type MediaLibraryResponse = {
  items?: MediaLibraryItem[];
  error?: string;
};

export function MediaLibraryPickerModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  selectedUrls = [],
}: MediaLibraryPickerModalProps) {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [query, setQuery] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedUrls);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftSelection(selectedUrls);
  }, [open, selectedUrls]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (query.trim()) {
          params.set("q", query.trim());
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

        if (!cancelled) {
          setItems(payload.items ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load media library.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [mimeType, open, query]);

  const selectedItems = useMemo(
    () => items.filter((item) => draftSelection.includes(item.file_url)),
    [draftSelection, items],
  );

  function toggleSelection(item: MediaLibraryItem) {
    if (!multiple) {
      onSelect([item]);
      onClose();
      return;
    }

    setDraftSelection((currentSelection) =>
      currentSelection.includes(item.file_url)
        ? currentSelection.filter((url) => url !== item.file_url)
        : [...currentSelection, item.file_url],
    );
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-light px-5 py-5 md:px-6">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-text-dark">
              Select From Media Library
            </h2>
            <p className="mt-1 text-sm text-muted">
              Search existing images, then select one or more assets for this field.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
            aria-label="Close media library picker"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 border-b border-border-light px-5 py-4 md:flex-row md:items-center md:px-6">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <Search className="size-4 text-primary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, slug, alt text, or file name..."
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

        <div className="max-h-[58vh] overflow-y-auto px-5 py-5 md:px-6">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center text-sm text-muted">
              <Loader2 className="mr-2 size-4 animate-spin text-primary" />
              Loading media library...
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : !items.length ? (
            <div className="rounded-[28px] border border-dashed border-border-light bg-cream px-6 py-12 text-center text-sm text-muted">
              No images found. Upload new assets in the Media Library first.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const active = draftSelection.includes(item.file_url);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelection(item)}
                    className={cn(
                      "overflow-hidden rounded-[24px] border bg-white text-left shadow-[0_16px_42px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(15,23,42,0.1)]",
                      active
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border-light",
                    )}
                  >
                    <div className="relative aspect-[16/10] bg-cream">
                      <Image
                        src={item.file_url}
                        alt={item.alt_text || item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-heading text-base font-bold text-text-dark">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                            {item.slug}
                          </p>
                        </div>
                        {active ? (
                          <span className="rounded-pill bg-soft-green px-3 py-1 text-[11px] font-semibold text-primary">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span>
                          {item.width ?? "--"} x {item.height ?? "--"}
                        </span>
                        <span>{item.mime_type.replace("image/", "").toUpperCase()}</span>
                        <span>
                          {item.file_size
                            ? `${Math.max(1, Math.round(item.file_size / 1024))} KB`
                            : "--"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple ? (
          <div className="flex flex-col gap-3 border-t border-border-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <p className="text-sm text-muted">
              {selectedItems.length} image{selectedItems.length === 1 ? "" : "s"} selected
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-light px-5 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect(selectedItems);
                  onClose();
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
              >
                Use Selected Images
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
