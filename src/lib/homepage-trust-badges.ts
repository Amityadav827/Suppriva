type Timestamp = string;

export type HomepageTrustBadge = {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageTrustBadgesCms = {
  badges: HomepageTrustBadge[];
};

export const DEFAULT_HOMEPAGE_TRUST_BADGES: HomepageTrustBadgesCms = {
  badges: [
    {
      title: "Ingredient First",
      description:
        "Explore supplements through ingredients, wellness goals, and functional benefits.",
      icon: "leaf",
      sort_order: 0,
      is_visible: true,
    },
    {
      title: "Educational Content",
      description:
        "Access easy-to-understand wellness information designed to support informed decisions.",
      icon: "book-open",
      sort_order: 1,
      is_visible: true,
    },
    {
      title: "Smart Comparisons",
      description:
        "Compare ingredients, formulations, and wellness solutions to find the right fit.",
      icon: "scale",
      sort_order: 2,
      is_visible: true,
    },
    {
      title: "Expert Guidance",
      description:
        "Have questions before choosing a supplement? Submit your query and receive personalized guidance.",
      icon: "stethoscope",
      sort_order: 3,
      is_visible: true,
    },
  ],
};

export function mergeHomepageTrustBadgesCms(
  input: Partial<HomepageTrustBadgesCms> | null | undefined,
) {
  const badges = input?.badges?.length
    ? input.badges
    : DEFAULT_HOMEPAGE_TRUST_BADGES.badges;

  return {
    badges: [...badges].sort((a, b) => a.sort_order - b.sort_order),
  };
}
