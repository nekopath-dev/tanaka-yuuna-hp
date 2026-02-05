import { createClient } from "microcms-js-sdk";
import type {
  GlobalSettings,
  Work,
  News,
  Research,
  MicroCMSListResponse,
} from "../types/microcms";

const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

// ── Global Settings ──
export async function getGlobalSettings(): Promise<GlobalSettings> {
  return await client.get<GlobalSettings>({
    endpoint: "global_settings",
  });
}

// ── Works ──
export async function getWorks(limit?: number): Promise<Work[]> {
  const res = await client.get<MicroCMSListResponse<Work>>({
    endpoint: "works",
    queries: {
      limit: limit ?? 100,
      orders: "-year",
    },
  });
  return res.contents;
}

export async function getWorkBySlug(slug: string): Promise<Work> {
  const res = await client.get<MicroCMSListResponse<Work>>({
    endpoint: "works",
    queries: {
      filters: `slug[equals]${slug}`,
      limit: 1,
    },
  });
  return res.contents[0];
}

export async function getAllWorkSlugs(): Promise<string[]> {
  const res = await client.get<MicroCMSListResponse<Work>>({
    endpoint: "works",
    queries: {
      fields: "slug",
      limit: 100,
    },
  });
  return res.contents.map((w) => w.slug);
}

// ── News ──
export async function getNews(limit?: number): Promise<News[]> {
  const res = await client.get<MicroCMSListResponse<News>>({
    endpoint: "news",
    queries: {
      limit: limit ?? 100,
      orders: "-published_at",
    },
  });
  return res.contents;
}

export async function getNewsById(id: string): Promise<News> {
  return await client.get<News>({
    endpoint: "news",
    contentId: id,
  });
}

export async function getAllNewsIds(): Promise<string[]> {
  const res = await client.get<MicroCMSListResponse<News>>({
    endpoint: "news",
    queries: {
      fields: "id",
      limit: 100,
    },
  });
  return res.contents.map((n) => n.id);
}

// ── Research ──
export async function getResearch(limit?: number): Promise<Research[]> {
  const res = await client.get<MicroCMSListResponse<Research>>({
    endpoint: "research",
    queries: {
      limit: limit ?? 100,
      orders: "-published_at",
    },
  });
  return res.contents;
}

export async function getResearchById(id: string): Promise<Research> {
  return await client.get<Research>({
    endpoint: "research",
    contentId: id,
  });
}

export async function getAllResearchIds(): Promise<string[]> {
  const res = await client.get<MicroCMSListResponse<Research>>({
    endpoint: "research",
    queries: {
      fields: "id",
      limit: 100,
    },
  });
  return res.contents.map((r) => r.id);
}
