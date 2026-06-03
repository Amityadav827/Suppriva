import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { IngredientCard } from "@/components/ingredients/IngredientCard";
import { IngredientsDirectoryClient } from "@/components/ingredients/IngredientsDirectoryClient";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/structured-data";
import { IngredientService } from "@/services/ingredient.service";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "ingredients", {
    title: "Ingredients Library | Suppriva",
    description:
      "Research supplement ingredients, benefits, dosage notes, side effects, and related Suppriva products.",
    canonicalPath: "/ingredients",
  });
}

export default async function IngredientsPage() {
  const ingredientService = new IngredientService();
  const [ingredients, featuredIngredients] = await Promise.all([
    ingredientService.getAllIngredients(),
    ingredientService.getFeaturedIngredients(),
  ]);

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="ingredients"
        schema={[
          buildCollectionPageJsonLd({
            title: "Ingredients Library",
            description:
              "Research supplement ingredients, benefits, dosage notes, side effects, and related Suppriva products.",
            path: "/ingredients",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ingredients", path: "/ingredients" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-cream py-[76px] md:py-[104px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_86%_34%,rgba(217,165,32,0.15)_0%,rgba(247,246,242,0)_28%)]"
          />
          <div className="site-container max-w-4xl text-center">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Suppriva Research Library
            </p>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-6xl">
              Supplement Ingredients Library
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
              Explore benefits, side effects, dosage notes, science summaries, and products connected to each ingredient.
            </p>
          </div>
        </section>

        {featuredIngredients.length ? (
          <SectionWrapper id="featured-ingredients" tone="white">
            <SectionTitle
              title="Featured Ingredients"
              subtitle="Priority ingredient profiles selected for supplement shoppers and editorial research."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredIngredients.slice(0, 6).map((ingredient) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        <SectionWrapper id="ingredient-directory">
          <SectionTitle
            title="Ingredient Directory"
            subtitle="Search and browse live ingredient records from Suppriva."
          />
          <IngredientsDirectoryClient ingredients={ingredients} />
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
