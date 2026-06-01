import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Suppriva Admin Dashboard",
  description: "Premium Suppriva admin dashboard UI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
