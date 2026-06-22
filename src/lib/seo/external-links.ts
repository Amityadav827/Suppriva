import { SITE_URL } from "@/lib/seo/site-config";

const EXTERNAL_REL = "nofollow sponsored noopener noreferrer";

export function isExternalUrl(href: string | null | undefined) {
  if (!href) {
    return false;
  }

  const value = href.trim();

  if (!value || value.startsWith("/") || value.startsWith("#")) {
    return false;
  }

  if (
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:")
  ) {
    return false;
  }

  try {
    const candidate = new URL(value, SITE_URL);

    if (!["http:", "https:"].includes(candidate.protocol)) {
      return false;
    }

    return candidate.origin !== SITE_URL;
  } catch {
    return false;
  }
}

function mergeRelValues(...values: Array<string | null | undefined>) {
  const tokens = values
    .flatMap((value) => (value ? value.split(/\s+/) : []))
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.length ? [...new Set(tokens)].join(" ") : undefined;
}

export function getExternalLinkAttributes(
  href: string | null | undefined,
  rel?: string,
  target?: string,
) {
  if (!isExternalUrl(href)) {
    return {
      rel,
      target,
    };
  }

  return {
    rel: mergeRelValues(rel, EXTERNAL_REL),
    target: "_blank",
  };
}
