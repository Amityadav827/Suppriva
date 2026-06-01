"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { InputField } from "@/components/auth/InputField";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess("Password reset link sent. Please check your inbox.");
    } catch (forgotError) {
      setError(
        forgotError instanceof Error ? forgotError.message : "Unable to send reset link.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email to receive a secure password reset link."
    >
      <form className="grid gap-5" onSubmit={handleResetRequest}>
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
        />
        {error ? <StatusMessage tone="error" message={error} /> : null}
        {success ? <StatusMessage tone="success" message={success} /> : null}
        <AuthSubmitButton label="Send Reset Link" loading={loading} />
      </form>
      <p className="mt-7 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-heading font-semibold text-primary transition hover:text-gold"
        >
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}

function StatusMessage({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  return (
    <p
      className={`rounded-[18px] px-4 py-3 text-sm font-medium ${
        tone === "error"
          ? "border border-red-200 bg-red-50 text-red-700"
          : "border border-primary/15 bg-soft-green text-primary"
      }`}
    >
      {message}
    </p>
  );
}
