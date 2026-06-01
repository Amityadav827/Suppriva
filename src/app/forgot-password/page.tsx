import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Suppriva",
  description: "Request a Suppriva password reset link.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Secure Recovery"
      title="Reset access to your wellness research account."
      subtitle="Enter your email and we will send a reset link when backend auth is connected."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
