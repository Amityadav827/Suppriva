import {
  Activity,
  Apple,
  Award,
  BadgeCheck,
  BatteryCharging,
  BicepsFlexed,
  Brain,
  Candy,
  CircleDot,
  Compass,
  Citrus,
  CreditCard,
  Dumbbell,
  Flower2,
  Heart,
  FlaskConical,
  HeartPulse,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Moon,
  Pill,
  ShieldPlus,
  ShieldCheck,
  Sparkles,
  Scale,
  Sprout,
  Stethoscope,
} from "lucide-react";
import { legalFooterLinks } from "@/lib/legal-pages";

export const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Categories", href: "/categories" },
  { label: "Blogs", href: "/blogs" },
  { label: "Search", href: "/search" },
];

export const trustItems = [
  {
    label: "Premium Quality Ingredients",
    icon: Sparkles,
  },
  {
    label: "Scientifically Backed",
    icon: FlaskConical,
  },
  {
    label: "Trusted by Thousands",
    icon: HeartPulse,
  },
  {
    label: "Made in USA GMP Certified",
    icon: BadgeCheck,
  },
];

export const productHighlights = [
  {
    label: "Third-party tested",
    icon: ShieldCheck,
  },
  {
    label: "Affiliate picks",
    icon: Award,
  },
];

export const healthNeeds = [
  { label: "Weight Loss", icon: Activity },
  { label: "Blood Sugar", icon: Candy },
  { label: "Heart Health", icon: Heart },
  { label: "Joint Support", icon: Stethoscope },
  { label: "Brain & Memory", icon: Brain },
  { label: "Gut Health", icon: Leaf },
  { label: "Immune Support", icon: ShieldPlus },
  { label: "Sleep Support", icon: Moon },
  { label: "Men's Health", icon: Dumbbell },
  { label: "Women's Health", icon: Flower2 },
  { label: "Energy & Stamina", icon: BatteryCharging },
  { label: "Skin Health", icon: Sprout },
];

export const popularProducts = [
  {
    name: "Prostadine",
    subtitle: "Prostate wellness support",
    category: "Men's Health",
    rating: "4.8",
    glow: "bg-primary/[0.12]",
    accent: "from-primary/[0.16] to-gold/[0.16]",
  },
  {
    name: "GlucoTrust",
    subtitle: "Blood sugar balance formula",
    category: "Blood Sugar",
    rating: "4.9",
    glow: "bg-gold/[0.16]",
    accent: "from-gold/[0.18] to-soft-green",
  },
  {
    name: "Java Burn",
    subtitle: "Metabolism and energy blend",
    category: "Weight Loss",
    rating: "4.7",
    glow: "bg-primary/10",
    accent: "from-soft-green to-gold/[0.14]",
  },
  {
    name: "Quietum Plus",
    subtitle: "Ear and daily clarity support",
    category: "Wellness",
    rating: "4.8",
    glow: "bg-gold/[0.14]",
    accent: "from-gold/[0.14] to-white",
  },
  {
    name: "Neuro Thrive",
    subtitle: "Brain focus and memory support",
    category: "Brain & Memory",
    rating: "4.9",
    glow: "bg-primary/[0.12]",
    accent: "from-primary/[0.14] to-soft-green",
  },
];

export const supplementCategories = [
  { label: "Amino Acids", icon: CircleDot },
  { label: "Antioxidants", icon: Sparkles },
  { label: "Brain Support", icon: Brain },
  { label: "Collagen", icon: Sprout },
  { label: "Detox", icon: Leaf },
  { label: "Digestive Health", icon: Apple },
  { label: "Energy Boosters", icon: BatteryCharging },
  { label: "Herbal Supplements", icon: Leaf },
  { label: "Immune Support", icon: ShieldPlus },
  { label: "Joint Care", icon: Stethoscope },
  { label: "Men's Health", icon: Dumbbell },
  { label: "Women's Health", icon: Flower2 },
  { label: "Multivitamins", icon: Pill },
  { label: "Nootropics", icon: Brain },
  { label: "Omega 3", icon: Heart },
  { label: "Probiotics", icon: Citrus },
  { label: "Protein", icon: BicepsFlexed },
  { label: "Sleep Support", icon: Moon },
  { label: "Testosterone Support", icon: Activity },
  { label: "Vitamins", icon: Pill },
  { label: "Weight Loss", icon: Activity },
  { label: "Workout Recovery", icon: FlaskConical },
];

