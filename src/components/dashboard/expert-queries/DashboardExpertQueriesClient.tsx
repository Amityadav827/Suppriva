"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { ExpertQuery, ExpertQueryStatus } from "@/lib/database/types";
import { EXPERT_QUERY_STATUSES } from "@/lib/validators/expert-query.validator";
import {
  Loader2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ExpertQueriesResponse = {
  queries?: ExpertQuery[];
  error?: string;
};

export function DashboardExpertQueriesClient() {
  const [queries, setQueries] = useState<ExpertQuery[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpertQueryStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchQueries = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expert-query", {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as ExpertQueriesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load expert queries.");
      }

      setQueries(payload.queries ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load expert queries.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueries();
  }, [fetchQueries]);

  const filteredQueries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return queries.filter((item) => {
      const matchesSearch = query
        ? [item.name, item.email, item.product_name, item.question_type, item.message]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queries, search, statusFilter]);

  async function updateStatus(item: ExpertQuery, status: ExpertQueryStatus) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/expert-query/${item.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update expert query status.");
      }

      setQueries((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry)),
      );
      setSuccess("Expert query status updated successfully.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update expert query status.",
      );
    }
  }

  async function deleteQuery(item: ExpertQuery) {
    const shouldDelete = window.confirm(`Delete expert query from ${item.name}?`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/expert-query/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete expert query.");
      }

      setSuccess("Expert query deleted successfully.");
      await fetchQueries();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete expert query.",
      );
    }
  }

  return (
    <DashboardCard title="Expert Queries">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-md">
            <Search className="size-4 text-primary" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or product..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ExpertQueryStatus | "all")
            }
            className="min-h-12 rounded-pill border border-border-light bg-white px-4 text-sm outline-none md:min-w-[180px]"
          >
            <option value="all">All Statuses</option>
            {EXPERT_QUERY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status[0].toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void fetchQueries()}
          className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
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
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-soft-green font-heading text-text-dark">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Question Type</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    Loading expert queries...
                  </span>
                </td>
              </tr>
            ) : filteredQueries.length ? (
              filteredQueries.map((item) => (
                <tr key={item.id} className="border-t border-border-light align-top">
                  <td className="px-5 py-4 text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-heading font-semibold text-text-dark">
                      {item.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted">{item.email}</td>
                  <td className="max-w-[220px] px-5 py-4">
                    <p className="font-heading font-semibold text-text-dark">
                      {item.product_name}
                    </p>
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-xs text-primary hover:underline"
                    >
                      Open product page
                    </a>
                  </td>
                  <td className="px-5 py-4 text-muted">{item.question_type}</td>
                  <td className="px-5 py-4">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        void updateStatus(
                          item,
                          event.target.value as ExpertQueryStatus,
                        )
                      }
                      className="min-h-10 rounded-pill border border-border-light bg-white px-3 text-sm outline-none"
                    >
                      {EXPERT_QUERY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status[0].toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => void deleteQuery(item)}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-red-200 px-4 py-2 font-heading text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  No expert queries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
