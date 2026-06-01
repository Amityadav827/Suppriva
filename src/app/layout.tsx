import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo/metadata";
import "@/styles/tokens.css";
import "swiper/css";
import "swiper/css/navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Suppriva | Premium Supplement Destination",
  description:
    "Handpicked supplements, vitamins, and wellness products for premium health-focused affiliate recommendations.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Suppriva | Premium Supplement Destination",
    description:
      "Discover handpicked supplements for health, performance, and daily wellness.",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Suppriva premium supplements",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suppriva | Premium Supplement Destination",
    description:
      "Discover handpicked supplements for health, performance, and daily wellness.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
