"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateForm(key: keyof typeof emptyForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  async function submitContactForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send your message.");
      }

      setSuccess("Your message has been sent. The Suppriva team will review it.");
      setForm(emptyForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitContactForm}
      className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_24px_80px_rgba(6,57,33,0.09)] md:p-8"
    >
      <div>
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
          Send A Message
        </p>
        <h2 className="mt-3 font-heading text-2xl font-extrabold text-text-dark md:text-3xl">
          Contact Suppriva
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Use this form for website questions, content corrections, privacy
          requests, or affiliate inquiries.
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
        <InputField
          label="Subject"
          value={form.subject}
          onChange={(value) => updateForm("subject", value)}
          required
          className="md:col-span-2"
        />
        <label className="grid gap-2 md:col-span-2">
          <span className="font-heading text-sm font-semibold text-text-dark">
            Message
          </span>
          <textarea
            required
            rows={6}
            maxLength={4000}
            value={form.message}
            onChange={(event) => updateForm("message", event.target.value)}
            placeholder="How can we help?"
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
        Send Message
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
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
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
