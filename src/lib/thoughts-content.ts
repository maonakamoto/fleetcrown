import fs from "fs";
import path from "path";
import { parseContentBlocks, parseFrontmatter, type ContentBlock } from "bip-kit";

const THOUGHTS_DIR = path.join(process.cwd(), "content", "thoughts");

export type ThoughtMeta = {
  slug: string;
  title: string;
  summary: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  featured: boolean;
  author: string;
  readingTimeMin: number;
};

/**
 * The block union, frontmatter, and body parser live in `bip-kit` — the
 * open-source extract of exactly this file's former inline parser. This repo
 * dogfoods the package; the alias keeps the Thoughts UI's vocabulary.
 */
export type ThoughtBlock = ContentBlock;

// bip-kit ≥0.2 frontmatter values can be YAML arrays (`tags: [a, b]`). All
// current essays use scalar values; these two helpers accept both shapes so
// an essay written either way lists correctly.
function metaStr(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function metaTags(value: string | string[] | undefined): string[] {
  const parts = Array.isArray(value) ? value : (value ?? "").split(",");
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function listThoughts(): Array<ThoughtMeta & { body: string }> {
  if (!fs.existsSync(THOUGHTS_DIR)) return [];
  return fs
    .readdirSync(THOUGHTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(THOUGHTS_DIR, f), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug,
        title: metaStr(meta.title) ?? slug,
        // Six early essays carried their one-liner under `subtitle:` — the
        // renderer ignored it and they listed as bare titles. Honor it.
        summary: metaStr(meta.summary) ?? metaStr(meta.subtitle) ?? "",
        excerpt: metaStr(meta.excerpt) ?? metaStr(meta.subtitle) ?? "",
        publishedAt: metaStr(meta.publishedAt) ?? "",
        tags: metaTags(meta.tags),
        featured: (metaStr(meta.featured) ?? "false") === "true",
        author: metaStr(meta.author) ?? "Loki",
        readingTimeMin: Number(metaStr(meta.readingTimeMin) ?? "6"),
        body,
      };
    })
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getThought(slug: string) {
  return listThoughts().find((a) => a.slug === slug) ?? null;
}

export function listThoughtTags(): string[] {
  return [...new Set(listThoughts().flatMap((article) => article.tags))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getAdjacentThoughts(slug: string) {
  const articles = listThoughts();
  const index = articles.findIndex((article) => article.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: articles[index + 1] ?? null,
    next: articles[index - 1] ?? null,
  };
}

export function getRelatedThoughts(slug: string, limit = 3) {
  const articles = listThoughts();
  const current = articles.find((article) => article.slug === slug);
  if (!current) return [];

  return articles
    .filter((article) => article.slug !== slug)
    .map((article) => ({
      article,
      sharedTags: article.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.sharedTags > 0)
    .sort(
      (a, b) =>
        b.sharedTags - a.sharedTags || (a.article.publishedAt < b.article.publishedAt ? 1 : -1),
    )
    .slice(0, limit)
    .map((entry) => entry.article);
}

/** Parse an essay body into typed blocks — delegates to bip-kit. */
export const parseThoughtBlocks = parseContentBlocks;
