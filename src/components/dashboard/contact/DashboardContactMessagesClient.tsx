"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { ContactMessage } from "@/lib/database/types";
import { Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ContactMessagesResponse = {
  messages?: ContactMessage[];
  error?: string;
};

export function DashboardContactMessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as ContactMessagesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load contact messages.");
      }

      setMessages(payload.messages ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load contact messages.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return messages;
    }

    return messages.filter((message) =>
      [message.name, message.email, message.subject, message.message]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [messages, search]);

  async function deleteMessage(message: ContactMessage) {
    const shouldDelete = window.confirm(`Delete message from ${message.name}?`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/contact/${message.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete contact message.");
      }

      setSuccess("Contact message deleted successfully.");
      await fetchMessages();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete contact message.",
      );
    }
  }

  return (
    <DashboardCard title="Contact Messages">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
          <Search className="size-4 text-primary" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => void fetchMessages()}
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
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-soft-green font-heading text-text-dark">
            <tr>
              <th className="px-5 py-4">Sender</th>
              <th className="px-5 py-4">Subject</th>
              <th className="px-5 py-4">Message</th>
              <th className="px-5 py-4">Received</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    Loading contact messages...
                  </span>
                </td>
              </tr>
            ) : filteredMessages.length ? (
              filteredMessages.map((message) => (
                <tr key={message.id} className="border-t border-border-light align-top">
                  <td className="px-5 py-4">
                    <span className="font-heading font-semibold text-text-dark">
                      {message.name}
                    </span>
                    <p className="mt-1 text-xs text-muted">{message.email}</p>
                  </td>
                  <td className="px-5 py-4 font-heading font-semibold text-text-dark">
                    {message.subject}
                  </td>
                  <td className="max-w-md px-5 py-4 text-muted">
                    <p className="line-clamp-3">{message.message}</p>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {new Date(message.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => void deleteMessage(message)}
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
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No contact messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
