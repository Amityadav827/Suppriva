import { hasAdminAccess } from "@/lib/auth/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const STORAGE_BUCKETS = {
  categories: "category-images",
  products: "product-images",
  blogs: "blog-images",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export type UploadImageResult = {
  path: string;
  publicUrl: string;
};

export function validateDashboardImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }
}

export async function uploadDashboardImage({
  bucket,
  file,
  folder,
}: {
  bucket: StorageBucket;
  file: File;
  folder: string;
}): Promise<UploadImageResult> {
  validateDashboardImage(file);

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in as an admin before uploading images.");
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

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!hasAdminAccess(profile)) {
    throw new Error("Only active admin users can upload images.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const path = `${folder}/${crypto.randomUUID()}-${safeName || "image"}.${extension}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}
