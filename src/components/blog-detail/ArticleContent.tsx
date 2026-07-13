"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BlogArticleFaqAccordion,
  type BlogArticleFaqItem,
} from "@/components/blog-detail/BlogArticleFaqAccordion";
import type { BlogArticle } from "@/lib/blog-data";

type RichBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "hr" }
  | { type: "image"; alt: string; src: string }
  | { type: "table"; rows: string[][] };

function parseRichBlocks(content: string): RichBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: RichBlock[] = [];
  let index = 0;

  function isTableLine(line: string) {
    return line.trim().startsWith("|") && line.trim().endsWith("|");
  }

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      index += 1;
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (imageMatch) {
      blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "quote", text: quoteLines.join("\n") });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;

      while (index < lines.length && pattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(pattern, ""));
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (isTableLine(trimmed)) {
      const tableLines: string[] = [];

      while (index < lines.length && isTableLine(lines[index])) {
        tableLines.push(lines[index].trim());
        index += 1;
      }

      const rows = tableLines
        .filter((tableLine) => !/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|$/.test(tableLine))
        .map((tableLine) =>
          tableLine
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim()),
        )
        .filter((row) => row.some(Boolean));

      if (rows.length) {
        blocks.push({ type: "table", rows });
      }
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const paragraphLine = lines[index];
      const paragraphTrimmed = paragraphLine.trim();

      if (
        !paragraphTrimmed ||
        /^(#{1,6})\s+/.test(paragraphTrimmed) ||
        /^!\[([^\]]*)\]\(([^)]+)\)$/.test(paragraphTrimmed) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(paragraphTrimmed) ||
        /^>\s?/.test(paragraphTrimmed) ||
        /^[-*]\s+/.test(paragraphTrimmed) ||
        /^\d+\.\s+/.test(paragraphTrimmed) ||
        isTableLine(paragraphTrimmed)
      ) {
        break;
      }

      paragraphLines.push(paragraphTrimmed);
      index += 1;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  const pattern =
    /(\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<u key={match.index}>{match[4]}</u>);
    } else if (match[5]) {
      parts.push(<s key={match.index}>{match[5]}</s>);
    } else if (match[6] && match[7]) {
      parts.push(
        <a
          key={match.index}
          href={match[7]}
          className="font-semibold text-primary underline decoration-gold/50 underline-offset-4 transition hover:text-button-hover"
          target={match[7].startsWith("http") ? "_blank" : undefined}
          rel={match[7].startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {match[6]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/\shref=["']javascript:[^"']*["']/gi, ' href="#"')
    .replace(/\ssrc=["']javascript:[^"']*["']/gi, "");
}

type HtmlSegment =
  | { type: "html"; html: string }
  | { type: "faq"; heading: string; faqs: BlogArticleFaqItem[] };

const articleHtmlClassName =
  "mt-5 grid gap-5 text-base leading-8 text-muted [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:decoration-gold/50 [&_a]:underline-offset-4 [&_blockquote]:rounded-[24px] [&_blockquote]:border [&_blockquote]:border-gold/24 [&_blockquote]:bg-gold/10 [&_blockquote]:p-5 [&_blockquote]:text-text-dark [&_code]:rounded-md [&_code]:bg-soft-green [&_code]:px-1.5 [&_code]:py-0.5 [&_figure]:overflow-hidden [&_figure]:rounded-[24px] [&_figure]:border [&_figure]:border-border-light [&_figcaption]:px-5 [&_figcaption]:py-3 [&_figcaption]:text-sm [&_figcaption]:text-muted [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-text-dark [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-text-dark [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-dark [&_h4]:font-heading [&_h4]:text-lg [&_h4]:font-extrabold [&_h4]:text-text-dark [&_hr]:border-border-light [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[24px] [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_p]:text-base [&_p]:leading-8 [&_pre]:overflow-x-auto [&_pre]:rounded-[24px] [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:text-slate-100 [&_table]:w-full [&_table]:min-w-[620px] [&_table]:text-left [&_table]:text-sm [&_tbody_tr]:border-t [&_tbody_tr]:border-border-light [&_td]:px-6 [&_td]:py-4 [&_th]:bg-soft-green [&_th]:px-6 [&_th]:py-4 [&_th]:font-heading [&_th]:text-text-dark [&_ul]:grid [&_ul]:gap-3";

function stripHtmlText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseFaqSegmentsFromMarkup(html: string): HtmlSegment[] {
  const segments: HtmlSegment[] = [];
  const h2Pattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = h2Pattern.exec(html)) !== null) {
    const heading = stripHtmlText(match[1]);

    if (!isFrequentlyAskedQuestionsTitle(heading)) {
      continue;
    }

    const faqStart = match.index;
    const faqContentStart = h2Pattern.lastIndex;
    const nextHeadingMatch = /<h2\b[^>]*>/i.exec(html.slice(faqContentStart));
    const faqEnd = nextHeadingMatch
      ? faqContentStart + nextHeadingMatch.index
      : html.length;
    const faqHtml = html.slice(faqContentStart, faqEnd);
    const faqPattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi;
    const faqs: BlogArticleFaqItem[] = [];
    let faqMatch: RegExpExecArray | null;

    while ((faqMatch = faqPattern.exec(faqHtml)) !== null) {
      const question = stripHtmlText(faqMatch[1]);
      const answerHtml = faqMatch[2].trim();

      if (question && answerHtml) {
        faqs.push({ question, answerHtml });
      }
    }

    if (!faqs.length) {
      continue;
    }

    if (faqStart > cursor) {
      segments.push({ type: "html", html: html.slice(cursor, faqStart) });
    }

    segments.push({
      type: "faq",
      heading: heading || "Frequently Asked Questions",
      faqs,
    });

    cursor = faqEnd;
    h2Pattern.lastIndex = faqEnd;
  }

  if (!segments.length) {
    return [{ type: "html", html }];
  }

  if (cursor < html.length) {
    segments.push({ type: "html", html: html.slice(cursor) });
  }

  return segments;
}

