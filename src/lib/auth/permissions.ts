export type AdminProfile = {
  role?: string | null;
  status?: string | null;
};

export function hasAdminAccess(profile: AdminProfile | null | undefined) {
  const normalizedRole = profile?.role?.trim().toLowerCase();
  const normalizedStatus = profile?.status?.trim().toLowerCase();

  return normalizedStatus === "active" && normalizedRole === "admin";
}
