"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { CMS_ICON_OPTIONS } from "@/lib/cms-icons";
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
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

type HomepageSectionsResponse = {
  sections?: HomepageSectionConfig[];
  error?: string;
};

type HomepageHeroResponse = {
  hero?: HomepageHeroCms;
  error?: string;
};

type HomepageIngredientsDiscoveryResponse = {
  ingredientsDiscovery?: HomepageIngredientsDiscoveryCms;
  error?: string;
};

function sortSections(sections: HomepageSectionConfig[]) {
  return [...sections].sort((a, b) => a.sort_order - b.sort_order);
}

export function DashboardHomepageClient() {
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [hero, setHero] = useState<HomepageHeroCms | null>(null);
  const [ingredientsDiscovery, setIngredientsDiscovery] =
    useState<HomepageIngredientsDiscoveryCms | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [isIngredientsLoading, setIsIngredientsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [isIngredientsSaving, setIsIngredientsSaving] = useState(false);
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

  useEffect(() => {
    void fetchSections();
    void fetchHero();
    void fetchIngredientsDiscovery();
  }, [fetchHero, fetchIngredientsDiscovery, fetchSections]);

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
