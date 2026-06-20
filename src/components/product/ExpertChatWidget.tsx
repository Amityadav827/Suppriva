"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  MessageCircleMore,
  Minus,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EXPERT_QUERY_TYPES } from "@/lib/validators/expert-query.validator";

type ExpertChatWidgetProps = {
  productName: string;
  productPath: string;
};

type ExpertChatForm = {
  name: string;
  email: string;
  questionType: string;
  message: string;
};

const initialForm: ExpertChatForm = {
  name: "",
  email: "",
  questionType: "",
  message: "",
};

export function ExpertChatWidget({
  productName,
  productPath,
}: ExpertChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ExpertChatForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpertChatForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resolvedProductUrl, setResolvedProductUrl] = useState(productPath);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setResolvedProductUrl(window.location.href);
  }, [productPath]);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsOpen(false);
      setIsSuccess(false);
      setSubmitError("");
      setErrors({});
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [isSuccess]);

  const isMobileButton = useMemo(
    () => "fixed bottom-20 right-4 z-[55] md:bottom-24 md:right-7",
    [],
  );

  function updateForm<Key extends keyof ExpertChatForm>(key: Key, value: ExpertChatForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setSubmitError("");
  }

  function minimizePanel() {
    setIsOpen(false);
  }

  function closePanel() {
    setIsOpen(false);
    setIsSuccess(false);
    setSubmitError("");
    setErrors({});
    setForm(initialForm);
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof ExpertChatForm, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Email must be valid.";
    }

    if (!form.questionType.trim()) {
      nextErrors.questionType = "Question type is required.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Message is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function submitQuery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/expert-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          product_name: productName,
          product_url: resolvedProductUrl,
          question_type: form.questionType,
          message: form.message,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit your question.");
      }

      setIsSuccess(true);
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit your question.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className={`${isMobileButton} inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-4 text-white shadow-[0_20px_50px_rgba(11,93,59,0.30)] transition hover:shadow-[0_24px_60px_rgba(217,165,32,0.24)] md:rounded-pill md:px-5`}
        aria-label="Ask an Expert"
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/12">
          <Stethoscope className="size-5" aria-hidden="true" />
        </span>
        <span className="hidden font-heading text-sm font-semibold md:inline">
          Ask an Expert
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-[5.5rem] right-4 z-[60] w-[calc(100vw-32px)] max-w-[420px] overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] md:bottom-28 md:right-7 md:w-full md:max-w-[400px]"
            role="dialog"
            aria-label="Ask Our Supplement Expert"
          >
            <div className="border-b border-black/6 bg-[linear-gradient(180deg,rgba(6,57,33,0.98),rgba(11,93,59,0.96))] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-extrabold">
                    Ask Our Supplement Expert
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-white/74">
                    Need help before ordering? Submit your question and our supplement
                    expert will guide you.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={minimizePanel}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/14 bg-white/10 transition hover:bg-white/16"
                    aria-label="Minimize expert chat"
                  >
                    <Minus className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/14 bg-white/10 transition hover:bg-white/16"
                    aria-label="Close expert chat"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5">
              {isSuccess ? (
                <div className="rounded-[24px] border border-primary/10 bg-soft-green/65 px-5 py-6 text-center">
                  <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                    <MessageCircleMore className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-heading text-2xl font-extrabold text-text-dark">
                    Thank you!
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    Your question has been submitted successfully. Our expert will get
                    back to you soon.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={submitQuery}>
                  <input type="hidden" value={productName} name="product_name" readOnly />
                  <input type="hidden" value={resolvedProductUrl} name="product_url" readOnly />

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-text-dark">
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      className="min-h-12 w-full rounded-2xl border border-border-light bg-cream/30 px-4 text-sm outline-none transition focus:border-primary/40 focus:bg-white"
                      placeholder="Enter your name"
                    />
                    {errors.name ? (
                      <p className="text-xs font-medium text-red-600">{errors.name}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-text-dark">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      className="min-h-12 w-full rounded-2xl border border-border-light bg-cream/30 px-4 text-sm outline-none transition focus:border-primary/40 focus:bg-white"
                      placeholder="Enter your email"
                    />
                    {errors.email ? (
                      <p className="text-xs font-medium text-red-600">{errors.email}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-text-dark">
                      Question Type
                    </label>
                    <select
                      value={form.questionType}
                      onChange={(event) => updateForm("questionType", event.target.value)}
                      className="min-h-12 w-full rounded-2xl border border-border-light bg-cream/30 px-4 text-sm outline-none transition focus:border-primary/40 focus:bg-white"
                    >
                      <option value="">Select question type</option>
                      {EXPERT_QUERY_TYPES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.questionType ? (
                      <p className="text-xs font-medium text-red-600">
                        {errors.questionType}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-text-dark">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(event) => updateForm("message", event.target.value)}
                      className="min-h-[140px] w-full rounded-2xl border border-border-light bg-cream/30 px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:bg-white"
                      placeholder={`Ask a question about ${productName}`}
                    />
                    {errors.message ? (
                      <p className="text-xs font-medium text-red-600">{errors.message}</p>
                    ) : null}
                  </div>

                  {submitError ? (
                    <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {submitError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-5 font-heading text-sm font-semibold text-white shadow-[0_18px_46px_rgba(11,93,59,0.22)] transition hover:shadow-[0_24px_60px_rgba(217,165,32,0.20)] disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Your Question"
                    )}
                  </button>

                  <p className="text-xs leading-6 text-muted">
                    Your information is secure and will only be used to respond to your
                    query.
                  </p>
                </form>
              )}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
