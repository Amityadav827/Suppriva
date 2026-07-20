"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { CMS_ICON_OPTIONS } from "@/lib/cms-icons";
import type {
  HomepageBlogsCms,
  HomepageBlogsSettings,
} from "@/lib/homepage-blogs";
import type {
  HomepageHeroCms,
  HomepageHeroFloatingPill,
  HomepageHeroSettings,
  HomepageHeroTrustCard,
} from "@/lib/homepage-hero";
import type {
  HomepageIngredientChip,
  HomepageIngredientsDiscoveryCms,
} from "@/lib/homepage-ingredients-discovery";
import type {
  HomepagePopularPicksCms,
  HomepagePopularPicksSettings,
} from "@/lib/homepage-popular-picks";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";
import type {
  HomepageWellnessExpertCms,
  HomepageWellnessExpertSettings,
} from "@/lib/homepage-wellness-expert";
import type {
  HomepageWellnessSolutionFeatureCard,
  HomepageWellnessSolutionsCms,
  HomepageWellnessSolutionsSettings,
  HomepageWellnessSolutionShowcaseProduct,
} from "@/lib/homepage-wellness-solutions";

type HomepageSectionsResponse = {
  sections?: HomepageSectionConfig[];
  error?: string;
};

type HomepageHeroResponse = {
  hero?: HomepageHeroCms;
  error?: string;
};

type HomepageBlogsResponse = {
  homepageBlogs?: HomepageBlogsCms;
  error?: string;
};

type HomepagePopularPicksResponse = {
  popularPicks?: HomepagePopularPicksCms;
  error?: string;
};

type HomepageIngredientsDiscoveryResponse = {
  ingredientsDiscovery?: HomepageIngredientsDiscoveryCms;
  error?: string;
};

type HomepageWellnessExpertResponse = {
  wellnessExpert?: HomepageWellnessExpertCms;
  error?: string;
};

type HomepageWellnessSolutionsResponse = {
  wellnessSolutions?: HomepageWellnessSolutionsCms;
  error?: string;
};

function sortSections(sections: HomepageSectionConfig[]) {
  return [...sections].sort((a, b) => a.sort_order - b.sort_order);
}

