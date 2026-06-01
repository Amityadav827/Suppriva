import Link from "next/link";

type FooterColumnProps = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-white">
        {title}
      </h3>
      <ul className="mt-5 grid gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/68 transition duration-300 hover:text-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
