import {
  Activity,
  Battery,
  Brain,
  Candy,
  CheckCircle2,
  Compass,
  Fish,
  FlaskConical,
  Flower2,
  Leaf,
  LeafyGreen,
  Moon,
  Scale,
  Scissors,
  ShieldPlus,
  ShieldCheck,
  Sparkles,
  Sprout,
  Stethoscope,
  Sun,
  SunMedium,
  Zap,
  type LucideIcon,
} from "lucide-react";

const cmsIcons = {
  activity: Activity,
  battery: Battery,
  brain: Brain,
  candy: Candy,
  "check-circle-2": CheckCircle2,
  compass: Compass,
  fish: Fish,
  "flask-conical": FlaskConical,
  "flower-2": Flower2,
  leaf: Leaf,
  "leafy-green": LeafyGreen,
  moon: Moon,
  scale: Scale,
  scissors: Scissors,
  "shield-check": ShieldCheck,
  "shield-plus": ShieldPlus,
  sparkles: Sparkles,
  sprout: Sprout,
  stethoscope: Stethoscope,
  sun: Sun,
  "sun-medium": SunMedium,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type CmsIconName = keyof typeof cmsIcons;

export const CMS_ICON_OPTIONS: { label: string; value: CmsIconName }[] = [
  { label: "Activity", value: "activity" },
  { label: "Battery", value: "battery" },
  { label: "Brain", value: "brain" },
  { label: "Candy", value: "candy" },
  { label: "Check Circle", value: "check-circle-2" },
  { label: "Compass", value: "compass" },
  { label: "Fish", value: "fish" },
  { label: "Flask", value: "flask-conical" },
  { label: "Flower", value: "flower-2" },
  { label: "Leaf", value: "leaf" },
  { label: "Leafy Green", value: "leafy-green" },
  { label: "Moon", value: "moon" },
  { label: "Scale", value: "scale" },
  { label: "Scissors", value: "scissors" },
  { label: "Shield Check", value: "shield-check" },
  { label: "Shield Plus", value: "shield-plus" },
  { label: "Sparkles", value: "sparkles" },
  { label: "Sprout", value: "sprout" },
  { label: "Stethoscope", value: "stethoscope" },
  { label: "Sun", value: "sun" },
  { label: "Sun Medium", value: "sun-medium" },
  { label: "Zap", value: "zap" },
];

export function getCmsIcon(iconName: string | null | undefined) {
  if (iconName && iconName in cmsIcons) {
    return cmsIcons[iconName as CmsIconName];
  }

  return Leaf;
}
