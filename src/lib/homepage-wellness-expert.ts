type Timestamp = string;

export type HomepageWellnessExpertSettings = {
  id?: string;
  badge_text: string;
  badge_icon: string;
  fallback_name: string;
  fallback_designation: string;
  fallback_bio: string;
  fallback_secondary_bio: string;
  fallback_image: string;
  trust_line: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageWellnessExpertCms = {
  settings: HomepageWellnessExpertSettings;
};

export const DEFAULT_HOMEPAGE_WELLNESS_EXPERT: HomepageWellnessExpertCms = {
  settings: {
    badge_text: "Medical & Editorial Advisory",
    badge_icon: "shield-check",
    fallback_name: "Dr. Arindham Chatterjee",
    fallback_designation: "Medical & Wellness Advisor",
    fallback_bio:
      "Dr. Arindham Chatterjee contributes expert guidance to Suppriva's educational wellness content and ingredient resources, helping readers better understand ingredients, wellness goals, and healthy lifestyle practices.",
    fallback_secondary_bio:
      "His focus includes wellness education, preventive lifestyle strategies, ingredient awareness, and supporting readers with evidence-informed wellness knowledge.",
    fallback_image:
      "https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg",
    trust_line: "Wellness Education - Ingredient Research - Preventive Health",
  },
};

function textOrDefault(value: string | null | undefined, defaultValue: string) {
  return typeof value === "string" && value.trim() ? value : defaultValue;
}

export function mergeHomepageWellnessExpertCms(
  input: Partial<HomepageWellnessExpertCms> | null | undefined,
) {
  const savedSettings = input?.settings;

  return {
    settings: savedSettings
      ? {
          ...DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings,
          ...savedSettings,
          badge_text: textOrDefault(
            savedSettings.badge_text,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.badge_text,
          ),
          badge_icon: textOrDefault(
            savedSettings.badge_icon,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.badge_icon,
          ),
          fallback_name: textOrDefault(
            savedSettings.fallback_name,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.fallback_name,
          ),
          fallback_designation: textOrDefault(
            savedSettings.fallback_designation,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.fallback_designation,
          ),
          fallback_bio: textOrDefault(
            savedSettings.fallback_bio,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.fallback_bio,
          ),
          fallback_secondary_bio: textOrDefault(
            savedSettings.fallback_secondary_bio,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.fallback_secondary_bio,
          ),
          fallback_image: textOrDefault(
            savedSettings.fallback_image,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.fallback_image,
          ),
          trust_line: textOrDefault(
            savedSettings.trust_line,
            DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings.trust_line,
          ),
        }
      : DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings,
  };
}
