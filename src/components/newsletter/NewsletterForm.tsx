"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, LockKeyhole, Mail, Send, Sparkles } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source_page: window.location.pathname,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to subscribe right now.");
      }

      setMessage("You are subscribed. Welcome to Suppriva wellness insights.");
      setEmail("");
    } catch (subscribeError) {
      setError(
        subscribeError instanceof Error
          ? subscribeError.message
          : "Unable to subscribe right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[34px] border border-white/18 bg-white/[0.13] p-5 shadow-[0_34px_100px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-7 lg:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 size-52 rounded-full bg-gold/18 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 size-60 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-pill border border-white/12 bg-white/10 px-3.5 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-white/78">
          <Sparkles className="size-4 text-gold" aria-hidden="true" />
          Join the list
        </span>
        <h3 className="mt-5 font-heading text-2xl font-extrabold leading-tight text-white md:text-3xl">
          Get smarter supplement picks in your inbox.
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/66">
          Curated guides, premium offers, and wellness insights. Built for
          clarity, not inbox clutter.
        </p>

        <label
          htmlFor="newsletter-email"
          className="mt-7 block font-heading text-sm font-semibold text-white"
        >
          Email address
        </label>
        <div className="mt-3 flex flex-col gap-3 rounded-[30px] border border-white/70 bg-white p-2.5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] sm:flex-row sm:rounded-[34px]">
          <div className="flex min-h-16 flex-1 items-center gap-3 px-4">
            <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent text-base text-text-dark outline-none placeholder:text-muted"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="inline-flex min-h-16 items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-7 font-heading text-sm font-semibold text-white shadow-[0_18px_46px_rgba(11,93,59,0.34)] transition duration-300 hover:shadow-[0_24px_60px_rgba(217,165,32,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Subscribing..." : "Subscribe"}
            <Send className="size-4" aria-hidden="true" />
          </motion.button>
        </div>

        {message ? (
          <p className="mt-4 rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-[18px] border border-red-200/40 bg-red-500/12 px-4 py-3 text-sm font-medium text-white">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2 text-sm text-white/64">
            <LockKeyhole className="size-4 text-gold" aria-hidden="true" />
            Privacy protected
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-white/64">
            <BadgeCheck className="size-4 text-gold" aria-hidden="true" />
            No spam, unsubscribe anytime
          </p>
        </div>
      </div>
    </motion.form>
  );
}
