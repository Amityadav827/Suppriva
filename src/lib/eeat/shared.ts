import type { Author, Reviewer } from "@/lib/database/types";

export type ExpertRole = "author" | "reviewer";
export type ExpertProfileRecord = Author | Reviewer;

export function getExpertProfilePath(role: ExpertRole, slug?: string | null) {
  if (!slug) {
    return role === "author" ? "/authors" : "/reviewers";
  }

  return role === "author" ? `/author/${slug}` : `/reviewer/${slug}`;
}

export function getExpertRoleLabel(role: ExpertRole) {
  return role === "author" ? "Written by" : "Reviewed by";
}

export function getExpertSubtitle(profile: ExpertProfileRecord) {
  return [profile.designation, profile.qualification].filter(Boolean).join(" • ");
}

export function getExpertExperienceLabel(profile: ExpertProfileRecord) {
  if (!profile.experience_years || profile.experience_years <= 0) {
    return null;
  }

  return `${profile.experience_years}+ years experience`;
}

