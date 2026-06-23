export const DEFAULT_AUTHOR_PROFILE = {
  name: "Suppriva Editorial Team",
  slug: "suppriva-editorial-team",
  designation: "Editorial Team",
  qualification: "Supplement Research Editors",
  experience_years: 10,
  bio: "The Suppriva editorial team researches supplements, ingredients, and wellness trends to make product discovery easier and more trustworthy.",
  website_url: null,
  is_active: true,
} as const;

export const DEFAULT_REVIEWER_PROFILE = {
  name: "Suppriva Wellness Review Board",
  slug: "suppriva-wellness-review-board",
  designation: "Medical Review Board",
  qualification: "Licensed Wellness & Nutrition Reviewers",
  experience_years: 12,
  bio: "Suppriva's wellness review board checks ingredient safety language, product positioning, and educational clarity before publication.",
  website_url: null,
  is_active: true,
} as const;

export function slugifyProfileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