function parseFaqSegments(html: string): HtmlSegment[] {
  if (typeof DOMParser === "undefined") {
    return parseFaqSegmentsFromMarkup(html);
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const root = document.body;

  if (!root) {
    return [{ type: "html", html }];
  }

  const blocks = Array.from(root.querySelectorAll("h1, h2, h3, p")) as HTMLElement[];
  const faqSections: Array<{
    marker: string;
    heading: string;
    faqs: BlogArticleFaqItem[];
    headingElement: HTMLElement;
    lastAnswerElement: HTMLElement;
  }> = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const headingElement = blocks[index];
    const tagName = headingElement.tagName.toLowerCase();
    const headingText = headingElement.textContent?.replace(/\s+/g, " ").trim() ?? "";

    if (tagName !== "h2" || !/frequently asked questions/i.test(headingText)) {
      continue;
    }

    const faqs: BlogArticleFaqItem[] = [];
    let cursor = index + 1;
    let lastAnswerElement: HTMLElement | null = null;

    while (cursor < blocks.length) {
      const questionElement = blocks[cursor];
      const questionTag = questionElement.tagName.toLowerCase();

      if (questionTag === "h1" || questionTag === "h2") {
        break;
      }

      if (questionTag !== "h3") {
        cursor += 1;
        continue;
      }

      let answerIndex = cursor + 1;
      let answerElement: HTMLElement | null = null;

      while (answerIndex < blocks.length) {
        const candidate = blocks[answerIndex];
        const candidateTag = candidate.tagName.toLowerCase();

        if (candidateTag === "h1" || candidateTag === "h2" || candidateTag === "h3") {
          break;
        }

        if (candidateTag === "p") {
          answerElement = candidate;
          break;
        }

        answerIndex += 1;
      }

      if (!answerElement) {
        cursor += 1;
        continue;
      }

      const question = questionElement.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const answerHtml = answerElement.innerHTML.trim();

      if (question && answerHtml) {
        faqs.push({ question, answerHtml });
        lastAnswerElement = answerElement;
      }

      cursor = answerIndex + 1;
    }

    if (!faqs.length || !lastAnswerElement) {
      continue;
    }

    faqSections.push({
      marker: `BLOG_FAQ_ACCORDION_${faqSections.length}`,
      heading: headingText || "Frequently Asked Questions",
      faqs,
      headingElement,
      lastAnswerElement,
    });

    index = blocks.indexOf(lastAnswerElement);
  }

  if (!faqSections.length) {
    return [{ type: "html", html }];
  }

  for (const section of [...faqSections].reverse()) {
    const marker = document.createComment(section.marker);
    section.headingElement.before(marker);

    const range = document.createRange();
    range.setStartAfter(marker);
    range.setEndAfter(section.lastAnswerElement);
    range.deleteContents();
    range.detach();
  }

  const serializedHtml = root.innerHTML;
  const markerPattern = /<!--BLOG_FAQ_ACCORDION_(\d+)-->/g;
  const segments: HtmlSegment[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = markerPattern.exec(serializedHtml)) !== null) {
    if (match.index > cursor) {
      segments.push({ type: "html", html: serializedHtml.slice(cursor, match.index) });
    }

    const section = faqSections[Number(match[1])];

    if (section) {
      segments.push({
        type: "faq",
        heading: section.heading,
        faqs: section.faqs,
      });
    }

    cursor = markerPattern.lastIndex;
  }

  if (cursor < serializedHtml.length) {
    segments.push({ type: "html", html: serializedHtml.slice(cursor) });
  }

  return segments.length ? segments : [{ type: "html", html }];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function containsFaqSegment(segments: HtmlSegment[]) {
  return segments.some((segment) => segment.type === "faq");
}

