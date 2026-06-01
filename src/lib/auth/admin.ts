import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasAdminAccess } from "@/lib/auth/permissions";

export async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profileById } = await supabase
    .from("users")
    .select("id,email,role,status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileById) {
    return profileById;
  }

  if (!user.email) {
    return null;
  }

  const { data: profileByEmail } = await supabase
    .from("users")
    .select("id,email,role,status")
    .eq("email", user.email)
    .maybeSingle();

  return profileByEmail;
}

export async function isAdmin() {
  const profile = await getCurrentUserProfile();

  const allowed = hasAdminAccess(profile);

  return allowed;
}
