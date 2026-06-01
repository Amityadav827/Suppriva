import type { Metadata } from "next";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import { legalPages } from "@/lib/legal-pages";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/structured-data";

const page = legalPages.medicalDisclaimer;

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, page.slug, {
    title: `${page.title} | Suppriva`,
    description: page.summary,
    canonicalPath: page.path,
  });
}

export default function MedicalDisclaimerPage() {
  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug={page.slug}
        schema={[
          buildWebPageJsonLd({
            title: page.title,
            description: page.summary,
            path: page.path,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ]),
        ]}
      />
      <Navbar />
      <LegalPageTemplate page={page} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
