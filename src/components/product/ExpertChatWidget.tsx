"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
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
import { useEffect, useId, useRef, useState } from "react";
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
  const questionTypeId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ExpertChatForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resolvedProductUrl, setResolvedProductUrl] = useState(productPath);
  const [isQuestionTypeOpen, setIsQuestionTypeOpen] = useState(false);
  const [highlightedQuestionType, setHighlightedQuestionType] = useState(0);
  const questionTypeRef = useRef<HTMLDivElement | null>(null);
  const questionTypeButtonRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        questionTypeRef.current &&
        !questionTypeRef.current.contains(event.target as Node)
      ) {
        setIsQuestionTypeOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function updateForm<Key extends FieldKey>(key: Key, value: ExpertChatForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setSubmitError("");

    if (key === "questionType") {
      const nextIndex = EXPERT_QUERY_TYPES.findIndex((option) => option === value);
      setHighlightedQuestionType(nextIndex >= 0 ? nextIndex : 0);
    }
  }

  function minimizePanel() {
    setIsOpen(false);
    setIsQuestionTypeOpen(false);
  }

  function closePanel() {
    setIsOpen(false);
    setIsSuccess(false);
    setSubmitError("");
    setErrors({});
    setForm(initialForm);
    setIsQuestionTypeOpen(false);
    setHighlightedQuestionType(0);
  }

  function selectQuestionType(option: string) {
    updateForm("questionType", option);
    setIsQuestionTypeOpen(false);
    questionTypeButtonRef.current?.focus();
  }

  function handleQuestionTypeKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isQuestionTypeOpen) {
        setIsQuestionTypeOpen(true);
        return;
      }

      setHighlightedQuestionType((current) =>
        current + 1 >= EXPERT_QUERY_TYPES.length ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isQuestionTypeOpen) {
        setIsQuestionTypeOpen(true);
        return;
      }

      setHighlightedQuestionType((current) =>
        current - 1 < 0 ? EXPERT_QUERY_TYPES.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isQuestionTypeOpen) {
        setIsQuestionTypeOpen(true);
        return;
      }

      selectQuestionType(EXPERT_QUERY_TYPES[highlightedQuestionType]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsQuestionTypeOpen(false);
    }
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
      <div className="fixed bottom-4 left-4 z-[60] md:bottom-6 md:left-6">
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ask an Expert"
          whileTap={{ scale: 0.96 }}
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative grid size-[52px] place-items-center rounded-full border border-white/70 bg-[linear-gradient(180deg,#0B603C_0%,#0A5535_55%,#08492E_100%)] text-white shadow-[0_16px_36px_rgba(11,93,59,0.28)] ring-[8px] ring-[#EDF6EF]/85 backdrop-blur-sm transition hover:shadow-[0_22px_48px_rgba(11,93,59,0.34)] md:size-[56px] md:ring-[10px]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,0.28),rgba(255,255,255,0.04)_45%,rgba(255,255,255,0))]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-8px_20px_rgba(0,0,0,0.08)]"
          />
          <MessageCircleMore className="relative z-10 size-5 md:size-[22px]" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-[4.75rem] left-4 right-4 z-[70] max-h-[calc(100dvh-6rem)] overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:left-4 sm:right-auto sm:w-[calc(100vw-2rem)] sm:max-w-[400px] sm:origin-bottom-left md:bottom-[5.25rem] md:left-6 md:w-[392px] md:max-w-[392px] md:max-h-[80vh]"
            role="dialog"
            aria-label="Ask Our Supplement Expert"
          >
            <div className="flex max-h-[inherit] flex-col md:max-h-none">
              <div className="bg-[linear-gradient(180deg,#074A2F_0%,#0A5535_55%,#0B5D3B_100%)] px-4 py-3 text-white md:px-5 md:py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/12 shadow-[0_10px_22px_rgba(0,0,0,0.16)]">
                      <Stethoscope className="size-4 text-white" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-heading text-base font-extrabold leading-tight md:text-[1rem]">
                        Ask Our Supplement Expert
                      </h2>
                      <p className="mt-0.5 text-[11px] font-medium text-white/78">
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

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-3.5 md:overflow-visible md:px-5 md:pb-5 md:pt-3.5">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[24px] border border-primary/10 bg-soft-green/75 px-5 py-5 text-center shadow-[0_18px_46px_rgba(15,23,42,0.06)]"
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
                  <div className="space-y-3">
                    <div className="rounded-[20px] border border-primary/10 bg-soft-green/70 px-4 py-2.5 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                      <p className="font-heading text-[0.92rem] font-bold text-text-dark">
                        Hi! How can we help you today?
                      </p>
                      <p className="mt-0.5 text-[12px] leading-5 text-muted">
                        Our supplement expert will get back to you as soon as possible.
                      </p>
                    </div>

                    <form className="space-y-3" onSubmit={submitQuery}>
                      <input type="hidden" value={productName} name="product_name" readOnly />
                      <input type="hidden" value={resolvedProductUrl} name="product_url" readOnly />

                      <FormField
                        error={errors.name}
                        icon={<UserRound className="size-4.5" aria-hidden="true" />}
                      >
                        <input
                          type="text"
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          className={inputClasses(Boolean(errors.name))}
                          placeholder="Your Name"
                        />
                      </FormField>

                      <FormField
                        error={errors.email}
                        icon={<Mail className="size-4.5" aria-hidden="true" />}
                      >
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) => updateForm("email", event.target.value)}
                          className={inputClasses(Boolean(errors.email))}
                          placeholder="Your Email"
                        />
                      </FormField>

                      <FormField
                        error={errors.questionType}
                        icon={<Tag className="size-4.5" aria-hidden="true" />}
                      >
                        <div ref={questionTypeRef} className="relative">
                          <button
                            ref={questionTypeButtonRef}
                            type="button"
                            id={questionTypeId}
                            aria-haspopup="listbox"
                            aria-expanded={isQuestionTypeOpen}
                            aria-controls={`${questionTypeId}-listbox`}
                            onClick={() => setIsQuestionTypeOpen((current) => !current)}
                            onKeyDown={handleQuestionTypeKeyDown}
                            className={`${inputClasses(Boolean(errors.questionType))} flex items-center justify-between text-left ${
                              form.questionType ? "text-text-dark" : "text-muted/70"
                            }`}
                          >
                            <span className="truncate">
                              {form.questionType || "What is your question about?"}
                            </span>
                            <ChevronDown
                              className={`ml-3 size-4 shrink-0 text-muted transition duration-200 ${
                                isQuestionTypeOpen ? "rotate-180 text-primary" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          <AnimatePresence>
                            {isQuestionTypeOpen ? (
                              <motion.div
                                id={`${questionTypeId}-listbox`}
                                role="listbox"
                                aria-labelledby={questionTypeId}
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[20px] border border-border-light bg-white p-2 shadow-[0_22px_58px_rgba(15,23,42,0.14)]"
                              >
                                {EXPERT_QUERY_TYPES.map((option, index) => {
                                  const isSelected = form.questionType === option;
                                  const isActive = highlightedQuestionType === index;

                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      onMouseEnter={() => setHighlightedQuestionType(index)}
                                      onClick={() => selectQuestionType(option)}
                                      className={`flex w-full items-center justify-between rounded-[16px] px-4 py-3 text-left text-sm transition ${
                                        isSelected
                                          ? "bg-primary text-white shadow-[0_10px_24px_rgba(11,93,59,0.2)]"
                                          : isActive
                                            ? "bg-soft-green/80 text-text-dark"
                                            : "text-text-dark hover:bg-soft-green/60"
                                      }`}
                                    >
                                      <span>{option}</span>
                                      {isSelected ? (
                                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/18">
                                          <Tag className="size-3.5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </FormField>

                      <FormField
                        error={errors.message}
                        icon={<MessageSquareText className="size-4.5" aria-hidden="true" />}
                        alignTop
                      >
                        <textarea
                          value={form.message}
                          onChange={(event) => updateForm("message", event.target.value)}
                          className={`${inputClasses(Boolean(errors.message))} min-h-[110px] resize-none py-3 md:min-h-[104px]`}
                          placeholder="Write your question here..."
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
                        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#0A5535_0%,#0B5D3B_55%,#0E7A4F_100%)] px-5 font-heading text-[0.96rem] font-semibold text-white shadow-[0_20px_54px_rgba(11,93,59,0.22)] transition hover:shadow-[0_26px_68px_rgba(11,93,59,0.28)] disabled:cursor-not-allowed disabled:opacity-75"
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

                      <p className="px-2 pb-1 text-center text-[12px] leading-5 text-muted/90">
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
  return `min-h-[52px] w-full rounded-[18px] border bg-white pl-11 pr-4 text-[14px] text-text-dark outline-none transition placeholder:text-muted/70 focus:border-primary/45 focus:shadow-[0_0_0_4px_rgba(11,93,59,0.08)] ${
    hasError ? "border-red-300 bg-red-50/40" : "border-border-light hover:border-primary/20"
  }`;
}

function FormField({
  error,
  icon,
  alignTop = false,
  children,
}: {
  error?: string;
  icon: React.ReactNode;
  alignTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
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
