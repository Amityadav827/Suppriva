import { forwardRef, type AnchorHTMLAttributes } from "react";
import { getExternalLinkAttributes } from "@/lib/seo/external-links";

type AffiliateLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const AffiliateLink = forwardRef<HTMLAnchorElement, AffiliateLinkProps>(
  ({ href, rel, target, ...props }, ref) => {
    const linkAttributes = getExternalLinkAttributes(href, rel, target);

    return (
      <a
        {...props}
        ref={ref}
        href={href}
        rel={linkAttributes.rel}
        target={linkAttributes.target}
      />
    );
  },
);

AffiliateLink.displayName = "AffiliateLink";

