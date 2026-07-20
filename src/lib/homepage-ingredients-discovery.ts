type Timestamp = string;

export type HomepageIngredientChip = {
  id?: string;
  label: string;
  icon: string;
  url: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageIngredientsDiscoveryCms = {
  chips: HomepageIngredientChip[];
};

export const DEFAULT_HOMEPAGE_INGREDIENT_CHIPS: HomepageIngredientChip[] = [
  {
    label: "Ashwagandha",
    icon: "leaf",
    url: "/ingredient/ashwagandha",
    sort_order: 0,
    is_visible: true,
  },
  {
    label: "Berberine",
    icon: "activity",
    url: "/ingredient/berberine",
    sort_order: 1,
    is_visible: true,
  },
  {
    label: "Magnesium",
    icon: "zap",
    url: "/ingredient/magnesium",
    sort_order: 2,
    is_visible: true,
  },
  {
    label: "Collagen",
    icon: "sparkles",
    url: "/ingredient/collagen-peptides",
    sort_order: 3,
    is_visible: true,
  },
  {
    label: "Curcumin",
    icon: "sun",
    url: "/ingredient/turmeric-curcumin",
    sort_order: 4,
    is_visible: true,
  },
  {
    label: "Probiotics",
    icon: "shield-check",
    url: "/ingredient/lactobacillus-acidophilus",
    sort_order: 5,
    is_visible: true,
  },
  {
    label: "Omega 3",
    icon: "fish",
    url: "/ingredient/omega-3",
    sort_order: 6,
    is_visible: true,
  },
  {
    label: "Vitamin D3",
    icon: "sun-medium",
    url: "/ingredient/vitamin-d3",
    sort_order: 7,
    is_visible: true,
  },
  {
    label: "Zinc",
    icon: "shield-plus",
    url: "/ingredient/zinc",
    sort_order: 8,
    is_visible: true,
  },
  {
    label: "Green Tea",
    icon: "leafy-green",
    url: "/ingredient/green-tea-extract",
    sort_order: 9,
    is_visible: true,
  },
  {
    label: "Lion's Mane",
    icon: "brain",
    url: "/ingredient/lions-mane",
    sort_order: 10,
    is_visible: true,
  },
  {
    label: "CoQ10",
    icon: "battery",
    url: "/ingredient/coq10",
    sort_order: 11,
    is_visible: true,
  },
  {
    label: "Apple Cider Vinegar",
    icon: "flask-conical",
    url: "/ingredient/apple-cider-vinegar",
    sort_order: 12,
    is_visible: true,
  },
  {
    label: "Moringa",
    icon: "sprout",
    url: "/ingredients",
    sort_order: 13,
    is_visible: true,
  },
  {
    label: "Milk Thistle",
    icon: "flower-2",
    url: "/ingredient/milk-thistle",
    sort_order: 14,
    is_visible: true,
  },
  {
    label: "Biotin",
    icon: "scissors",
    url: "/ingredient/biotin",
    sort_order: 15,
    is_visible: true,
  },
];

export const DEFAULT_HOMEPAGE_INGREDIENTS_DISCOVERY: HomepageIngredientsDiscoveryCms = {
  chips: DEFAULT_HOMEPAGE_INGREDIENT_CHIPS,
};

export function mergeHomepageIngredientsDiscoveryCms(
  input: Partial<HomepageIngredientsDiscoveryCms> | null | undefined,
) {
  return {
    chips: (input?.chips?.length
      ? input.chips
      : DEFAULT_HOMEPAGE_INGREDIENT_CHIPS
    ).sort((a, b) => a.sort_order - b.sort_order),
  };
}
