"use client";

import {
  STORAGE_BUCKETS,
  type StorageBucket,
  uploadDashboardImage,
  validateDashboardImage,
} from "@/lib/storage/upload";
import { ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  bucket: StorageBucket;
  folder: string;
  className?: string;
  manualLabel?: string;
};

export function ImageUploader({
  label,
  value,
  onChange,
  bucket,
  folder,
  className = "",
  manualLabel = "Image URL",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setError("");
    setIsUploading(true);
    setProgress(18);

    try {
      validateDashboardImage(file);
      setProgress(42);
      const result = await uploadDashboardImage({ bucket, file, folder });
      setProgress(100);
      onChange(result.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
      setProgress(0);
    } finally {
      window.setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 450);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      void uploadFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
        <span className="text-xs font-medium text-muted">JPG, PNG, WEBP up to 5MB</span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-[22px] border border-dashed bg-soft-green/45 p-4 transition ${
          isDragging
            ? "border-gold bg-gold/10 shadow-[0_18px_44px_rgba(217,165,32,0.16)]"
            : "border-border-light hover:border-gold/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-full overflow-hidden rounded-[18px] border border-border-light bg-white sm:w-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-dark">{value}</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Uploaded images are saved as public Supabase Storage URLs.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-xs font-semibold text-primary transition hover:border-gold/70 disabled:opacity-60"
                >
                  {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                  Replace Image
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  disabled={isUploading}
                  className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-red-200 bg-white px-4 font-heading text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <X className="size-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-[18px] bg-white/80 px-4 py-6 text-center transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImageIcon className="size-5" />}
            </span>
            <span className="font-heading text-sm font-semibold text-text-dark">
              Drag & drop an image or click to upload
            </span>
            <span className="text-xs text-muted">
              Storage bucket: {bucket === STORAGE_BUCKETS.categories ? "category-images" : bucket}
            </span>
          </button>
        )}

        {isUploading ? (
          <div className="mt-4 h-2 overflow-hidden rounded-pill bg-white">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-primary to-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <label className="grid gap-2">
        <span className="font-heading text-xs font-semibold text-muted">
          {manualLabel} fallback
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
        />
      </label>
    </div>
  );
}
