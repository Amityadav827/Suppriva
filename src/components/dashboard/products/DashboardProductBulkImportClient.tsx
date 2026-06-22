"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  parseProductImportCsv,
  type ParsedProductImportRow,
} from "@/lib/products/import-csv";
import {
  AlertCircle,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { DragEvent, useMemo, useRef, useState } from "react";

type ProductImportPreviewRow = {
  rowNumber: number;
  productName: string;
  slug: string;
  category: string;
  action: "create" | "update";
  status: "valid" | "warning" | "error";
  messages: string[];
};

type ProductImportPreviewSummary = {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
};

type ProductImportPreviewResponse = {
  rows: ProductImportPreviewRow[];
  summary: ProductImportPreviewSummary;
  error?: string;
};

type ProductImportExecutionRow = {
  rowNumber: number;
  productName: string;
  slug: string;
  action: "created" | "updated" | "skipped";
  status: "imported" | "failed" | "skipped";
  messages: string[];
  productId: string | null;
};

type ProductImportExecutionSummary = {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  skippedRows: number;
};

type ProductImportExecutionResponse = {
  rows: ProductImportExecutionRow[];
  summary: ProductImportExecutionSummary;
  preview: ProductImportPreviewResponse;
  log: {
    id: string;
    filename: string;
    status: string;
  };
  error?: string;
};

const previewStatusTone: Record<ProductImportPreviewRow["status"], string> = {
  valid: "bg-soft-green text-primary",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
};

const executionStatusTone: Record<ProductImportExecutionRow["status"], string> = {
  imported: "bg-soft-green text-primary",
  failed: "bg-red-50 text-red-700",
  skipped: "bg-amber-50 text-amber-700",
};

export function DashboardProductBulkImportClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedProductImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<ProductImportPreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ProductImportExecutionResponse | null>(null);
  const [error, setError] = useState("");
  const [progressLabel, setProgressLabel] = useState("Waiting for a CSV file.");
  const [progressValue, setProgressValue] = useState(0);

  const importableRowCount = useMemo(() => {
    if (!preview) {
      return 0;
    }

    return preview.summary.validRows + preview.summary.warningRows;
  }, [preview]);

  async function parseFile(file: File) {
    const text = await file.text();
    const result = parseProductImportCsv(text);

    setSelectedFileName(file.name);
    setParsedRows(result.rows);
    setParseErrors(result.errors);
    setPreview(null);
    setImportResult(null);
    setError("");
    setProgressValue(result.errors.length ? 10 : result.rows.length ? 20 : 0);
    setProgressLabel(
      result.errors.length
        ? "Fix CSV structure issues before validation."
        : result.rows.length
          ? `Parsed ${result.rows.length} product rows.`
          : "No importable rows were found in the CSV.",
    );
  }

  async function validateRows() {
    if (!parsedRows.length) {
      return;
    }

    setIsValidating(true);
    setError("");
    setProgressValue(45);
    setProgressLabel("Validating categories, ingredients, URLs, and slugs...");

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "validate",
          filename: selectedFileName,
          rows: parsedRows,
        }),
      });
      const payload = (await response.json()) as ProductImportPreviewResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to validate this CSV.");
      }

      setPreview(payload);
      setImportResult(null);
      setProgressValue(60);
      setProgressLabel(
        payload.summary.errorRows
          ? `Validation found ${payload.summary.errorRows} row errors.`
          : "Validation complete. Ready to import.",
      );
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Unable to validate this CSV.",
      );
      setProgressValue(20);
      setProgressLabel("Validation did not complete.");
    } finally {
      setIsValidating(false);
    }
  }

  async function importRows() {
    if (!parsedRows.length || !preview) {
      return;
    }

    setIsImporting(true);
    setError("");
    setProgressValue(82);
    setProgressLabel(`Importing ${importableRowCount} valid rows into Supabase...`);

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "import",
          filename: selectedFileName,
          rows: parsedRows,
        }),
      });
      const payload = (await response.json()) as ProductImportExecutionResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to import this CSV.");
      }

      setImportResult(payload);
      setPreview(payload.preview);
      setProgressValue(100);
      setProgressLabel(
        payload.summary.failedRows
          ? `Import finished with ${payload.summary.failedRows} failed rows.`
          : "Import finished successfully.",
      );
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Unable to import this CSV.");
      setProgressValue(60);
      setProgressLabel("Import stopped before completion.");
    } finally {
      setIsImporting(false);
    }
  }

  function resetState() {
    setSelectedFileName("");
    setParsedRows([]);
    setParseErrors([]);
    setPreview(null);
    setImportResult(null);
    setError("");
    setProgressLabel("Waiting for a CSV file.");
    setProgressValue(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleFileList(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    await parseFile(file);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    await handleFileList(event.dataTransfer.files);
  }

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Bulk Product Import"
        description="Upload a CSV, preview live validation, and import products with category mapping plus ingredient relationships."
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/products"
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <RefreshCw className="size-4" />
              Back to Products
            </Link>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/products/import/template";
              }}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
            >
              <FileDown className="size-4" />
              Download CSV Template
            </button>
          </div>

          <button
            type="button"
            onClick={resetState}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
          >
            <RefreshCw className="size-4" />
            Reset Import
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => void handleDrop(event)}
            className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${
              isDragging
                ? "border-primary bg-soft-green"
                : "border-border-light bg-white hover:border-gold/70"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleFileList(event.target.files)}
            />
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-soft-green text-primary">
              <UploadCloud className="size-8" />
            </div>
            <h3 className="mt-5 font-heading text-lg font-extrabold text-text-dark">
              Upload Product CSV
            </h3>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Drag and drop a CSV here, or click to browse. The importer validates live categories,
              approved ingredients, URLs, slugs, and update-vs-create behavior before anything is written.
            </p>
            <span className="mt-5 inline-flex min-h-11 items-center rounded-pill border border-border-light px-4 font-heading text-sm font-semibold text-primary">
              Choose CSV File
            </span>
            {selectedFileName ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-pill bg-soft-green px-4 py-2 text-sm font-semibold text-primary">
                <FileSpreadsheet className="size-4" />
                {selectedFileName}
              </div>
            ) : null}
          </label>

          <div className="rounded-[28px] border border-border-light bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-extrabold text-text-dark">
                  Import Progress
                </h3>
                <p className="mt-1 text-sm text-muted">{progressLabel}</p>
              </div>
              {(isValidating || isImporting) ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : null}
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-soft-green">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SummaryPill label="Rows Parsed" value={parsedRows.length} tone="neutral" />
              <SummaryPill
                label="Ready to Import"
                value={importableRowCount}
                tone="success"
              />
              <SummaryPill
                label="Import Errors"
                value={preview?.summary.errorRows ?? 0}
                tone="danger"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void validateRows()}
                disabled={!parsedRows.length || !!parseErrors.length || isValidating || isImporting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-border-light px-5 font-heading text-sm font-semibold text-primary transition hover:border-gold/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isValidating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Validate Preview
              </button>
              <button
                type="button"
                onClick={() => void importRows()}
                disabled={!preview || importableRowCount === 0 || isImporting || isValidating}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isImporting ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                Import Valid Rows
              </button>
            </div>
          </div>
        </div>

        {parseErrors.length ? (
          <FeedbackPanel
            className="mt-6 border-red-200 bg-red-50 text-red-700"
            title="CSV Structure Issues"
            messages={parseErrors}
          />
        ) : null}

        {error ? (
          <FeedbackPanel
            className="mt-6 border-red-200 bg-red-50 text-red-700"
            title="Import Error"
            messages={[error]}
          />
        ) : null}

        {importResult ? (
          <FeedbackPanel
            className="mt-6 border-primary/15 bg-soft-green text-primary"
            title="Import Summary"
            messages={[
              `Log ${importResult.log.id} recorded for ${importResult.log.filename}.`,
              `${importResult.summary.importedRows} rows imported, ${importResult.summary.failedRows} failed, ${importResult.summary.skippedRows} skipped.`,
            ]}
          />
        ) : null}

        {preview ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <SummaryCard
                label="Total Rows"
                value={preview.summary.totalRows}
                tone="text-text-dark"
              />
              <SummaryCard
                label="Valid Rows"
                value={preview.summary.validRows}
                tone="text-primary"
              />
              <SummaryCard
                label="Warning Rows"
                value={preview.summary.warningRows}
                tone="text-amber-700"
              />
              <SummaryCard
                label="Error Rows"
                value={preview.summary.errorRows}
                tone="text-red-700"
              />
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-border-light">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-soft-green font-heading text-text-dark">
                  <tr>
                    <th className="px-5 py-4">Row</th>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Action</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Messages</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {preview.rows.map((row) => (
                    <tr key={`${row.rowNumber}-${row.slug || row.productName}`} className="border-t border-border-light align-top">
                      <td className="px-5 py-4 text-muted">{row.rowNumber}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-heading font-semibold text-text-dark">
                            {row.productName || "Untitled row"}
                          </p>
                          <p className="mt-1 text-xs text-muted">{row.slug || "No slug"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{row.category || "Missing category"}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-pill bg-white px-3 py-1.5 text-xs font-semibold capitalize text-text-dark ring-1 ring-border-light">
                          {row.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-pill px-3 py-1.5 text-xs font-semibold capitalize ${previewStatusTone[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        <div className="space-y-2">
                          {(importResult?.rows.find((resultRow) => resultRow.rowNumber === row.rowNumber)?.messages ??
                            row.messages
                          ).map((message, index) => (
                            <p key={`${row.rowNumber}-message-${index}`} className="leading-5">
                              {message}
                            </p>
                          ))}
                          {importResult ? (
                            <span
                              className={`inline-flex rounded-pill px-3 py-1.5 text-xs font-semibold capitalize ${
                                executionStatusTone[
                                  importResult.rows.find((resultRow) => resultRow.rowNumber === row.rowNumber)?.status ?? "skipped"
                                ]
                              }`}
                            >
                              {importResult.rows.find((resultRow) => resultRow.rowNumber === row.rowNumber)?.status ?? "skipped"}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </DashboardCard>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "danger";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-soft-green text-primary"
      : tone === "danger"
        ? "bg-red-50 text-red-700"
        : "bg-white text-text-dark ring-1 ring-border-light";

  return (
    <div className={`rounded-[20px] px-4 py-3 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">{label}</p>
      <p className="mt-2 font-heading text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[24px] border border-border-light bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={`mt-3 font-heading text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function FeedbackPanel({
  title,
  messages,
  className,
}: {
  title: string;
  messages: string[];
  className: string;
}) {
  return (
    <div className={`rounded-[24px] border px-5 py-4 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4" />
        <p className="font-heading text-sm font-semibold">{title}</p>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        {messages.map((message, index) => (
          <p key={`${title}-${index}`}>{message}</p>
        ))}
      </div>
    </div>
  );
}
