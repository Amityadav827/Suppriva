export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalPage = {
  title: string;
  slug: string;
  path: string;
  eyebrow: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
};

export const legalPages = {
  privacyPolicy: {
    title: "Privacy Policy",
    slug: "privacy-policy",
    path: "/privacy-policy",
    eyebrow: "Privacy",
    updated: "May 31, 2026",
    summary:
      "Learn how Suppriva handles basic visitor information, newsletter subscriptions, affiliate tracking data, and privacy choices.",
    sections: [
      {
        title: "Information We Collect",
        body: [
          "Suppriva may collect information you voluntarily provide, such as your email address when subscribing to wellness updates or contacting us.",
          "We may also collect basic technical information such as device type, browser data, referral pages, and affiliate click activity to improve site performance and measure content usefulness.",
        ],
      },
      {
        title: "How We Use Information",
        body: [
          "We use information to operate the website, deliver newsletter updates, improve content quality, analyze affiliate performance, and respond to support requests.",
          "We do not sell personal information. Third-party services may process limited data when helping us host, analyze, secure, or operate the website.",
        ],
      },
      {
        title: "Cookies And Analytics",
        body: [
          "Suppriva may use cookies or similar technologies to understand how visitors interact with pages, products, and affiliate links.",
          "You can adjust browser settings to limit cookies, though some site features may not work as expected.",
        ],
      },
      {
        title: "Your Choices",
        body: [
          "You may unsubscribe from marketing emails at any time using the unsubscribe process provided by Suppriva.",
          "For privacy questions, contact us through the Contact page and include enough detail for us to review the request.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    path: "/terms-and-conditions",
    eyebrow: "Terms",
    updated: "May 31, 2026",
    summary:
      "These terms explain the rules for using Suppriva, including informational content, affiliate links, and responsible website use.",
    sections: [
      {
        title: "Use Of The Website",
        body: [
          "By using Suppriva, you agree to use the website lawfully and responsibly. You may not misuse, scrape, disrupt, or attempt unauthorized access to any part of the platform.",
          "Suppriva may update content, links, features, or these terms from time to time without prior notice.",
        ],
      },
      {
        title: "Content Accuracy",
        body: [
          "We work to keep supplement guides and product information helpful, but content may change and should not be treated as professional medical, legal, or financial advice.",
          "Always review official product pages, labels, and manufacturer guidance before making a purchase decision.",
        ],
      },
      {
        title: "Affiliate Links",
        body: [
          "Some links on Suppriva are affiliate links. If you purchase through those links, Suppriva may earn a commission at no additional cost to you.",
          "Affiliate relationships do not guarantee product suitability, safety, or results for every individual.",
        ],
      },
      {
        title: "Limitation Of Liability",
        body: [
          "Suppriva is provided on an as-is basis. We are not responsible for losses or damages resulting from use of the website, third-party products, or external websites.",
        ],
      },
    ],
  },
  affiliateDisclosure: {
    title: "Affiliate Disclosure",
    slug: "affiliate-disclosure",
    path: "/affiliate-disclosure",
    eyebrow: "Affiliate Transparency",
    updated: "May 31, 2026",
    summary:
      "Suppriva may earn commissions from product links. This page explains how affiliate relationships work and how we preserve editorial clarity.",
    sections: [
      {
        title: "Affiliate Relationship",
        body: [
          "Suppriva is an affiliate wellness platform. Some product buttons, comparison links, and official website links may be affiliate links.",
          "When you click an affiliate link and make a purchase, we may receive a commission from the merchant without increasing your price.",
        ],
      },
      {
        title: "Editorial Approach",
        body: [
          "Our goal is to organize supplement information clearly so visitors can compare products, ingredients, categories, and wellness goals more easily.",
          "Affiliate compensation may influence which products are displayed, but we aim to keep content useful, transparent, and clearly labeled.",
        ],
      },
      {
        title: "Your Responsibility",
        body: [
          "Before purchasing any supplement, review the official product website, ingredient label, refund policy, and safety guidance.",
          "Consult a qualified healthcare professional if you have medical conditions, take medication, are pregnant, or are unsure whether a product is appropriate.",
        ],
      },
    ],
  },
  medicalDisclaimer: {
    title: "Medical Disclaimer",
    slug: "medical-disclaimer",
    path: "/medical-disclaimer",
    eyebrow: "Health Notice",
    updated: "May 31, 2026",
    summary:
      "Suppriva provides educational supplement information only. It is not a substitute for professional medical advice, diagnosis, or treatment.",
    sections: [
      {
        title: "Educational Information Only",
        body: [
          "Content on Suppriva is for general educational and informational purposes. It should not be used as medical advice or as a replacement for professional care.",
          "Supplement results can vary widely based on health status, lifestyle, age, medication use, and individual biology.",
        ],
      },
      {
        title: "Consult A Professional",
        body: [
          "Talk with a licensed healthcare professional before starting, stopping, or combining supplements, especially if you have a health condition or take medication.",
          "Seek immediate medical attention for urgent symptoms or suspected adverse reactions.",
        ],
      },
      {
        title: "Product Claims",
        body: [
          "Product statements may come from manufacturers or third-party sources and may not be evaluated by regulatory authorities.",
          "Suppriva does not guarantee that any supplement will diagnose, treat, cure, or prevent disease.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact Suppriva",
    slug: "contact",
    path: "/contact",
    eyebrow: "Contact",
    updated: "May 31, 2026",
    summary:
      "Reach the Suppriva team for editorial, affiliate, privacy, or general website questions.",
    sections: [
      {
        title: "General Support",
        body: [
          "For website questions, content corrections, affiliate inquiries, or privacy requests, email us at support@suppriva.com.",
          "Please include the page URL and a clear description of your request so our team can review it efficiently.",
        ],
      },
      {
        title: "Affiliate And Brand Inquiries",
        body: [
          "Brands and affiliate partners can contact Suppriva for product listing, content collaboration, or partnership review requests.",
          "We review partnership requests carefully to keep the platform aligned with wellness-focused, transparent product discovery.",
        ],
      },
      {
        title: "Medical Questions",
        body: [
          "Suppriva cannot answer personal medical questions. For individual health concerns, please contact a qualified healthcare professional.",
        ],
      },
    ],
  },
} satisfies Record<string, LegalPage>;

export const legalFooterLinks = [
  { label: "Contact", href: legalPages.contact.path },
  { label: "Privacy Policy", href: legalPages.privacyPolicy.path },
  { label: "Terms & Conditions", href: legalPages.terms.path },
  { label: "Affiliate Disclosure", href: legalPages.affiliateDisclosure.path },
  { label: "Medical Disclaimer", href: legalPages.medicalDisclaimer.path },
];
