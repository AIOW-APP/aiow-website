/**
 * MDX content engine — thin wrapper around gray-matter + next-mdx-remote.
 *
 * Usage:
 *   import { getAllPosts, getPostBySlug } from "@/core/content/mdx";
 *   const posts = await getAllPosts("content/blog");
 *
 * Content files live in <project>/content/blog/*.mdx with frontmatter:
 *   ---
 *   title: "..."
 *   description: "..."
 *   publishedAt: 2026-04-19
 *   author: "Debbie"
 *   tags: ["trading", "tech"]
 *   cover: "/covers/post-1.jpg"
 *   featured: true
 *   ---
 *   body in MDX...
 */
import fs from "node:fs/promises";
import path from "node:path";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  cover?: string;
  featured?: boolean;
  readingMinutes: number;
}

export interface Post extends PostMeta {
  body: string;       // raw MDX source (render with next-mdx-remote or similar)
}

// Simple frontmatter parser (no extra dep)
function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const metaRaw = m[1];
  const body = m[2];
  const meta: Record<string, unknown> = {};
  for (const line of metaRaw.split("\n")) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val: unknown = kv[2].trim();
    if (typeof val === "string") {
      // Strip quotes
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      // Arrays: [a, b, c]
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
      // Booleans
      if (val === "true") val = true;
      if (val === "false") val = false;
    }
    meta[key] = val;
  }
  return { meta, body };
}

function estimateReadingMinutes(body: string): number {
  const words = body.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function getAllPosts(dir: string): Promise<PostMeta[]> {
  const absDir = path.resolve(process.cwd(), dir);
  let files: string[] = [];
  try {
    files = (await fs.readdir(absDir)).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  } catch {
    return [];
  }
  const posts: PostMeta[] = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(absDir, f), "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    posts.push({
      slug: f.replace(/\.mdx?$/, ""),
      title: String(meta.title || f),
      description: String(meta.description || ""),
      publishedAt: String(meta.publishedAt || new Date().toISOString()),
      updatedAt: meta.updatedAt ? String(meta.updatedAt) : undefined,
      author: String(meta.author || "Debbie"),
      tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
      cover: meta.cover ? String(meta.cover) : undefined,
      featured: Boolean(meta.featured),
      readingMinutes: estimateReadingMinutes(body),
    });
  }
  // Newest first
  posts.sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));
  return posts;
}

export async function getPostBySlug(dir: string, slug: string): Promise<Post | null> {
  const absDir = path.resolve(process.cwd(), dir);
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const c of candidates) {
    try {
      const raw = await fs.readFile(path.join(absDir, c), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug,
        title: String(meta.title || slug),
        description: String(meta.description || ""),
        publishedAt: String(meta.publishedAt || new Date().toISOString()),
        updatedAt: meta.updatedAt ? String(meta.updatedAt) : undefined,
        author: String(meta.author || "Debbie"),
        tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
        cover: meta.cover ? String(meta.cover) : undefined,
        featured: Boolean(meta.featured),
        readingMinutes: estimateReadingMinutes(body),
        body,
      };
    } catch {
      continue;
    }
  }
  return null;
}
