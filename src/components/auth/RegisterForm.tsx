"use client";

import { useRouter } from "next/navigation";
import { Mail, UserRound } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { InputField } from "@/components/auth/InputField";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const termsAccepted = formData.get("terms") === "on";

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (!termsAccepted) {
        throw new Error("Please agree to the Terms and Privacy Policy.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && data.session) {
        const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            full_name: fullName,
            email,
            role: "user",
            status: "active",
          });

        if (profileError && profileError.code !== "23505") {
          throw profileError;
        }
      }

      setSuccess("Account created. You can now login.");
      router.push("/login");
      router.refresh();
    } catch (registerError) {
      setError(
        registerError instanceof Error ? registerError.message : "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create Account"
      subtitle="Start your Suppriva wellness journey with a clean account experience."
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Login"
    >
      <form className="grid gap-5" onSubmit={handleRegister}>
        <InputField
          label="Full Name"
          name="fullName"
          placeholder="Your name"
          icon={UserRound}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
        />
        <PasswordField label="Password" name="password" placeholder="Create password" />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm password"
        />
        <label className="flex items-start gap-2 text-sm leading-6 text-muted">
          <input
            name="terms"
            type="checkbox"
            className="mt-1 size-4 rounded border-border-light accent-primary"
          />
          I agree to the Terms and Privacy Policy.
        </label>
        {error ? <StatusMessage tone="error" message={error} /> : null}
        {success ? <StatusMessage tone="success" message={success} /> : null}
        <AuthSubmitButton label="Create Account" loading={loading} />
      </form>

      <Divider />
      <SocialAuthButtons mode="Sign up" />
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
