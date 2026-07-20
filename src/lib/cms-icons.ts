import {
  Activity,
  Candy,
  CheckCircle2,
  Compass,
  Leaf,
  Moon,
  Scale,
  ShieldPlus,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

const cmsIcons = {
  activity: Activity,
  candy: Candy,
  "check-circle-2": CheckCircle2,
  compass: Compass,
  leaf: Leaf,
  moon: Moon,
  scale: Scale,
  "shield-plus": ShieldPlus,
  stethoscope: Stethoscope,
} satisfies Record<string, LucideIcon>;

export type CmsIconName = keyof typeof cmsIcons;

export const CMS_ICON_OPTIONS: { label: string; value: CmsIconName }[] = [
  { label: "Activity", value: "activity" },
  { label: "Candy", value: "candy" },
  { label: "Check Circle", value: "check-circle-2" },
  { label: "Compass", value: "compass" },
  { label: "Leaf", value: "leaf" },
  { label: "Moon", value: "moon" },
  { label: "Scale", value: "scale" },
  { label: "Shield Plus", value: "shield-plus" },
  { label: "Stethoscope", value: "stethoscope" },
];

export function getCmsIcon(iconName: string | null | undefined) {
  if (iconName && iconName in cmsIcons) {
    return cmsIcons[iconName as CmsIconName];
  }

  return Leaf;
}