export const blogPosts = [
  {
    title: "10 Best Supplements for Weight Loss",
    description:
      "A clean guide to popular ingredients, smart selection criteria, and supplement habits that support healthy goals.",
    category: "Weight Loss",
    readingTime: "7 min read",
    image: "/assets/blog-weight-loss.webp",
  },
  {
    title: "Benefits of Ashwagandha for Daily Wellness",
    description:
      "Explore why this adaptogenic herb is a staple in calm, focus, and everyday wellness routines.",
    category: "Herbal Guide",
    readingTime: "6 min read",
    image: "/assets/blog-ashwagandha.webp",
  },
  {
    title: "How to Improve Gut Health Naturally",
    description:
      "Simple nutrition, probiotic, and lifestyle principles for building a more balanced digestive routine.",
    category: "Gut Health",
    readingTime: "8 min read",
    image: "/assets/blog-gut-health.webp",
  },
  {
    title: "Best Supplements for Better Sleep & Recovery",
    description:
      "A premium overview of nighttime nutrients and recovery-focused habits for deeper restoration.",
    category: "Sleep Support",
    readingTime: "5 min read",
    image: "/assets/blog-sleep-recovery.webp",
  },
];

export const supplementShowcaseProducts = [
  {
    name: "Omega Pure",
    category: "Heart Health",
    rating: "4.9",
    accent: "from-primary/[0.14] to-gold/[0.16]",
    imageScale: "scale-[1.08]",
  },
  {
    name: "Sleep Restore",
    category: "Sleep Support",
    rating: "4.8",
    accent: "from-soft-green to-primary/[0.10]",
    imageScale: "scale-[1.02]",
  },
  {
    name: "Daily Multi",
    category: "Vitamins",
    rating: "4.9",
    accent: "from-gold/[0.16] to-white",
    imageScale: "scale-[1.12]",
  },
  {
    name: "Gut Balance",
    category: "Probiotics",
    rating: "4.7",
    accent: "from-soft-green to-gold/[0.14]",
    imageScale: "scale-[1.04]",
  },
  {
    name: "Neuro Focus",
    category: "Brain Support",
    rating: "4.8",
    accent: "from-primary/[0.12] to-soft-green",
    imageScale: "scale-[1.1]",
  },
  {
    name: "Joint Flex",
    category: "Joint Care",
    rating: "4.8",
    accent: "from-gold/[0.14] to-primary/[0.10]",
    imageScale: "scale-[1.05]",
  },
];

export const buySellBullets = [
  "Premium Quality Supplements",
  "Verified Ingredients",
  "Trusted Wellness Brands",
  "Expert Recommended Products",
];

export const whyChooseItems = [
  {
    title: "Ingredient Library",
    description:
      "Explore vitamins, herbs, minerals, probiotics, and functional ingredients.",
    icon: Leaf,
  },
  {
    title: "Wellness Solutions",
    description:
      "Find supplements organized by your health goals and lifestyle needs.",
    icon: Compass,
  },
  {
    title: "Smart Comparisons",
    description:
      "Compare formulas, ingredients, and features to make informed decisions.",
    icon: Scale,
  },
  {
    title: "Expert Guidance",
    description:
      "Need help choosing? Submit your question and get personalized support.",
    icon: Stethoscope,
  },
];

export const trustBadges = [
  {
    title: "GMP Certified",
    subtitle: "Quality-first manufacturing standards",
    icon: BadgeCheck,
  },
  {
    title: "Quality Reviewed",
    subtitle: "Trusted wellness compliance focus",
    icon: ShieldCheck,
  },
  {
    title: "100% Natural",
    subtitle: "Clean, health-conscious selections",
    icon: Leaf,
  },
  {
    title: "Made in USA",
    subtitle: "Premium domestic brand partners",
    icon: MapPin,
  },
];

export const newsletterBenefits = [
  "Weekly wellness tips",
  "Exclusive supplement offers",
  "New guide alerts",
  "Curated product insights",
];

export const footerQuickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Blogs", href: "/blogs" },
  { label: "Search", href: "/search" },
];

export const footerCategories = [
  { label: "Weight Loss", href: "/category/weight-loss" },
  { label: "Hair Health", href: "/category/hair-health" },
  { label: "Men's Health", href: "/category/mens-health" },
  { label: "Women's Health", href: "/category/womens-health" },
  { label: "General Wellness", href: "/category/general-wellness" },
];

export const footerSupportLinks = [
  ...legalFooterLinks,
];

export const footerContactBadges = [
  { label: "Secure checkout", icon: LockKeyhole },
  { label: "Wellness updates", icon: Mail },
  { label: "Flexible payments", icon: CreditCard },
];
