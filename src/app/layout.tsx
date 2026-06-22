import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ExpertChatWidget } from "@/components/product/ExpertChatWidget";
import {
  DEFAULT_OG_IMAGE,
  serializeJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/metadata";
import { buildOrganizationJsonLd } from "@/lib/seo/structured-data";
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
  title: `${SITE_NAME} | Wellness Discovery Platform`,
  description:
    "Explore supplements, ingredients, wellness categories, and expert guidance through Suppriva's search-friendly discovery platform.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} | Wellness Discovery Platform`,
    description:
      "Discover supplements, ingredients, wellness categories, and research content across Suppriva.",
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
    title: `${SITE_NAME} | Wellness Discovery Platform`,
    description:
      "Discover supplements, ingredients, wellness categories, and research content across Suppriva.",
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
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildOrganizationJsonLd()) }}
        />
        {children}
        <ExpertChatWidget />
      </body>
    </html>
  );
}