export function DashboardHomepageClient() {
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [homepageBlogs, setHomepageBlogs] = useState<HomepageBlogsCms | null>(null);
  const [popularPicks, setPopularPicks] =
    useState<HomepagePopularPicksCms | null>(null);
  const [hero, setHero] = useState<HomepageHeroCms | null>(null);
  const [ingredientsDiscovery, setIngredientsDiscovery] =
    useState<HomepageIngredientsDiscoveryCms | null>(null);
  const [wellnessExpert, setWellnessExpert] =
    useState<HomepageWellnessExpertCms | null>(null);
  const [wellnessSolutions, setWellnessSolutions] =
    useState<HomepageWellnessSolutionsCms | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);
  const [isPopularPicksLoading, setIsPopularPicksLoading] = useState(true);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [isIngredientsLoading, setIsIngredientsLoading] = useState(true);
  const [isWellnessExpertLoading, setIsWellnessExpertLoading] = useState(true);
  const [isWellnessSolutionsLoading, setIsWellnessSolutionsLoading] =
    useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlogsSaving, setIsBlogsSaving] = useState(false);
  const [isPopularPicksSaving, setIsPopularPicksSaving] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [isIngredientsSaving, setIsIngredientsSaving] = useState(false);
  const [isWellnessExpertSaving, setIsWellnessExpertSaving] = useState(false);
  const [isWellnessSolutionsSaving, setIsWellnessSolutionsSaving] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sortedSections = useMemo(() => sortSections(sections), [sections]);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-sections", { cache: "no-store" });
      const payload = (await response.json()) as HomepageSectionsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load homepage sections.");
      }

      setSections(sortSections(payload.sections ?? []));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load homepage sections.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHero = useCallback(async () => {
    setIsHeroLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-hero", { cache: "no-store" });
      const payload = (await response.json()) as HomepageHeroResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load hero CMS.");
      }

      setHero(payload.hero ?? null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load hero CMS.",
      );
    } finally {
      setIsHeroLoading(false);
    }
  }, []);

  const fetchHomepageBlogs = useCallback(async () => {
    setIsBlogsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-blogs", { cache: "no-store" });
      const payload = (await response.json()) as HomepageBlogsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load blogs CMS.");
      }

      setHomepageBlogs(payload.homepageBlogs ?? null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load blogs CMS.",
      );
    } finally {
      setIsBlogsLoading(false);
    }
  }, []);

  const fetchPopularPicks = useCallback(async () => {
    setIsPopularPicksLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-popular-picks", {
        cache: "no-store",
      });
      const payload = (await response.json()) as HomepagePopularPicksResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load Popular Picks CMS.");
      }

      setPopularPicks(payload.popularPicks ?? null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load Popular Picks CMS.",
      );
    } finally {
      setIsPopularPicksLoading(false);
    }
  }, []);

  const fetchIngredientsDiscovery = useCallback(async () => {
    setIsIngredientsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-ingredients-discovery", {
        cache: "no-store",
      });
      const payload =
        (await response.json()) as HomepageIngredientsDiscoveryResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Unable to load ingredients discovery CMS.",
        );
      }

      setIngredientsDiscovery(payload.ingredientsDiscovery ?? null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load ingredients discovery CMS.",
      );
    } finally {
      setIsIngredientsLoading(false);
    }
  }, []);

  const fetchWellnessExpert = useCallback(async () => {
    setIsWellnessExpertLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-wellness-expert", {
        cache: "no-store",
      });
      const payload = (await response.json()) as HomepageWellnessExpertResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load wellness expert CMS.");
      }

      setWellnessExpert(payload.wellnessExpert ?? null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load wellness expert CMS.",
      );
    } finally {
      setIsWellnessExpertLoading(false);
    }
  }, []);

  const fetchWellnessSolutions = useCallback(async () => {
    setIsWellnessSolutionsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/homepage-wellness-solutions", {
        cache: "no-store",
      });
      const payload = (await response.json()) as HomepageWellnessSolutionsResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Unable to load Discover Wellness Solutions CMS.",
        );
      }

      setWellnessSolutions(payload.wellnessSolutions ?? null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load Discover Wellness Solutions CMS.",
      );
    } finally {
      setIsWellnessSolutionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSections();
    void fetchHomepageBlogs();
    void fetchPopularPicks();
    void fetchHero();
    void fetchIngredientsDiscovery();
    void fetchWellnessExpert();
    void fetchWellnessSolutions();
  }, [
    fetchHero,
    fetchHomepageBlogs,
    fetchIngredientsDiscovery,
    fetchPopularPicks,
    fetchSections,
    fetchWellnessExpert,
    fetchWellnessSolutions,
  ]);

  function updateSection(
    sectionKey: string,
    field: keyof HomepageSectionConfig,
    value: string | number | boolean | null,
  ) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section_key === sectionKey ? { ...section, [field]: value } : section,
      ),
    );
  }

  function updateHeroSettings(
    field: keyof HomepageHeroSettings,
    value: string,
  ) {
    setHero((currentHero) =>
      currentHero
        ? {
            ...currentHero,
            settings: {
              ...currentHero.settings,
              [field]: value,
            },
          }
        : currentHero,
    );
  }

  function updateBlogsSettings(
    field: keyof HomepageBlogsSettings,
    value: string | number | boolean,
  ) {
    setHomepageBlogs((currentBlogs) =>
      currentBlogs
        ? {
            ...currentBlogs,
            settings: {
              ...currentBlogs.settings,
              [field]: value,
            },
          }
        : currentBlogs,
    );
  }

  function updatePopularPicksSettings(
    field: keyof HomepagePopularPicksSettings,
    value: string | number | boolean,
  ) {
    setPopularPicks((currentPicks) =>
      currentPicks
        ? {
            ...currentPicks,
            settings: {
              ...currentPicks.settings,
              [field]: value,
            },
          }
        : currentPicks,
    );
  }

  function updateTrustCard(
    index: number,
    field: keyof HomepageHeroTrustCard,
    value: string | number | boolean,
  ) {
    setHero((currentHero) => {
      if (!currentHero) return currentHero;

      return {
        ...currentHero,
        trust_cards: currentHero.trust_cards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, [field]: value } : card,
        ),
      };
    });
  }

  function updateFloatingPill(
    index: number,
    field: keyof HomepageHeroFloatingPill,
    value: string | number | boolean,
  ) {
    setHero((currentHero) => {
      if (!currentHero) return currentHero;

      return {
        ...currentHero,
        floating_pills: currentHero.floating_pills.map((pill, pillIndex) =>
          pillIndex === index ? { ...pill, [field]: value } : pill,
        ),
      };
    });
  }

  function updateIngredientChip(
    index: number,
    field: keyof HomepageIngredientChip,
    value: string | number | boolean,
  ) {
    setIngredientsDiscovery((currentDiscovery) => {
      if (!currentDiscovery) return currentDiscovery;

      return {
        ...currentDiscovery,
        chips: currentDiscovery.chips.map((chip, chipIndex) =>
          chipIndex === index ? { ...chip, [field]: value } : chip,
        ),
      };
    });
  }

  function updateWellnessExpertSettings(
    field: keyof HomepageWellnessExpertSettings,
    value: string,
  ) {
    setWellnessExpert((currentSettings) =>
      currentSettings
        ? {
            ...currentSettings,
            settings: {
              ...currentSettings.settings,
              [field]: value,
            },
          }
        : currentSettings,
    );
  }

  function updateWellnessSolutionsSettings(
    field: keyof HomepageWellnessSolutionsSettings,
    value: string,
  ) {
    setWellnessSolutions((currentSolutions) =>
      currentSolutions
        ? {
            ...currentSolutions,
            settings: {
              ...currentSolutions.settings,
              [field]: value,
            },
          }
        : currentSolutions,
    );
  }

  function updateWellnessSolutionFeature(
    index: number,
    field: keyof HomepageWellnessSolutionFeatureCard,
    value: string | number | boolean,
  ) {
    setWellnessSolutions((currentSolutions) => {
      if (!currentSolutions) return currentSolutions;

      return {
        ...currentSolutions,
        feature_cards: currentSolutions.feature_cards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, [field]: value } : card,
        ),
      };
    });
  }

  function updateWellnessSolutionProduct(
    index: number,
    field: keyof HomepageWellnessSolutionShowcaseProduct,
    value: string | number | boolean,
  ) {
    setWellnessSolutions((currentSolutions) => {
      if (!currentSolutions) return currentSolutions;

      return {
        ...currentSolutions,
        showcase_products: currentSolutions.showcase_products.map(
          (product, productIndex) =>
            productIndex === index ? { ...product, [field]: value } : product,
        ),
      };
    });
  }

  function addIngredientChip() {
    setIngredientsDiscovery((currentDiscovery) => {
      if (!currentDiscovery) return currentDiscovery;

      return {
        ...currentDiscovery,
        chips: [
          ...currentDiscovery.chips,
          {
            label: "New Ingredient",
            icon: "leaf",
            url: "/ingredients",
            sort_order: currentDiscovery.chips.length,
            is_visible: true,
          },
        ],
      };
    });
  }

  function removeIngredientChip(index: number) {
    setIngredientsDiscovery((currentDiscovery) => {
      if (!currentDiscovery) return currentDiscovery;

      return {
        ...currentDiscovery,
        chips: currentDiscovery.chips.filter((_, chipIndex) => chipIndex !== index),
      };
    });
  }

  function addWellnessSolutionFeature() {
    setWellnessSolutions((currentSolutions) => {
      if (!currentSolutions) return currentSolutions;

      return {
        ...currentSolutions,
        feature_cards: [
          ...currentSolutions.feature_cards,
          {
            icon: "leaf",
            title: "New Feature",
            description: "Describe this wellness solution feature.",
            sort_order: currentSolutions.feature_cards.length,
            is_visible: true,
          },
        ],
      };
    });
  }

  function removeWellnessSolutionFeature(index: number) {
    setWellnessSolutions((currentSolutions) => {
      if (!currentSolutions) return currentSolutions;

      return {
        ...currentSolutions,
        feature_cards: currentSolutions.feature_cards.filter(
          (_, featureIndex) => featureIndex !== index,
        ),
      };
    });
  }

  function addWellnessSolutionProduct() {
    setWellnessSolutions((currentSolutions) => {
      if (!currentSolutions) return currentSolutions;

      return {
        ...currentSolutions,
        showcase_products: [
          ...currentSolutions.showcase_products,
          {
            product_name: "New Product",
            label: "FEATURED",
            url: "/products",
            sort_order: currentSolutions.showcase_products.length,
            is_visible: true,
          },
        ],
      };
    });
  }

  function removeWellnessSolutionProduct(index: number) {
    setWellnessSolutions((currentSolutions) => {
      if (!currentSolutions) return currentSolutions;

      return {
        ...currentSolutions,
        showcase_products: currentSolutions.showcase_products.filter(
          (_, productIndex) => productIndex !== index,
        ),
      };
    });
  }

  async function saveSections() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-sections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      });
      const payload = (await response.json()) as HomepageSectionsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save homepage sections.");
      }

      setSections(sortSections(payload.sections ?? []));
      setSuccess("Homepage CMS settings saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save homepage sections.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveHero() {
    if (!hero) return;

    setIsHeroSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hero }),
      });
      const payload = (await response.json()) as HomepageHeroResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save hero CMS.");
      }

      setHero(payload.hero ?? hero);
      setSuccess("Hero CMS saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save hero CMS.",
      );
    } finally {
      setIsHeroSaving(false);
    }
  }

  async function saveHomepageBlogs() {
    if (!homepageBlogs) return;

    setIsBlogsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-blogs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ homepageBlogs }),
      });
      const payload = (await response.json()) as HomepageBlogsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save blogs CMS.");
      }

      setHomepageBlogs(payload.homepageBlogs ?? homepageBlogs);
      setSuccess("Blogs CMS saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save blogs CMS.",
      );
    } finally {
      setIsBlogsSaving(false);
    }
  }

  async function savePopularPicks() {
    if (!popularPicks) return;

    setIsPopularPicksSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-popular-picks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ popularPicks }),
      });
      const payload = (await response.json()) as HomepagePopularPicksResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save Popular Picks CMS.");
      }

      setPopularPicks(payload.popularPicks ?? popularPicks);
      setSuccess("Popular Picks CMS saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save Popular Picks CMS.",
      );
    } finally {
      setIsPopularPicksSaving(false);
    }
  }

  async function saveIngredientsDiscovery() {
    if (!ingredientsDiscovery) return;

    setIsIngredientsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-ingredients-discovery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredientsDiscovery }),
      });
      const payload =
        (await response.json()) as HomepageIngredientsDiscoveryResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Unable to save ingredients discovery CMS.",
        );
      }

      setIngredientsDiscovery(payload.ingredientsDiscovery ?? ingredientsDiscovery);
      setSuccess("Ingredients Discovery CMS saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save ingredients discovery CMS.",
      );
    } finally {
      setIsIngredientsSaving(false);
    }
  }

  async function saveWellnessExpert() {
    if (!wellnessExpert) return;

    setIsWellnessExpertSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-wellness-expert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wellnessExpert }),
      });
      const payload = (await response.json()) as HomepageWellnessExpertResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save wellness expert CMS.");
      }

      setWellnessExpert(payload.wellnessExpert ?? wellnessExpert);
      setSuccess("Wellness Expert CMS saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save wellness expert CMS.",
      );
    } finally {
      setIsWellnessExpertSaving(false);
    }
  }

  async function saveWellnessSolutions() {
    if (!wellnessSolutions) return;

    setIsWellnessSolutionsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/homepage-wellness-solutions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wellnessSolutions }),
      });
      const payload = (await response.json()) as HomepageWellnessSolutionsResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Unable to save Discover Wellness Solutions CMS.",
        );
      }

      setWellnessSolutions(payload.wellnessSolutions ?? wellnessSolutions);
      setSuccess("Discover Wellness Solutions CMS saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save Discover Wellness Solutions CMS.",
      );
    } finally {
      setIsWellnessSolutionsSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <DashboardCard
        title="Homepage CMS"
        description="Control homepage section visibility, order, titles, subtitles, and CTA defaults."
      >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm leading-6 text-muted">
          {sections.length} homepage sections configured for the public landing page.
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void fetchSections()}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void saveSections()}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save Homepage CMS"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-border-light">
        <div className="hidden grid-cols-[1.1fr_120px_140px_1fr_1fr] gap-4 bg-soft-green px-5 py-4 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary lg:grid">
          <span>Section</span>
          <span>Visible</span>
          <span>Order</span>
          <span>Title / Subtitle</span>
          <span>CTA</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-muted">
            Loading homepage sections...
          </div>
        ) : sortedSections.length ? (
          sortedSections.map((section) => (
            <div
              key={section.section_key}
              className="grid gap-4 border-t border-border-light px-5 py-5 first:border-t-0 lg:grid-cols-[1.1fr_120px_140px_1fr_1fr] lg:items-start"
            >
              <div>
                <p className="font-heading text-base font-extrabold text-text-dark">
                  {section.section_name}
                </p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  {section.section_key}
                </p>
              </div>

              <label className="inline-flex w-fit items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-3 font-heading text-sm font-semibold text-text-dark">
                <input
                  type="checkbox"
                  checked={section.is_visible}
                  onChange={(event) =>
                    updateSection(section.section_key, "is_visible", event.target.checked)
                  }
                  className="size-4 accent-primary"
                />
                {section.is_visible ? (
                  <Eye className="size-4 text-primary" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-4 text-muted" aria-hidden="true" />
                )}
                Visible
              </label>

              <label className="grid gap-2">
                <span className="font-heading text-xs font-semibold text-muted lg:hidden">
                  Sort Order
                </span>
                <input
                  type="number"
                  min={0}
                  value={section.sort_order}
                  onChange={(event) =>
                    updateSection(
                      section.section_key,
                      "sort_order",
                      Number(event.target.value),
                    )
                  }
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
              </label>

              <div className="grid gap-3">
                <input
                  type="text"
                  value={section.title ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "title", event.target.value)
                  }
                  placeholder="Section title"
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
                <textarea
                  value={section.subtitle ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "subtitle", event.target.value)
                  }
                  placeholder="Section subtitle"
                  rows={3}
                  className="rounded-2xl border border-border-light bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-gold"
                />
              </div>

              <div className="grid gap-3">
                <input
                  type="text"
                  value={section.cta_label ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "cta_label", event.target.value)
                  }
                  placeholder="CTA label"
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
                <input
                  type="text"
                  value={section.cta_url ?? ""}
                  onChange={(event) =>
                    updateSection(section.section_key, "cta_url", event.target.value)
                  }
                  placeholder="/example or https://example.com"
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-12 text-center text-muted">
            No homepage sections found.
          </div>
        )}
      </div>
      </DashboardCard>

      <DashboardCard
        title="Hero CMS"
        description="Edit the current homepage hero copy, CTAs, image, trust cards, and floating pills."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm leading-6 text-muted">
            Current frontend hero content is loaded here as the default CMS state.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchHero()}
              disabled={isHeroLoading || isHeroSaving}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh Hero
            </button>
            <button
              type="button"
              onClick={() => void saveHero()}
              disabled={isHeroLoading || isHeroSaving || !hero}
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isHeroSaving ? "Saving..." : "Save Hero CMS"}
            </button>
          </div>
        </div>

        {isHeroLoading ? (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Loading hero CMS...
          </div>
        ) : hero ? (
          <div className="grid gap-6">
            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Hero Content
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <InputField
                  label="Badge Text"
                  value={hero.settings.badge_text}
                  onChange={(value) => updateHeroSettings("badge_text", value)}
                />
                <SelectField
                  label="Badge Icon"
                  value={hero.settings.badge_icon}
                  onChange={(value) => updateHeroSettings("badge_icon", value)}
                />
                <InputField
                  label="Main Heading"
                  value={hero.settings.heading}
                  onChange={(value) => updateHeroSettings("heading", value)}
                />
                <InputField
                  label="Highlight Heading"
                  value={hero.settings.highlight_heading}
                  onChange={(value) => updateHeroSettings("highlight_heading", value)}
                />
                <TextAreaField
                  label="Description"
                  value={hero.settings.description}
                  onChange={(value) => updateHeroSettings("description", value)}
                />
                <InputField
                  label="Hero Image"
                  value={hero.settings.hero_image}
                  onChange={(value) => updateHeroSettings("hero_image", value)}
                />
                <InputField
                  label="Hero Image Alt"
                  value={hero.settings.hero_image_alt}
                  onChange={(value) => updateHeroSettings("hero_image_alt", value)}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Hero CTAs
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <InputField
                  label="Primary CTA Text"
                  value={hero.settings.primary_cta_label}
                  onChange={(value) => updateHeroSettings("primary_cta_label", value)}
                />
                <InputField
                  label="Primary CTA URL"
                  value={hero.settings.primary_cta_url}
                  onChange={(value) => updateHeroSettings("primary_cta_url", value)}
                />
                <InputField
                  label="Secondary CTA Text"
                  value={hero.settings.secondary_cta_label}
                  onChange={(value) => updateHeroSettings("secondary_cta_label", value)}
                />
                <InputField
                  label="Secondary CTA URL"
                  value={hero.settings.secondary_cta_url}
                  onChange={(value) => updateHeroSettings("secondary_cta_url", value)}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Trust Cards
              </h3>
              <div className="mt-4 grid gap-4">
                {hero.trust_cards.map((card, index) => (
                  <div
                    key={`${card.title}-${index}`}
                    className="grid gap-3 rounded-[20px] border border-border-light bg-cream/40 p-4 lg:grid-cols-[130px_170px_1fr_1.2fr_130px]"
                  >
                    <SelectField
                      label="Icon"
                      value={card.icon}
                      onChange={(value) => updateTrustCard(index, "icon", value)}
                    />
                    <InputField
                      label="Title"
                      value={card.title}
                      onChange={(value) => updateTrustCard(index, "title", value)}
                    />
                    <InputField
                      label="Description"
                      value={card.description}
                      onChange={(value) =>
                        updateTrustCard(index, "description", value)
                      }
                    />
                    <InputField
                      label="Sort Order"
                      type="number"
                      value={String(card.sort_order)}
                      onChange={(value) =>
                        updateTrustCard(index, "sort_order", Number(value))
                      }
                    />
                    <ToggleField
                      label="Visible"
                      checked={card.is_visible}
                      onChange={(value) =>
                        updateTrustCard(index, "is_visible", value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Floating Pills
              </h3>
              <div className="mt-4 grid gap-4">
                {hero.floating_pills.map((pill, index) => (
                  <div
                    key={`${pill.label}-${index}`}
                    className="grid gap-3 rounded-[20px] border border-border-light bg-cream/40 p-4 lg:grid-cols-[130px_170px_1fr_120px_130px]"
                  >
                    <SelectField
                      label="Icon"
                      value={pill.icon}
                      onChange={(value) => updateFloatingPill(index, "icon", value)}
                    />
                    <InputField
                      label="Label"
                      value={pill.label}
                      onChange={(value) => updateFloatingPill(index, "label", value)}
                    />
                    <InputField
                      label="Link"
                      value={pill.link}
                      onChange={(value) => updateFloatingPill(index, "link", value)}
                    />
                    <InputField
                      label="Order"
                      type="number"
                      value={String(pill.sort_order)}
                      onChange={(value) =>
                        updateFloatingPill(index, "sort_order", Number(value))
                      }
                    />
                    <ToggleField
                      label="Visible"
                      checked={pill.is_visible}
                      onChange={(value) =>
                        updateFloatingPill(index, "is_visible", value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Hero CMS could not be loaded.
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Ingredients Discovery CMS"
        description="Edit the ingredient chips used in the homepage Explore By Ingredients section."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm leading-6 text-muted">
            Section title, subtitle, CTA, order, and visibility are controlled in the
            Homepage CMS table above.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchIngredientsDiscovery()}
              disabled={isIngredientsLoading || isIngredientsSaving}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh Ingredients
            </button>
            <button
              type="button"
              onClick={addIngredientChip}
              disabled={isIngredientsLoading || isIngredientsSaving || !ingredientsDiscovery}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Chip
            </button>
            <button
              type="button"
              onClick={() => void saveIngredientsDiscovery()}
              disabled={
                isIngredientsLoading || isIngredientsSaving || !ingredientsDiscovery
              }
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isIngredientsSaving ? "Saving..." : "Save Ingredient Chips"}
            </button>
          </div>
        </div>

        {isIngredientsLoading ? (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Loading ingredients discovery CMS...
          </div>
        ) : ingredientsDiscovery ? (
          <div className="grid gap-4">
            {ingredientsDiscovery.chips.map((chip, index) => (
              <div
                key={`${chip.label}-${index}`}
                className="grid gap-3 rounded-[20px] border border-border-light bg-cream/40 p-4 lg:grid-cols-[130px_1fr_1fr_120px_130px_110px]"
              >
                <SelectField
                  label="Icon"
                  value={chip.icon}
                  onChange={(value) => updateIngredientChip(index, "icon", value)}
                />
                <InputField
                  label="Ingredient Name"
                  value={chip.label}
                  onChange={(value) => updateIngredientChip(index, "label", value)}
                />
                <InputField
                  label="URL"
                  value={chip.url}
                  onChange={(value) => updateIngredientChip(index, "url", value)}
                />
                <InputField
                  label="Order"
                  type="number"
                  value={String(chip.sort_order)}
                  onChange={(value) =>
                    updateIngredientChip(index, "sort_order", Number(value))
                  }
                />
                <ToggleField
                  label="Visible"
                  checked={chip.is_visible}
                  onChange={(value) =>
                    updateIngredientChip(index, "is_visible", value)
                  }
                />
                <label className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeIngredientChip(index)}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 font-heading text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Remove
                  </button>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Ingredients Discovery CMS could not be loaded.
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Popular Picks CMS"
        description="Control how dynamic products appear in the homepage Popular Picks & Best Supplements section."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm leading-6 text-muted">
            Product cards continue loading from the existing Product module. Section
            title, subtitle, CTA, order, and visibility are controlled in the
            Homepage CMS table above.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchPopularPicks()}
              disabled={isPopularPicksLoading || isPopularPicksSaving}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh Popular Picks
            </button>
            <button
              type="button"
              onClick={() => void savePopularPicks()}
              disabled={
                isPopularPicksLoading || isPopularPicksSaving || !popularPicks
              }
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isPopularPicksSaving ? "Saving..." : "Save Popular Picks"}
            </button>
          </div>
        </div>

        {isPopularPicksLoading ? (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Loading Popular Picks CMS...
          </div>
        ) : popularPicks ? (
          <div className="rounded-[24px] border border-border-light bg-white p-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <InputField
                label="Max Products To Display"
                type="number"
                value={String(popularPicks.settings.max_products)}
                onChange={(value) =>
                  updatePopularPicksSettings("max_products", Number(value))
                }
              />
              <label className="grid gap-2">
                <span className="font-heading text-xs font-semibold text-text-dark">
                  Sort Mode
                </span>
                <select
                  value={popularPicks.settings.sort_mode}
                  onChange={(event) =>
                    updatePopularPicksSettings("sort_mode", event.target.value)
                  }
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                >
                  <option value="latest">Latest</option>
                  <option value="featured">Featured</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="manual_priority">Manual Priority</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="font-heading text-xs font-semibold text-text-dark">
                  Product Source Mode
                </span>
                <select
                  value={popularPicks.settings.source_mode}
                  onChange={(event) =>
                    updatePopularPicksSettings("source_mode", event.target.value)
                  }
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                >
                  <option value="automatic">Automatic</option>
                  <option value="featured_only">Featured Products Only</option>
                </select>
              </label>
              <ToggleField
                label="Show Product Rating"
                checked={popularPicks.settings.show_product_rating}
                onChange={(value) =>
                  updatePopularPicksSettings("show_product_rating", value)
                }
              />
              <ToggleField
                label="Show Product Category"
                checked={popularPicks.settings.show_product_category}
                onChange={(value) =>
                  updatePopularPicksSettings("show_product_category", value)
                }
              />
              <ToggleField
                label="Show Product CTA"
                checked={popularPicks.settings.show_product_cta}
                onChange={(value) =>
                  updatePopularPicksSettings("show_product_cta", value)
                }
              />
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Popular Picks CMS could not be loaded.
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Discover Wellness Solutions CMS"
        description="Edit the left feature card, feature cards, and showcase products used in the homepage Discover Wellness Solutions section."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm leading-6 text-muted">
            Section title, subtitle, CTA, order, and visibility are controlled in the
            Homepage CMS table above.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchWellnessSolutions()}
              disabled={isWellnessSolutionsLoading || isWellnessSolutionsSaving}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh Wellness Solutions
            </button>
            <button
              type="button"
              onClick={() => void saveWellnessSolutions()}
              disabled={
                isWellnessSolutionsLoading ||
                isWellnessSolutionsSaving ||
                !wellnessSolutions
              }
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isWellnessSolutionsSaving ? "Saving..." : "Save Wellness Solutions"}
            </button>
          </div>
        </div>

        {isWellnessSolutionsLoading ? (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Loading Discover Wellness Solutions CMS...
          </div>
        ) : wellnessSolutions ? (
          <div className="grid gap-6">
            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Left Feature Card
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <InputField
                  label="Badge"
                  value={wellnessSolutions.settings.left_badge}
                  onChange={(value) =>
                    updateWellnessSolutionsSettings("left_badge", value)
                  }
                />
                <InputField
                  label="Heading"
                  value={wellnessSolutions.settings.left_heading}
                  onChange={(value) =>
                    updateWellnessSolutionsSettings("left_heading", value)
                  }
                />
                <TextAreaField
                  label="Description"
                  value={wellnessSolutions.settings.left_description}
                  onChange={(value) =>
                    updateWellnessSolutionsSettings("left_description", value)
                  }
                />
                <InputField
                  label="CTA Label"
                  value={wellnessSolutions.settings.left_cta_label}
                  onChange={(value) =>
                    updateWellnessSolutionsSettings("left_cta_label", value)
                  }
                />
                <InputField
                  label="CTA URL"
                  value={wellnessSolutions.settings.left_cta_url}
                  onChange={(value) =>
                    updateWellnessSolutionsSettings("left_cta_url", value)
                  }
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-extrabold text-text-dark">
                  Feature Cards
                </h3>
                <button
                  type="button"
                  onClick={addWellnessSolutionFeature}
                  className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add Feature
                </button>
              </div>
              <div className="grid gap-4">
                {wellnessSolutions.feature_cards.map((feature, index) => (
                  <div
                    key={`${feature.title}-${index}`}
                    className="grid gap-3 rounded-[20px] border border-border-light bg-cream/40 p-4 lg:grid-cols-[130px_1fr_1fr_120px_130px_110px]"
                  >
                    <SelectField
                      label="Icon"
                      value={feature.icon}
                      onChange={(value) =>
                        updateWellnessSolutionFeature(index, "icon", value)
                      }
                    />
                    <InputField
                      label="Title"
                      value={feature.title}
                      onChange={(value) =>
                        updateWellnessSolutionFeature(index, "title", value)
                      }
                    />
                    <InputField
                      label="Description"
                      value={feature.description}
                      onChange={(value) =>
                        updateWellnessSolutionFeature(index, "description", value)
                      }
                    />
                    <InputField
                      label="Order"
                      type="number"
                      value={String(feature.sort_order)}
                      onChange={(value) =>
                        updateWellnessSolutionFeature(
                          index,
                          "sort_order",
                          Number(value),
                        )
                      }
                    />
                    <ToggleField
                      label="Visible"
                      checked={feature.is_visible}
                      onChange={(value) =>
                        updateWellnessSolutionFeature(index, "is_visible", value)
                      }
                    />
                    <label className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeWellnessSolutionFeature(index)}
                        className="inline-flex h-12 items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 font-heading text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Remove
                      </button>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-extrabold text-text-dark">
                  Showcase Products
                </h3>
                <button
                  type="button"
                  onClick={addWellnessSolutionProduct}
                  className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add Product
                </button>
              </div>
              <div className="grid gap-4">
                {wellnessSolutions.showcase_products.map((product, index) => (
                  <div
                    key={`${product.product_name}-${index}`}
                    className="grid gap-3 rounded-[20px] border border-border-light bg-cream/40 p-4 lg:grid-cols-[1fr_160px_1fr_120px_130px_110px]"
                  >
                    <InputField
                      label="Product Name"
                      value={product.product_name}
                      onChange={(value) =>
                        updateWellnessSolutionProduct(index, "product_name", value)
                      }
                    />
                    <InputField
                      label="Label"
                      value={product.label}
                      onChange={(value) =>
                        updateWellnessSolutionProduct(index, "label", value)
                      }
                    />
                    <InputField
                      label="URL"
                      value={product.url}
                      onChange={(value) =>
                        updateWellnessSolutionProduct(index, "url", value)
                      }
                    />
                    <InputField
                      label="Order"
                      type="number"
                      value={String(product.sort_order)}
                      onChange={(value) =>
                        updateWellnessSolutionProduct(
                          index,
                          "sort_order",
                          Number(value),
                        )
                      }
                    />
                    <ToggleField
                      label="Visible"
                      checked={product.is_visible}
                      onChange={(value) =>
                        updateWellnessSolutionProduct(index, "is_visible", value)
                      }
                    />
                    <label className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeWellnessSolutionProduct(index)}
                        className="inline-flex h-12 items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 font-heading text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Remove
                      </button>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Discover Wellness Solutions CMS could not be loaded.
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Blogs CMS"
        description="Control how many dynamic blog posts appear in the homepage Supplements Blog & Guides section."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm leading-6 text-muted">
            Blog cards continue loading from the existing Blog module. Section title,
            subtitle, CTA, order, and visibility are controlled in the Homepage CMS
            table above.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchHomepageBlogs()}
              disabled={isBlogsLoading || isBlogsSaving}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh Blogs CMS
            </button>
            <button
              type="button"
              onClick={() => void saveHomepageBlogs()}
              disabled={isBlogsLoading || isBlogsSaving || !homepageBlogs}
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isBlogsSaving ? "Saving..." : "Save Blogs CMS"}
            </button>
          </div>
        </div>

        {isBlogsLoading ? (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Loading blogs CMS...
          </div>
        ) : homepageBlogs ? (
          <div className="rounded-[24px] border border-border-light bg-white p-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <InputField
                label="Maximum Blogs To Display"
                type="number"
                value={String(homepageBlogs.settings.max_blogs)}
                onChange={(value) =>
                  updateBlogsSettings("max_blogs", Number(value))
                }
              />
              <label className="grid gap-2">
                <span className="font-heading text-xs font-semibold text-text-dark">
                  Sort Mode
                </span>
                <select
                  value={homepageBlogs.settings.sort_mode}
                  onChange={(event) =>
                    updateBlogsSettings("sort_mode", event.target.value)
                  }
                  className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
                >
                  <option value="latest">Latest</option>
                  <option value="featured">Featured</option>
                  <option value="manual_priority">Manual Priority</option>
                </select>
              </label>
              <ToggleField
                label="Show Featured Badge"
                checked={homepageBlogs.settings.show_featured_badge}
                onChange={(value) =>
                  updateBlogsSettings("show_featured_badge", value)
                }
              />
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Blogs CMS could not be loaded.
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Wellness Expert CMS"
        description="Edit the badge and fallback content used by the homepage expert section."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm leading-6 text-muted">
            Featured expert data still comes from the Experts module. Section title,
            subtitle, CTA, order, and visibility are controlled in the Homepage CMS
            table above.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchWellnessExpert()}
              disabled={isWellnessExpertLoading || isWellnessExpertSaving}
              className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 font-heading text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh Expert CMS
            </button>
            <button
              type="button"
              onClick={() => void saveWellnessExpert()}
              disabled={
                isWellnessExpertLoading || isWellnessExpertSaving || !wellnessExpert
              }
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,57,33,0.16)] transition hover:bg-dark-green disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isWellnessExpertSaving ? "Saving..." : "Save Wellness Expert"}
            </button>
          </div>
        </div>

        {isWellnessExpertLoading ? (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Loading wellness expert CMS...
          </div>
        ) : wellnessExpert ? (
          <div className="grid gap-6">
            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Section Badge
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <InputField
                  label="Badge"
                  value={wellnessExpert.settings.badge_text}
                  onChange={(value) =>
                    updateWellnessExpertSettings("badge_text", value)
                  }
                />
                <SelectField
                  label="Badge Icon"
                  value={wellnessExpert.settings.badge_icon}
                  onChange={(value) =>
                    updateWellnessExpertSettings("badge_icon", value)
                  }
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-border-light bg-white p-5">
              <h3 className="font-heading text-lg font-extrabold text-text-dark">
                Fallback Expert
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <InputField
                  label="Fallback Expert Name"
                  value={wellnessExpert.settings.fallback_name}
                  onChange={(value) =>
                    updateWellnessExpertSettings("fallback_name", value)
                  }
                />
                <InputField
                  label="Fallback Designation"
                  value={wellnessExpert.settings.fallback_designation}
                  onChange={(value) =>
                    updateWellnessExpertSettings("fallback_designation", value)
                  }
                />
                <InputField
                  label="Fallback Image"
                  value={wellnessExpert.settings.fallback_image}
                  onChange={(value) =>
                    updateWellnessExpertSettings("fallback_image", value)
                  }
                />
                <InputField
                  label="Trust Line"
                  value={wellnessExpert.settings.trust_line}
                  onChange={(value) =>
                    updateWellnessExpertSettings("trust_line", value)
                  }
                />
                <TextAreaField
                  label="Fallback Bio"
                  value={wellnessExpert.settings.fallback_bio}
                  onChange={(value) =>
                    updateWellnessExpertSettings("fallback_bio", value)
                  }
                />
                <TextAreaField
                  label="Fallback Secondary Bio"
                  value={wellnessExpert.settings.fallback_secondary_bio}
                  onChange={(value) =>
                    updateWellnessExpertSettings("fallback_secondary_bio", value)
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border-light px-5 py-12 text-center text-muted">
            Wellness Expert CMS could not be loaded.
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-xs font-semibold text-text-dark">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 lg:col-span-2">
      <span className="font-heading text-xs font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="rounded-2xl border border-border-light bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-gold"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-xs font-semibold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-border-light bg-white px-4 text-sm outline-none transition focus:border-gold"
      >
        {CMS_ICON_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-end">
      <span className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border-light bg-white px-4 font-heading text-sm font-semibold text-text-dark">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 accent-primary"
        />
        {label}
      </span>
    </label>
  );
}
