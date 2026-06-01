import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Suppriva",
  description: "Access your Suppriva wellness account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Member Access"
      title="Welcome back to your premium wellness dashboard."
      subtitle="Sign in to continue exploring curated supplement picks, guides, and saved wellness research."
    >
      <LoginForm />
    </AuthLayout>
  );
}
