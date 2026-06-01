"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { InputField } from "@/components/auth/InputField";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      setSuccess("Login successful. Redirecting...");
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Login"
      subtitle="Enter your details to access your Suppriva account."
      footerText="New to Suppriva?"
      footerHref="/register"
      footerLink="Create account"
    >
      <form className="grid gap-5" onSubmit={handleLogin}>
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
        />
        <PasswordField label="Password" name="password" placeholder="Enter password" />
        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-border-light accent-primary"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-heading font-semibold text-primary transition hover:text-gold"
          >
            Forgot password?
          </Link>
        </div>
        {error ? <StatusMessage tone="error" message={error} /> : null}
        {success ? <StatusMessage tone="success" message={success} /> : null}
        <AuthSubmitButton label="Login" loading={loading} />
      </form>

      <Divider />
      <SocialAuthButtons />
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

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border-light" />
      <span className="text-xs uppercase tracking-[0.14em] text-muted">or</span>
      <span className="h-px flex-1 bg-border-light" />
    </div>
  );
}
