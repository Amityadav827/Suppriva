"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

type AskExpertFormProps = {
  categories: string[];
};

const emptyForm = {
  name: "",
  email: "",
  category: "",
  question: "",
};

export function AskExpertForm({ categories }: AskExpertFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateForm(key: keyof typeof emptyForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  async function submitAskExpertForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/expert-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          category: form.category,
          question_type: "General Wellness Guidance",
          message: form.question,
          source_page: "/ask-expert",
          product_name: null,
          product_url: null,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit your question.");
      }

      setSuccess(
        "Your question has been submitted. A Suppriva expert will review it soon.",
      );
      setForm(emptyForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your question.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitAskExpertForm}
      className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_24px_80px_rgba(6,57,33,0.09)] md:p-8"
    >
      <div>
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
          Ask An Expert
        </p>
        <h2 className="mt-3 font-heading text-2xl font-extrabold text-text-dark md:text-3xl">
          Submit Your Wellness Question
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Ask about ingredients, wellness goals, or general supplement education.
          This form is designed for educational guidance, not personal medical advice.
        </p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <InputField
          label="Name"
          value={form.name}
          onChange={(value) => updateForm("name", value)}
          required
        />
        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateForm("email", value)}
          required
        />
        <label className="grid gap-2">
          <span className="font-heading text-sm font-semibold text-text-dark">Category</span>
          <select
            required
            value={form.category}
            onChange={(event) => updateForm("category", event.target.value)}
            className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="font-heading text-sm font-semibold text-text-dark">Question</span>
          <textarea
            required
            rows={6}
            maxLength={4000}
            value={form.question}
            onChange={(event) => updateForm("question", event.target.value)}
            placeholder="What would you like help understanding?"
            className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
          />
        </label>
      </div>

      {success ? (
        <p className="mt-5 rounded-[18px] border border-primary/15 bg-soft-green px-4 py-3 text-sm font-medium text-primary">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Submit Question
        <Send className="size-4" aria-hidden="true" />
      </button>
    </form>
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
