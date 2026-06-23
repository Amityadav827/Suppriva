import {
  BookOpenText,
  BrainCircuit,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export function getExpertiseIcon(tag: string): LucideIcon {
  const normalized = tag.toLowerCase();

  if (
    normalized.includes("integrative") ||
    normalized.includes("healthcare") ||
    normalized.includes("medical")
  ) {
    return HeartPulse;
  }

  if (
    normalized.includes("ayurveda") ||
    normalized.includes("herbal") ||
    normalized.includes("nutrition") ||
    normalized.includes("wellness coaching")
  ) {
    return Leaf;
  }

  if (
    normalized.includes("preventive") ||
    normalized.includes("lifestyle medicine") ||
    normalized.includes("public health")
  ) {
    return ShieldCheck;
  }

  if (normalized.includes("education") || normalized.includes("supplement")) {
    return BookOpenText;
  }

  if (normalized.includes("research")) {
    return BrainCircuit;
  }

  if (normalized.includes("advisory") || normalized.includes("doctor")) {
    return Stethoscope;
  }

  return Sparkles;
}
