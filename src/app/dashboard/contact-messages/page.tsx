import { DashboardContactMessagesClient } from "@/components/dashboard/contact/DashboardContactMessagesClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function ContactMessagesAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Contact Messages"
        subtitle="Review and manage messages submitted from the Suppriva contact form."
      />
      <DashboardContactMessagesClient />
    </>
  );
}
