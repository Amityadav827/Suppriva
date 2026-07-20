type Timestamp = string;

export type HomepageNewsletterSettings = {
  id?: string;
  badge_text: string;
  form_badge_text: string;
  form_heading: string;
  form_description: string;
  email_label: string;
  email_placeholder: string;
  button_label: string;
  loading_text: string;
  privacy_text: string;
  no_spam_text: string;
  success_message: string;
  error_message: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageNewsletterTrustChip = {
  id?: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageNewsletterCms = {
  settings: HomepageNewsletterSettings;
  trust_chips: HomepageNewsletterTrustChip[];
};

export const DEFAULT_HOMEPAGE_NEWSLETTER: HomepageNewsletterCms = {
  settings: {
    badge_text: "Premium Wellness Insider",
    form_badge_text: "Join the list",
    form_heading: "Get smarter supplement picks in your inbox.",
    form_description:
      "Curated guides, premium offers, and wellness insights. Built for clarity, not inbox clutter.",
    email_label: "Email address",
    email_placeholder: "Enter your email",
    button_label: "Subscribe",
    loading_text: "Subscribing...",
    privacy_text: "Privacy protected",
    no_spam_text: "No spam, unsubscribe anytime",
    success_message: "You are subscribed. Welcome to Suppriva wellness insights.",
    error_message: "Unable to subscribe right now.",
  },
  trust_chips: [
    {
      label: "Trusted by 10,000+ wellness readers",
      sort_order: 0,
      is_visible: true,
    },
    {
      label: "Weekly expert supplement insights",
      sort_order: 1,
      is_visible: true,
    },
  ],
};

export function mergeHomepageNewsletterCms(
  input: Partial<HomepageNewsletterCms> | null | undefined,
) {
  const settings = input?.settings;
  const trustChips = input?.trust_chips?.length
    ? input.trust_chips
    : DEFAULT_HOMEPAGE_NEWSLETTER.trust_chips;

  return {
    settings: {
      ...DEFAULT_HOMEPAGE_NEWSLETTER.settings,
      ...settings,
      badge_text:
        settings?.badge_text?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.badge_text,
      form_badge_text:
        settings?.form_badge_text?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.form_badge_text,
      form_heading:
        settings?.form_heading?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.form_heading,
      form_description:
        settings?.form_description?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.form_description,
      email_label:
        settings?.email_label?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.email_label,
      email_placeholder:
        settings?.email_placeholder?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.email_placeholder,
      button_label:
        settings?.button_label?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.button_label,
      loading_text:
        settings?.loading_text?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.loading_text,
      privacy_text:
        settings?.privacy_text?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.privacy_text,
      no_spam_text:
        settings?.no_spam_text?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.no_spam_text,
      success_message:
        settings?.success_message?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.success_message,
      error_message:
        settings?.error_message?.trim() ||
        DEFAULT_HOMEPAGE_NEWSLETTER.settings.error_message,
    },
    trust_chips: [...trustChips].sort((a, b) => a.sort_order - b.sort_order),
  };
}
