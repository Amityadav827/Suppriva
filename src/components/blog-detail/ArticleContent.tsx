"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Quote } from "lucide-react";
import { CalloutBlock } from "@/components/blog-detail/CalloutBlock";
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

function RichContent({ content }: { content: string }) {
  const blocks = parseRichBlocks(content);

  return (
    <div className="mt-5 grid gap-5 text-base leading-8 text-muted">
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
    <article className="min-w-0">
      <div className="grid gap-10">
        {article.sections.map((section, index) => (
          <motion.section
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="scroll-mt-32 rounded-[32px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] md:p-8"
          >
            <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl">
              {section.title}
            </h2>
            <RichContent content={section.content || section.intro || ""} />
            {section.h3 ? (
              <h3 className="mt-6 font-heading text-xl font-extrabold text-text-dark">
                {section.h3}
              </h3>
            ) : null}
            {section.bullets ? (
              <ul className="mt-4 grid gap-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-6 text-muted">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.quote ? (
              <blockquote className="mt-6 rounded-[24px] border border-gold/24 bg-gold/10 p-5 text-base leading-8 text-text-dark">
                <Quote className="mb-3 size-5 text-gold" aria-hidden="true" />
                {section.quote}
              </blockquote>
            ) : null}
            {index === 1 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {article.callouts.map((callout) => (
                  <CalloutBlock key={callout.title} {...callout} />
                ))}
              </div>
            ) : null}
          </motion.section>
        ))}
      </div>

      {article.table?.rows?.length ? (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.42 }}
          className="mt-10 overflow-hidden rounded-[32px] border border-border-light bg-white shadow-premium"
        >
          <div className="border-b border-border-light p-6 md:p-8">
            <h2 className="font-heading text-2xl font-extrabold text-text-dark">
              {article.table.title}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <tbody>
                {article.table.rows.map((row) => (
                  <tr key={row.join("-")} className="border-t border-border-light first:border-t-0">
                    {row.map((cell) => (
                      <td key={cell} className="px-6 py-4 text-muted">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      ) : null}
    </article>
  );
}
