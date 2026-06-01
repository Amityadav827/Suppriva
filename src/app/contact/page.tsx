import type { Metadata } from "next";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import { legalPages } from "@/lib/legal-pages";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildContactPageJsonLd,
} from "@/lib/seo/structured-data";

const page = legalPages.contact;

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, page.slug, {
    title: `${page.title} | Suppriva`,
    description: page.summary,
    canonicalPath: page.path,
  });
}

export default function ContactPage() {
  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug={page.slug}
        schema={[
          buildContactPageJsonLd({
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
      <section className="-mt-10 pb-10 md:pb-14">
        <div className="site-container">
          <ContactForm />
        </div>
      </section>
      <section className="pb-16 md:pb-24">
        <div className="site-container">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Email Support",
                text: "support@suppriva.com",
                icon: Mail,
              },
              {
                title: "Editorial Requests",
                text: "Send page URLs and correction details.",
                icon: MessageCircle,
              },
              {
                title: "Privacy Requests",
                text: "Include your email and request type.",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[26px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-soft-green text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 font-heading text-lg font-extrabold text-text-dark">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
