type Timestamp = string;

export type HomepageWhyChooseCard = {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageWhyChooseCms = {
  cards: HomepageWhyChooseCard[];
};

export const DEFAULT_HOMEPAGE_WHY_CHOOSE: HomepageWhyChooseCms = {
  cards: [
    {
      title: "Ingredient Library",
      description:
        "Explore vitamins, herbs, minerals, probiotics, and functional ingredients.",
      icon: "leaf",
      sort_order: 0,
      is_visible: true,
    },
    {
      title: "Wellness Solutions",
      description:
        "Find supplements organized by your health goals and lifestyle needs.",
      icon: "compass",
      sort_order: 1,
      is_visible: true,
    },
    {
      title: "Smart Comparisons",
      description:
        "Compare formulas, ingredients, and features to make informed decisions.",
      icon: "scale",
      sort_order: 2,
      is_visible: true,
    },
    {
      title: "Expert Guidance",
      description:
        "Need help choosing? Submit your question and get personalized support.",
      icon: "stethoscope",
      sort_order: 3,
      is_visible: true,
    },
  ],
};

export function mergeHomepageWhyChooseCms(
  input: Partial<HomepageWhyChooseCms> | null | undefined,
) {
  const cards = input?.cards?.length
    ? input.cards
    : DEFAULT_HOMEPAGE_WHY_CHOOSE.cards;

  return {
    cards: [...cards].sort((a, b) => a.sort_order - b.sort_order),
  };
}
