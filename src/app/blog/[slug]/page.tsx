import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { BlogDetailTemplate } from "@/components/blog-detail/BlogDetailTemplate";
import { blogToArticle } from "@/lib/blog-article-adapter";
import { PageType } from "@/lib/database/constants";
import { resolveExpertAttribution } from "@/lib/eeat/server";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import {
  blogToCard,
  categoryTitle,
  createCategoryMap,
  onlyPublished,
  productToCard,
} from "@/lib/live-data";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPersonJsonLd,
} from "@/lib/seo/structured-data";
import type { Blog, Product } from "@/lib/database/types";

type BlogPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

function latestTimestamp(record: Pick<Blog | Product, "updated_at" | "created_at">) {
  return new Date(record.updated_at || record.created_at).getTime();
}

function scoreRelatedBlog(source: Blog, candidate: Blog) {
  const sourceTags = new Set(source.tags.map(normalizeTag).filter(Boolean));
  const candidateTags = candidate.tags.map(normalizeTag).filter(Boolean);
  const searchableText = [candidate.title, candidate.excerpt, candidate.seo_description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  let score = 0;

  if (source.category_id && candidate.category_id === source.category_id) {
    score += 6;
  }

  candidateTags.forEach((tag) => {
    if (sourceTags.has(tag)) {
      score += 3;
    }
  });

  sourceTags.forEach((tag) => {
    if (tag && searchableText.includes(tag)) {
      score += 1;
    }
  });

  return score;
}

function scoreRecommendedProduct(source: Blog, product: Product) {
  const sourceTags = source.tags.map(normalizeTag).filter(Boolean);
  const searchableText = [
    product.title,
    product.name,
    product.short_description,
    product.full_description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  let score = 0;

  if (source.category_id && product.category_id === source.category_id) {
    score += 6;
  }

  sourceTags.forEach((tag) => {
    if (tag && searchableText.includes(tag)) {
      score += 2;
    }
  });

  return score;
}

function sortByScoreThenFreshness<TRecord extends Blog | Product>(
  records: TRecord[],
  getScore: (record: TRecord) => number,
) {
  return [...records].sort((left, right) => {
    const scoreDelta = getScore(right) - getScore(left);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return latestTimestamp(right) - latestTimestamp(left);
  });
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blogService = new BlogService();

  try {
    const blog = await blogService.getBlogBySlug(slug);
    if (blog.status !== "published") {
      throw new Error("Blog not published.");
    }

    return buildSeoMetadata(PageType.Blog, slug, {
      title: `${blog.seo_title || blog.title} | Suppriva`,
      description: blog.seo_description || blog.excerpt || "Suppriva wellness guide.",
      canonicalPath: `/blog/${slug}`,
      image: blog.featured_image,
      type: "article",
    });
  } catch {
    return {
      title: "Article Not Found | Suppriva",
    };
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blogService = new BlogService();

  try {
    const [blog, blogs, products, categories] = await Promise.all([
      blogService.getBlogBySlug(slug),
      blogService.getAllBlogs(),
      new ProductService().getAllProducts(),
      new CategoryService().getAllCategories(),
    ]);

    if (blog.status !== "published") {
      notFound();
    }

    const categoryMap = createCategoryMap(onlyPublished(categories));
    const expertAttribution = await resolveExpertAttribution({
      authorId: blog.author_id,
      reviewerId: blog.reviewer_id,
      updatedAt: blog.updated_at || blog.published_at || blog.created_at,
    });
    const article = {
      ...blogToArticle(blog, expertAttribution),
      category: categoryTitle(blog.category_id ? categoryMap.get(blog.category_id) : null),
    };
    const publishedBlogs = onlyPublished(blogs).filter((item) => item.slug !== blog.slug);
    const relatedArticles = sortByScoreThenFreshness(
      publishedBlogs,
      (item) => scoreRelatedBlog(blog, item),
    )
      .slice(0, 6)
      .map((item) => blogToCard(item, categoryMap))
      .filter((item): item is typeof item & { slug: string } => Boolean(item.slug));
    const recommendedProducts = sortByScoreThenFreshness(
      onlyPublished(products),
      (product) => scoreRecommendedProduct(blog, product),
    )
      .slice(0, 3)
      .map((product, index) => productToCard(product, categoryMap, index));

    return (
      <>
        <JsonLdScript
          pageType={PageType.Blog}
          pageSlug={slug}
          schema={[
            buildArticleJsonLd({
              slug,
              title: article.title,
              description: article.summary,
              image: article.image,
              author: article.expertAttribution.author,
              reviewer: article.expertAttribution.reviewer,
              datePublished: blog.published_at || blog.created_at,
              dateModified: blog.updated_at,
            }),
            buildPersonJsonLd(article.expertAttribution.author, "author"),
            buildPersonJsonLd(article.expertAttribution.reviewer, "reviewer"),
            ...(article.faqs.length ? [buildFaqJsonLd(article.faqs)] : []),
            buildBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blogs", path: "/blogs" },
              { name: article.title, path: `/blog/${slug}` },
            ]),
          ]}
        />
        <Navbar />
        <BlogDetailTemplate
          article={article}
          relatedArticles={relatedArticles}
          recommendedProducts={recommendedProducts}
        />
        <PremiumFooter />
        <BackToTopButton />
      </>
    );
  } catch {
    notFound();
  }
}
