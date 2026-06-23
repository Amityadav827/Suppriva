export const SITE_NAME = "Suppriva";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://suppriva.vercel.app"
).replace(/\/+$/, "");
export const SITE_LOGO_PATH = "/assets/hero-supplements.webp";
export const DEFAULT_OG_IMAGE = "/assets/hero-supplements-og.jpg";
export const SITE_SOCIAL_LINKS = [
  process.env.NEXT_PUBLIC_SITE_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_SITE_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_SITE_LINKEDIN_URL,
  process.env.NEXT_PUBLIC_SITE_X_URL,
  process.env.NEXT_PUBLIC_SITE_YOUTUBE_URL,
]
  .map((value) => value?.trim())
  .filter((value): value is string => Boolean(value));
