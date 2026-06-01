"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Password updated. Redirecting to login...");
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter and confirm your new password."
    >
      <form className="grid gap-5" onSubmit={handlePasswordUpdate}>
        <PasswordField
          label="New Password"
          name="newPassword"
          placeholder="New password"
        />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm new password"
        />
        {error ? <StatusMessage tone="error" message={error} /> : null}
        {success ? <StatusMessage tone="success" message={success} /> : null}
        <AuthSubmitButton label="Update Password" loading={loading} />
      </form>
      <p className="mt-7 text-center text-sm text-muted">
        Want to sign in?{" "}
        <Link
          href="/login"
          className="font-heading font-semibold text-primary transition hover:text-gold"
        >
          Go to login
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
