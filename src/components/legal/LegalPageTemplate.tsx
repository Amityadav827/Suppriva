import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import type { LegalPage } from "@/lib/legal-pages";

export function LegalPageTemplate({ page }: { page: LegalPage }) {
  return (
    <main className="bg-cream">
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#F7F6F2,#FFFFFF_55%,#EAF4EC)] pb-14 pt-12 md:pb-20 md:pt-16">
        <div
          aria-hidden="true"
          className="absolute right-[-120px] top-16 -z-10 h-72 w-72 rounded-full bg-gold/18 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="absolute left-[-100px] top-32 -z-10 h-72 w-72 rounded-full bg-primary/12 blur-[90px]"
        />

        <div className="site-container">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/15 bg-white px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {page.eyebrow}
            </span>
            <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-6xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted md:text-lg">
              {page.summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2">
                <Sparkles className="size-4 text-gold" aria-hidden="true" />
                Updated {page.updated}
              </span>
              <span className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2">
                <Mail className="size-4 text-primary" aria-hidden="true" />
                support@suppriva.com
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="site-container">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="h-fit rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] lg:sticky lg:top-28">
              <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
                On This Page
              </p>
              <nav className="mt-4 grid gap-2" aria-label={`${page.title} sections`}>
                {page.sections.map((section) => (
                  <a
                    key={section.title}
                    href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="rounded-2xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-soft-green hover:text-primary"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_24px_80px_rgba(6,57,33,0.09)] md:p-9">
              <div className="grid gap-9">
                {page.sections.map((section) => (
                  <section
                    key={section.title}
                    id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                    className="scroll-mt-28 border-b border-border-light pb-8 last:border-b-0 last:pb-0"
                  >
                    <h2 className="font-heading text-2xl font-extrabold text-text-dark">
                      {section.title}
                    </h2>
                    <div className="mt-4 grid gap-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-7 text-muted md:text-base md:leading-8">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
