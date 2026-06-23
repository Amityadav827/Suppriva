import type { Metadata } from "next";
import { MessageSquareHeart, ShieldCheck, Stethoscope } from "lucide-react";
import { AskExpertForm } from "@/components/experts/AskExpertForm";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PageType } from "@/lib/database/constants";
import { onlyPublished } from "@/lib/live-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/structured-data";
import { CategoryService } from "@/services/category.service";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "ask-expert", {
    title: "Ask An Expert | Suppriva",
    description:
      "Submit a question about ingredients, wellness goals, or supplement education and hear back from Suppriva's wellness experts.",
    canonicalPath: "/ask-expert",
  });
}

export default async function AskExpertPage() {
  const categories = await new CategoryService()
    .getAllCategories()
    .then((items) => onlyPublished(items).map((item) => item.title))
    .catch(() => []);

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="ask-expert"
        schema={[
          buildWebPageJsonLd({
            title: "Ask An Expert",
            description:
              "Submit your ingredient or wellness question to Suppriva's expert guidance team.",
            path: "/ask-expert",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ask An Expert", path: "/ask-expert" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-cream">
        <SectionWrapper tone="white">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <Stethoscope className="size-4 text-gold" aria-hidden="true" />
              Expert Guidance
            </p>
            <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl lg:text-5xl">
              Ask A Wellness Expert
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted">
              Need help understanding an ingredient or wellness topic? Submit your
              question and receive educational guidance from our wellness experts.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <FadeIn className="rounded-[30px] border border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(234,244,236,0.92)_48%,rgba(255,255,255,0.96))] p-7 shadow-[0_26px_70px_rgba(15,23,42,0.08)] md:p-9">
              <div className="space-y-5">
                {[
                  {
                    title: "Ingredient clarity",
                    text: "Get help understanding ingredient roles, daily wellness context, and broader supplement education.",
                    icon: MessageSquareHeart,
                  },
                  {
                    title: "Goal-focused guidance",
                    text: "Ask about wellness goals, category fit, and how to research supplements more confidently.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Educational support",
                    text: "Suppriva experts support educational understanding, not personal diagnosis or treatment advice.",
                    icon: Stethoscope,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-green text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h2 className="font-heading text-lg font-extrabold text-text-dark">
                            {item.title}
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-muted">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <AskExpertForm categories={categories} />
            </FadeIn>
          </div>
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
