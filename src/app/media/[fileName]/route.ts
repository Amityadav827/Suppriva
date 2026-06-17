import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { MEDIA_LIBRARY_BUCKET } from "@/lib/media/constants";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await context.params;
  const env = getSupabaseEnv();

  if (!env.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const assetUrl = `${env.url}/storage/v1/object/public/${MEDIA_LIBRARY_BUCKET}/${encodeURIComponent(fileName)}`;

  return NextResponse.redirect(assetUrl, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
