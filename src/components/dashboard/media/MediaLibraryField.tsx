"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, ImagePlus, Loader2, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MEDIA_LIBRARY_ACCEPT,
  uploadMediaLibraryFile,
  validateMediaLibraryFile,
} from "@/lib/media/upload-client";
import { MediaLibraryPickerModal } from "@/components/dashboard/media/MediaLibraryPickerModal";

type MediaLibraryFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  helperText?: string;
};

type MediaGalleryFieldProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
  helperText?: string;
};

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function MediaLibraryField({
  label,
  value,
  onChange,
  className,
  helperText,
}: MediaLibraryFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleUpload(file: File) {
    setIsUploading(true);
    setProgress(0);
    setError("");

    try {
      const item = await uploadMediaLibraryFile({
        file,
        onProgress: setProgress,
      });
      onChange(item.file_url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
        {value ? (
          <button
            type="button"
            onClick={async () => {
              await copyToClipboard(value);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-button-hover"
          >
            <Copy className="size-3.5" />
            {copied ? "Copied" : "Copy URL"}
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border-light bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="relative aspect-[16/10] bg-cream">
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No image selected
            </div>
          )}
          {isUploading ? (
            <div className="absolute inset-x-4 bottom-4 rounded-pill bg-white/95 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-text-dark">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  Uploading to media library
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-pill bg-soft-green">
                <div
                  className="h-full rounded-pill bg-[linear-gradient(90deg,#0B5D3B,#D9A520)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border-light px-4 py-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <ImagePlus className="size-4" />
            {value ? "Replace Image" : "Upload Image"}
          </button>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <Search className="size-4" />
            Choose From Library
          </button>
          {value ? (
            <>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                <ExternalLink className="size-4" />
                Open Image
              </a>
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-red-200 bg-red-50 px-4 font-heading text-sm font-semibold text-red-700 transition hover:border-red-300"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            </>
          ) : null}
        </div>
      </div>

      {helperText ? <p className="text-xs text-muted">{helperText}</p> : null}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_LIBRARY_ACCEPT}
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";

          if (!file) {
            return;
          }

          try {
            validateMediaLibraryFile(file);
            await handleUpload(file);
          } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
          }
        }}
      />

      <MediaLibraryPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(items) => {
          const item = items[0];
          if (item) {
            onChange(item.file_url);
          }
        }}
      />
    </div>
  );
}

export function MediaGalleryField({
  label,
  values,
  onChange,
  className,
  helperText,
}: MediaGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");

  const uniqueValues = useMemo(() => [...new Set(values.filter(Boolean))], [values]);

  async function uploadFiles(files: File[]) {
    setIsUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        validateMediaLibraryFile(file);
        setProgressLabel(`Uploading ${file.name}...`);
        const item = await uploadMediaLibraryFile({ file });
        uploadedUrls.push(item.file_url);
      }

      onChange([...new Set([...uniqueValues, ...uploadedUrls])]);
      setProgressLabel("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <div className="rounded-[24px] border border-border-light bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <ImagePlus className="size-4" />
            Upload Images
          </button>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <Search className="size-4" />
            Select From Library
          </button>
        </div>

        {isUploading ? (
          <div className="mb-4 rounded-[18px] bg-cream px-4 py-3 text-sm text-text-dark">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              {progressLabel || "Uploading images..."}
            </span>
          </div>
        ) : null}

        {!uniqueValues.length ? (
          <div className="rounded-[18px] border border-dashed border-border-light bg-cream px-4 py-10 text-center text-sm text-muted">
            No gallery images selected yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {uniqueValues.map((url) => (
              <div
                key={url}
                className="overflow-hidden rounded-[20px] border border-border-light bg-white"
              >
                <div className="relative aspect-[4/3] bg-cream">
                  <Image src={url} alt={label} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="truncate text-xs text-muted">{url}</p>
                  <button
                    type="button"
                    onClick={() => onChange(uniqueValues.filter((value) => value !== url))}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:border-red-300"
                    aria-label="Remove gallery image"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {helperText ? <p className="text-xs text-muted">{helperText}</p> : null}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={MEDIA_LIBRARY_ACCEPT}
        className="hidden"
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";

          if (!files.length) {
            return;
          }

          await uploadFiles(files);
        }}
      />

      <MediaLibraryPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        multiple
        selectedUrls={uniqueValues}
        onSelect={(items) => {
          onChange([...new Set([...uniqueValues, ...items.map((item) => item.file_url)])]);
        }}
      />
    </div>
  );
}
