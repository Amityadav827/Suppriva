import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Suppriva",
  description: "Update your Suppriva account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Password Update"
      title="Choose a stronger password for your account."
      subtitle="Create a new password for your Suppriva profile."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
