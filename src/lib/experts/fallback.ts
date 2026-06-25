import type { Expert } from "@/lib/database/types";

export const DR_ARINDHAM_EXPERT: Expert = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Dr. Arindham Chatterjee",
  slug: "dr-arindham-chatterjee",
  profile_image:
    "https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg",
  designation: "Medical & Wellness Advisor",
  short_bio:
    "Dr. Arindham Chatterjee contributes expert guidance to Suppriva's educational wellness resources, ingredient explainers, and prevention-focused health content.",
  full_bio:
    "Dr. Arindham Chatterjee is a wellness-focused medical professional whose work centers on integrative healthcare, ingredient education, and preventive lifestyle awareness.\n\nHis contribution to Suppriva focuses on educational clarity, practical wellness communication, and helping readers better understand herbs, functional ingredients, and long-term lifestyle habits.\n\nHis areas of interest include herbal wellness, public health awareness, supplement education, and prevention-oriented wellness strategies that support informed decision-making.",
  editorial_contribution:
    "Dr. Arindham Chatterjee contributes expert guidance to educational wellness content, ingredient explainers, and wellness resources published on Suppriva.\n\nThe role focuses on improving educational quality and helping readers better understand ingredients and wellness concepts.\n\nIndividual product rankings, affiliate partnerships, and editorial decisions remain independently managed by the Suppriva Editorial Team.",
  content_reviewed: [
    {
      label: "Ingredient Guides",
      value: 0,
      description: "Published ingredient education and research resources.",
    },
    {
      label: "Product Reviews",
      value: 0,
      description: "Supplement product reviews and comparison resources.",
    },
    {
      label: "Wellness Articles",
      value: 0,
      description: "Educational wellness articles and practical guides.",
    },
    {
      label: "Health Goal Pages",
      value: 0,
      description: "Health goal pages and wellness category resources.",
    },
  ],
  experience_years: 12,
  linkedin_url: "https://www.linkedin.com/in/dr-arindham-chatterjee-2b1b6716/",
  website_url: null,
  email: null,
  expertise_tags: [
    "Integrative Healthcare",
    "Herbal Wellness",
    "Preventive Lifestyle",
    "Supplement Education",
  ],
  status: "active",
  display_order: 1,
  featured_on_homepage: true,
  seo_title: "Dr. Arindham Chatterjee | Wellness Expert | Suppriva",
  seo_description:
    "Learn about Dr. Arindham Chatterjee, a wellness expert contributing educational guidance and ingredient resources at Suppriva.",
  meta_image:
    "https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg",
  linked_author_id: null,
  linked_reviewer_id: null,
  created_at: "2026-06-23T00:00:00.000Z",
  updated_at: "2026-06-23T00:00:00.000Z",
};

export const FALLBACK_EXPERTS = [DR_ARINDHAM_EXPERT];

export function isMissingExpertsTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("public.experts") ||
    (message.toLowerCase().includes("experts") &&
      message.toLowerCase().includes("schema cache"))
  );
}
