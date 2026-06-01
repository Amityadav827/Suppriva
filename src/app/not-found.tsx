import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { BackToTopButton } from "@/components/ui/BackToTopButton";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative isolate overflow-hidden bg-cream py-[96px] md:py-[128px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_83%_30%,rgba(217,165,32,0.18)_0%,rgba(247,246,242,0)_28%)]"
        />
        <section className="site-container text-center">
          <span className="inline-flex rounded-pill border border-primary/10 bg-white px-4 py-2 font-heading text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(6,57,33,0.08)]">
            404
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-6xl">
            This wellness page could not be found.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
            The page may have moved, or the link may no longer be available.
            Continue browsing Suppriva products, categories, and guides.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-pill bg-primary px-7 font-heading text-sm font-semibold text-white shadow-premium transition duration-300 hover:bg-button-hover hover:shadow-premium-hover"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back Home
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-pill border border-border-light bg-white px-7 font-heading text-sm font-semibold text-primary shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition duration-300 hover:border-gold hover:text-dark-green"
            >
              <Search className="size-4" aria-hidden="true" />
              Search Suppriva
            </Link>
          </div>
        </section>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