function isFrequentlyAskedQuestionsTitle(value: string) {
  return /frequently asked questions/i.test(value);
}

function RichContent({
  content,
  fallbackHeading,
}: {
  content: string;
  fallbackHeading?: string;
}) {
  const isHtml = looksLikeHtml(content);
  const safeHtml = sanitizeHtml(content);
  const [segments, setSegments] = useState<HtmlSegment[]>(
    isHtml ? parseFaqSegments(safeHtml) : [{ type: "html", html: safeHtml }],
  );

  useEffect(() => {
    if (isHtml) {
      const parsedSegments = parseFaqSegments(safeHtml);

      if (!containsFaqSegment(parsedSegments) && fallbackHeading) {
        const syntheticFaqHtml = `<h2>${escapeHtml(fallbackHeading)}</h2>${safeHtml}`;
        const syntheticSegments = parseFaqSegments(syntheticFaqHtml);

        setSegments(
          containsFaqSegment(syntheticSegments) ? syntheticSegments : parsedSegments,
        );
        return;
      }

      setSegments(parsedSegments);
    }
  }, [fallbackHeading, isHtml, safeHtml]);

  if (isHtml) {
    const hasFaqAccordion = containsFaqSegment(segments);

    return (
      <div className={articleHtmlClassName}>
        {fallbackHeading && !hasFaqAccordion ? (
          <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl">
            {fallbackHeading}
          </h2>
        ) : null}

        {segments.map((segment, index) => {
          if (segment.type === "faq") {
            return (
              <BlogArticleFaqAccordion
                key={`faq-${segment.heading}-${index}`}
                heading={segment.heading}
                faqs={segment.faqs}
              />
            );
          }

          if (!segment.html.trim()) {
            return null;
          }

          return (
            <div
              key={`html-${index}`}
              className="grid gap-5"
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        })}
      </div>
    );
  }

  const blocks = parseRichBlocks(content);

  return (
    <div className="mt-5 grid gap-5 text-base leading-8 text-muted">
      {fallbackHeading ? (
        <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl">
          {fallbackHeading}
        </h2>
      ) : null}

      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${Math.min(Math.max(block.level, 2), 6)}` as
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6";

          return (
            <HeadingTag
              key={`${block.text}-${index}`}
              className="font-heading text-xl font-extrabold leading-tight text-text-dark md:text-2xl"
            >
              {renderInline(block.text)}
            </HeadingTag>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";

          return (
            <ListTag
              key={`list-${index}`}
              className={`grid gap-3 ${block.ordered ? "list-decimal pl-6" : ""}`}
            >
              {block.items.map((item) => (
                <li key={item} className={block.ordered ? "text-muted" : "flex gap-3 text-sm leading-6 text-muted"}>
                  {block.ordered ? (
                    renderInline(item)
                  ) : (
                    <>
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{renderInline(item)}</span>
                    </>
                  )}
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`quote-${index}`}
              className="rounded-[24px] border border-gold/24 bg-gold/10 p-5 text-base leading-8 text-text-dark"
            >
              <Quote className="mb-3 size-5 text-gold" aria-hidden="true" />
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "hr") {
          return <hr key={`hr-${index}`} className="border-border-light" />;
        }

        if (block.type === "image") {
          return (
            <figure key={`${block.src}-${index}`} className="overflow-hidden rounded-[24px] border border-border-light bg-soft-green">
              <div className="relative h-72">
                <Image src={block.src} alt={block.alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
              </div>
              {block.alt ? <figcaption className="px-5 py-3 text-sm text-muted">{block.alt}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === "table") {
          const [header, ...rows] = block.rows;

          return (
            <div key={`table-${index}`} className="overflow-x-auto rounded-[24px] border border-border-light">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-soft-green font-heading text-text-dark">
                  <tr>
                    {header.map((cell) => (
                      <th key={cell} className="px-6 py-4">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.join("-")} className="border-t border-border-light">
                      {row.map((cell) => (
                        <td key={cell} className="px-6 py-4 text-muted">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="text-base leading-8 text-muted">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export function ArticleContent({ article }: { article: BlogArticle }) {
  return (
    <article className="min-w-0 rounded-[34px] border border-border-light bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-8 lg:p-10">
      <div className="grid gap-10">
        {article.sections.map((section) => {
          const sectionTitleIsFaq = isFrequentlyAskedQuestionsTitle(section.title);

          return (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="scroll-mt-32"
            >
              {!sectionTitleIsFaq ? (
                <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl">
                  {section.title}
                </h2>
              ) : null}

              <RichContent
                content={section.content || section.intro || ""}
                fallbackHeading={sectionTitleIsFaq ? section.title : undefined}
              />
            </motion.section>
          );
        })}
      </div>
    </article>
  );
}
