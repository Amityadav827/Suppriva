import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | Suppriva",
  description: "Create your Suppriva wellness account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Join Suppriva"
      title="Create your premium wellness research account."
      subtitle="Save supplement discoveries, explore guides, and follow curated health-tech recommendations."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
