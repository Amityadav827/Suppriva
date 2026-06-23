import Image from "next/image";
import Link from "next/link";
import {
  BookOpenText,
  BriefcaseMedical,
  ExternalLink,
  FlaskConical,
  Layers3,
  Linkedin,
} from "lucide-react";
import { BlogCard, type BlogPostCard } from "@/components/blog/BlogCard";
import { IngredientCard } from "@/components/ingredients/IngredientCard";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import type { Author, Ingredient, Reviewer } from "@/lib/database/types";
import {
  getExpertExperienceLabel,
  getExpertRoleLabel,
  getExpertSubtitle,
  type ExpertRole,
} from "@/lib/eeat/shared";

type ExpertProfile = Author | Reviewer;

type ExpertProfileTemplateProps = {
  role: ExpertRole;
  profile: ExpertProfile;
  products: ProductCardData[];
  ingredients: Ingredient[];
  blogs: BlogPostCard[];
  counts: {
    products: number;
    ingredients: number;
    blogs: number;
  };
};

function sectionTitle(role: ExpertRole) {
  return role === "author" ? "Meet The Author" : "Meet The Reviewer";
}

export function ExpertProfileTemplate({
  role,
  profile,
  products,
  ingredients,
  blogs,
  counts,
}: ExpertProfileTemplateProps) {
  const subtitle = getExpertSubtitle(profile);
  const experience = getExpertExperienceLabel(profile);
  const roleLabel = getExpertRoleLabel(role);

  return (
    <main className="bg-cream">
      <section className="relative isolate overflow-hidden pb-14 pt-8 md:pb-20 lg:pb-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_84%_24%,rgba(217,165,32,0.16)_0%,rgba(247,246,242,0)_26%)]"
        />
        <div className="site-container">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/" className="transition hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="capitalize">{role}</span>
            <span>/</span>
            <span className="font-heading font-semibold text-text-dark">{profile.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            <div className="rounded-[32px] border border-border-light bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] md:p-6">
              <div className="relative mx-auto size-36 overflow-hidden rounded-full border border-gold/20 bg-soft-green shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                {profile.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.name}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary">
                    <BriefcaseMedical className="size-14" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <Layers3 className="size-3.5 text-gold" aria-hidden="true" />
                  {roleLabel}
                </p>
                <h1 className="mt-3 font-heading text-3xl font-extrabold text-text-dark">
                  {profile.name}
                </h1>
                {subtitle ? (
                  <p className="mt-2 text-base font-semibold text-primary">{subtitle}</p>
                ) : null}
                {experience ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary/75">
                    {experience}
                  </p>
                ) : null}
              </div>

              {profile.bio ? (
                <p className="mt-5 text-sm leading-7 text-muted">{profile.bio}</p>
              ) : null}

              {profile.linkedin_url || profile.website_url ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {profile.linkedin_url ? (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 text-sm font-semibold text-text-dark transition hover:border-gold/60 hover:text-primary"
                    >
                      <Linkedin className="size-4 text-gold" aria-hidden="true" />
                      LinkedIn
                    </a>
                  ) : null}
                  {profile.website_url ? (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 text-sm font-semibold text-text-dark transition hover:border-gold/60 hover:text-primary"
                    >
                      <ExternalLink className="size-4 text-gold" aria-hidden="true" />
                      Website
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
                <p className="inline-flex items-center gap-2 rounded-pill bg-primary/8 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <BookOpenText className="size-3.5 text-gold" aria-hidden="true" />
                  {sectionTitle(role)}
                </p>
                <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-5xl">
                  {profile.name}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
                  Explore the products, ingredients, and wellness articles connected to this Suppriva expert profile.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <StatCard label="Products" value={counts.products} />
                  <StatCard label="Ingredients" value={counts.ingredients} />
                  <StatCard label="Blogs" value={counts.blogs} />
                </div>
              </div>

              {products.length ? (
                <section>
                  <SectionHeader
                    title="Products"
                    description="Published product pages assigned to this profile."
                  />
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard key={`${product.href || product.slug}-${product.name}`} product={product} />
                    ))}
                  </div>
                </section>
              ) : null}

              {ingredients.length ? (
                <section>
                  <SectionHeader
                    title="Ingredients"
                    description="Ingredient research pages assigned to this profile."
                  />
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {ingredients.map((ingredient) => (
                      <IngredientCard key={ingredient.id} ingredient={ingredient} />
                    ))}
                  </div>
                </section>
              ) : null}

              {blogs.length ? (
                <section>
                  <SectionHeader
                    title="Blogs"
                    description="Editorial wellness guides connected to this profile."
                  />
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {blogs.map((blog) => (
                      <BlogCard key={`${blog.slug || blog.title}-${blog.title}`} post={blog} />
                    ))}
                  </div>
                </section>
              ) : null}

              {!products.length && !ingredients.length && !blogs.length ? (
                <div className="rounded-[28px] border border-border-light bg-white p-8 text-center text-muted shadow-[0_18px_52px_rgba(15,23,42,0.05)]">
                  <FlaskConical className="mx-auto size-10 text-primary" aria-hidden="true" />
                  <p className="mt-4 font-heading text-lg font-bold text-text-dark">
                    No published content yet
                  </p>
                  <p className="mt-2 text-sm leading-7">
                    This profile is ready for future product, ingredient, and blog assignments from the Suppriva dashboard.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-border-light bg-soft-green/35 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/75">{label}</p>
      <p className="mt-3 font-heading text-3xl font-extrabold text-text-dark">{value}</p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-heading text-3xl font-extrabold text-text-dark">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

