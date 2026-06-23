import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  UserPen,
} from "lucide-react";
import type { ExpertAttribution } from "@/lib/database/types";
import {
  getExpertExperienceLabel,
  getExpertProfilePath,
  getExpertRoleLabel,
  getExpertSubtitle,
  type ExpertProfileRecord,
  type ExpertRole,
} from "@/lib/eeat/shared";

type AuthorReviewerCardProps = {
  attribution: ExpertAttribution;
  heading?: string;
  description?: string;
  className?: string;
};

function formatLastUpdated(value?: string | null) {
  if (!value) {
    return "Recently updated";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function ExpertProfileCard({
  role,
  profile,
}: {
  role: ExpertRole;
  profile: ExpertProfileRecord;
}) {
  const Icon = role === "author" ? UserPen : Stethoscope;
  const subtitle = getExpertSubtitle(profile);
  const experience = getExpertExperienceLabel(profile);
  const profilePath = getExpertProfilePath(role, profile.slug);

  return (
    <div className="rounded-[28px] border border-border-light bg-soft-green/35 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <p className="inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <Icon className="size-3.5 text-gold" aria-hidden="true" />
        {getExpertRoleLabel(role)}
      </p>

      <div className="mt-4 flex items-start gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/20 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          {profile.photo_url ? (
            <Image
              src={profile.photo_url}
              alt={profile.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <Icon className="size-7 text-primary" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={profilePath}
            className="inline-flex items-center gap-2 font-heading text-xl font-extrabold text-text-dark transition hover:text-primary"
          >
            <span className="truncate">{profile.name}</span>
            <ExternalLink className="size-4 shrink-0 text-gold" aria-hidden="true" />
          </Link>

          {subtitle ? (
            <p className="mt-1 text-sm font-semibold text-primary">{subtitle}</p>
          ) : null}

          {experience ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary/75">
              {experience}
            </p>
          ) : null}

          {profile.bio ? (
            <p className="mt-3 text-sm leading-6 text-muted">{profile.bio}</p>
          ) : null}

          {profile.linkedin_url || profile.website_url ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-3 py-2 text-xs font-semibold text-text-dark transition hover:border-gold/60 hover:text-primary"
                >
                  LinkedIn
                  <ExternalLink className="size-3.5 text-gold" aria-hidden="true" />
                </a>
              ) : null}
              {profile.website_url ? (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-3 py-2 text-xs font-semibold text-text-dark transition hover:border-gold/60 hover:text-primary"
                >
                  Website
                  <ExternalLink className="size-3.5 text-gold" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AuthorReviewerCard({
  attribution,
  heading = "Editorial & Expert Review",
  description = "This page includes clear authorship and review oversight to support more informed wellness decisions.",
  className = "",
}: AuthorReviewerCardProps) {
  return (
    <section
      className={`rounded-[32px] border border-border-light bg-white/94 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8 ${className}`.trim()}
    >
      <div className="flex flex-col gap-4 border-b border-border-light pb-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <BadgeCheck className="size-3.5 text-gold" aria-hidden="true" />
            Trusted content signals
          </p>
          <h2 className="mt-3 font-heading text-2xl font-extrabold text-text-dark md:text-[2rem]">
            {heading}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted md:text-base">{description}</p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-pill border border-border-light bg-soft-green/40 px-4 py-2 text-sm font-semibold text-text-dark">
          <CalendarDays className="size-4 text-gold" aria-hidden="true" />
          Last updated {formatLastUpdated(attribution.lastUpdated)}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ExpertProfileCard role="author" profile={attribution.author} />
        <ExpertProfileCard role="reviewer" profile={attribution.reviewer} />
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-pill bg-primary/8 px-4 py-2 text-sm text-primary">
        <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
        Suppriva combines ingredient research, expert review, and product context before publishing.
      </div>
    </section>
  );
}

