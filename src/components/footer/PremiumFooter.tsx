import Link from "next/link";
import { FooterColumn } from "@/components/footer/FooterColumn";
import { PaymentIcons } from "@/components/footer/PaymentIcons";
import { SocialLinks } from "@/components/footer/SocialLinks";
import {
  footerCategories,
  footerContactBadges,
  footerQuickLinks,
  footerSupportLinks,
} from "@/lib/constants";

export function PremiumFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#041f13,#063921_48%,#0B5D3B)] pt-16 text-white md:pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(217,165,32,0.16)_0%,rgba(217,165,32,0)_28%),radial-gradient(circle_at_84%_74%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_30%)]"
      />

      <div className="site-container">
        <div className="grid gap-9 rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur md:p-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.9fr_0.9fr] lg:gap-8">
          <div>
            <Link href="/" aria-label="Suppriva home" className="inline-block">
              <span className="block font-heading text-3xl font-extrabold tracking-[0.14em] text-white">
                SUPPRIVA
              </span>
              <span className="mt-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/58">
                Your Supplement Destination
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/68">
              Premium supplement discovery for wellness shoppers who want clean
              recommendations, health guides, and trusted affiliate picks.
            </p>
            <SocialLinks />
          </div>

          <FooterColumn title="Quick Links" links={footerQuickLinks} />
          <FooterColumn title="Categories" links={footerCategories} />
          <FooterColumn title="Support" links={footerSupportLinks} />
          <PaymentIcons />
        </div>

        <div className="grid gap-4 border-t border-white/10 py-7 text-sm text-white/58 md:grid-cols-[1fr_auto] md:items-center">
          <p>© 2026 Suppriva. All Rights Reserved.</p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {footerContactBadges.map((badge) => {
              const Icon = badge.icon;

              return (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/[0.05] px-3 py-1.5"
                >
                  <Icon className="size-3.5 text-gold" aria-hidden="true" />
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>

        <p className="border-t border-white/10 py-5 text-xs leading-6 text-white/44">
          Disclaimer: Suppriva is an affiliate wellness platform. Information on
          this site is for educational purposes only and is not medical advice.
          Always consult a qualified healthcare professional before starting any
          supplement routine.
        </p>
      </div>
    </footer>
  );
}
