"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircleMore,
  MessageSquareText,
  Minus,
  SendHorizonal,
  Stethoscope,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
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

type FieldKey = keyof ExpertChatForm;

export function ExpertChatWidget({
  productName,
  productPath,
}: ExpertChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ExpertChatForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
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

  function updateForm<Key extends FieldKey>(key: Key, value: ExpertChatForm[Key]) {
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
    const nextErrors: Partial<Record<FieldKey, string>> = {};

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
      <div className="pointer-events-none fixed bottom-5 right-5 z-[55] flex items-end gap-3 md:bottom-8 md:right-8">
        <motion.div
          aria-hidden="true"
          className="hidden pb-7 md:block"
          animate={{ opacity: [0.7, 1, 0.7], y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            <motion.p
              className="pr-12 text-right text-[22px] font-semibold leading-[1.05] text-primary [font-family:'Segoe_Print','Comic_Sans_MS',cursive]"
              animate={{ opacity: [0.82, 1, 0.82] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Click to open
              <br />
              chat window
            </motion.p>
            <motion.svg
              viewBox="0 0 140 92"
              className="absolute right-1 top-6 h-[88px] w-[138px] text-primary/90"
              fill="none"
              animate={{ x: [0, 5, 0], y: [0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M8 12C54 12 95 18 109 44C117 59 110 73 95 79"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M84 66L95 80L112 68"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ask an Expert"
          whileTap={{ scale: 0.96 }}
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-auto relative grid size-[60px] place-items-center rounded-full border border-white/60 bg-[linear-gradient(180deg,#0A5535_0%,#0B5D3B_48%,#08492E_100%)] text-white shadow-[0_26px_70px_rgba(11,93,59,0.34)] ring-[14px] ring-[#EAF4EC]/90 transition hover:shadow-[0_30px_80px_rgba(11,93,59,0.42)] md:size-[72px]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.26),rgba(255,255,255,0))]"
          />
          <MessageCircleMore className="relative z-10 size-7 md:size-8" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-4 left-4 right-4 z-[60] max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[30px] border border-black/6 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:left-auto sm:right-5 sm:w-[calc(100vw-2rem)] sm:max-w-[420px] sm:origin-bottom-right md:bottom-[7.75rem] md:right-8 md:w-[408px] md:max-h-[min(820px,calc(100vh-8rem))]"
            role="dialog"
            aria-label="Ask Our Supplement Expert"
          >
            <div className="flex max-h-[inherit] flex-col">
              <div className="bg-[linear-gradient(180deg,#074A2F_0%,#0A5535_55%,#0B5D3B_100%)] px-5 py-4 text-white md:px-6 md:py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/12 shadow-[0_10px_22px_rgba(0,0,0,0.16)]">
                      <Stethoscope className="size-5 text-white" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-heading text-xl font-extrabold leading-tight md:text-[1.4rem]">
                        Ask Our Supplement Expert
                      </h2>
                      <p className="mt-1 text-sm font-medium text-white/78">
                        We&apos;re here to help you!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={minimizePanel}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/10 transition hover:bg-white/16"
                      aria-label="Minimize expert chat"
                    >
                      <Minus className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={closePanel}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/10 transition hover:bg-white/16"
                      aria-label="Close expert chat"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-5 md:px-6 md:pb-6">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[26px] border border-primary/10 bg-soft-green/75 px-5 py-7 text-center shadow-[0_18px_46px_rgba(15,23,42,0.06)]"
                  >
                    <div className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-white text-primary shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                      <CheckCircle2 className="size-8" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-heading text-[1.85rem] font-extrabold text-text-dark">
                      Thank You!
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      Your question has been submitted successfully.
                    </p>
                    <p className="text-sm leading-7 text-muted">
                      Our expert will get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-primary/10 bg-soft-green/70 px-4 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                      <p className="font-heading text-base font-bold text-text-dark">
                        Hi! How can we help you today?
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-muted">
                        Our supplement expert will get back to you as soon as possible.
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={submitQuery}>
                      <input type="hidden" value={productName} name="product_name" readOnly />
                      <input type="hidden" value={resolvedProductUrl} name="product_url" readOnly />

                      <FormField
                        label="Name"
                        error={errors.name}
                        icon={<UserRound className="size-4.5" aria-hidden="true" />}
                      >
                        <input
                          type="text"
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          className={inputClasses(Boolean(errors.name))}
                          placeholder="Enter your name"
                        />
                      </FormField>

                      <FormField
                        label="Email"
                        error={errors.email}
                        icon={<Mail className="size-4.5" aria-hidden="true" />}
                      >
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) => updateForm("email", event.target.value)}
                          className={inputClasses(Boolean(errors.email))}
                          placeholder="Enter your email"
                        />
                      </FormField>

                      <FormField
                        label="Question Type"
                        error={errors.questionType}
                        icon={<Tag className="size-4.5" aria-hidden="true" />}
                      >
                        <select
                          value={form.questionType}
                          onChange={(event) => updateForm("questionType", event.target.value)}
                          className={inputClasses(Boolean(errors.questionType))}
                        >
                          <option value="">Select question type</option>
                          {EXPERT_QUERY_TYPES.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField
                        label="Message"
                        error={errors.message}
                        icon={<MessageSquareText className="size-4.5" aria-hidden="true" />}
                        alignTop
                      >
                        <textarea
                          value={form.message}
                          onChange={(event) => updateForm("message", event.target.value)}
                          className={`${inputClasses(Boolean(errors.message))} min-h-[160px] resize-none py-4`}
                          placeholder={`Ask a question about ${productName}`}
                        />
                      </FormField>

                      {submitError ? (
                        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                          {submitError}
                        </div>
                      ) : null}

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        className="inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#0A5535_0%,#0B5D3B_55%,#0E7A4F_100%)] px-5 font-heading text-base font-semibold text-white shadow-[0_20px_54px_rgba(11,93,59,0.22)] transition hover:shadow-[0_26px_68px_rgba(11,93,59,0.28)] disabled:cursor-not-allowed disabled:opacity-75"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Your Question
                            <SendHorizonal className="size-4.5" aria-hidden="true" />
                          </>
                        )}
                      </motion.button>

                      <p className="px-1 text-sm leading-7 text-muted">
                        Your information is secure and will only be used to respond to
                        your query.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function inputClasses(hasError: boolean) {
  return `min-h-[58px] w-full rounded-[22px] border bg-white pl-12 pr-4 text-base text-text-dark outline-none transition placeholder:text-muted/70 focus:border-primary/45 focus:shadow-[0_0_0_4px_rgba(11,93,59,0.08)] ${
    hasError ? "border-red-300 bg-red-50/40" : "border-border-light hover:border-primary/20"
  }`;
}

function FormField({
  label,
  error,
  icon,
  alignTop = false,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  alignTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-dark">{label}</label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 z-10 inline-flex text-muted ${
            alignTop ? "top-4" : "top-1/2 -translate-y-1/2"
          }`}
        >
          {icon}
        </span>
        {children}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
