import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { dashboardUsers } from "@/lib/dashboard-data";

export default function UsersAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Users"
        subtitle="View admin, editor, and subscriber account records in a future-ready UI."
      />
      <DashboardCard title="User Directory">
        <DataTable columns={["Name", "Email", "Role", "Status"]} rows={dashboardUsers} />
      </DashboardCard>
    </>
  );
}
