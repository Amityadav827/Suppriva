import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasAdminAccess } from "@/lib/auth/permissions";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env.isConfigured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);

      return NextResponse.redirect(redirectUrl);
    }

    const { data: profileById, error: profileByIdError } = await supabase
      .from("users")
      .select("id,email,role,status")
      .eq("id", user.id)
      .maybeSingle();

    let profile = profileById;
    let profileError = profileByIdError;

    if (!profile && user.email) {
      const { data: profileByEmail, error: profileByEmailError } = await supabase
        .from("users")
        .select("id,email,role,status")
        .eq("email", user.email)
        .maybeSingle();

      profile = profileByEmail;
      profileError = profileByEmailError;
    }

    if (profileError || !hasAdminAccess(profile)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "admin_required");

      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
