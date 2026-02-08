export interface MicroCMSImage {
  url: string;
  height?: number;
  width?: number;
}

export interface MicroCMSDate {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
}

export interface MicroCMSContentId {
  id: string;
}

export type MicroCMSListContent = MicroCMSContentId & MicroCMSDate;

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

// ① global_settings (Object type)
export interface GlobalSettings {
  site_title: string;
  artist_name: string;
  artist_subtitle: string;
  hero_copy_jp: string;
  hero_copy_en: string;
  hero_image?: MicroCMSImage;
  statement: string;
  about_subtitle: string;
  about_text: string; // Rich editor HTML
  profile_image?: MicroCMSImage;
  cv_list?: string; // Rich editor HTML
  contact_email: string;
  contact_description: string;
  instagram_handle: string;
  instagram_url: string;
  x_handle: string;
  x_url: string;
  copyright_text: string;
}

// ② works (List type)
export interface Work extends MicroCMSListContent {
  title: string;
  slug: string;
  subtitle_en?: string;
  category?: string;
  main_image?: MicroCMSImage;
  gallery?: MicroCMSImage[];
  year?: number;
  technique?: string;
  material?: string;
  description?: string; // Rich editor HTML
}

// ③ news (List type)
export interface News extends MicroCMSListContent {
  title: string;
  subtitle_en?: string;
  category?: string;
  published_at?: string;
  main_image?: MicroCMSImage;
  content?: string; // Rich editor HTML
  event_date_start?: string;
  event_date_end?: string;
  event_time?: string;
  event_venue?: string;
  event_venue_url?: string;
  event_closed?: string;
  url?: string;
}

// ④ research (List type) - プロジェクト用
export interface Research extends MicroCMSListContent {
  title: string;
  subtitle_en?: string;
  icon?: string;
  category?: string;
  published_at?: string;
  main_image?: MicroCMSImage;
  summary?: string;
  content?: string; // Rich editor HTML
  year?: number; // プロジェクト実施年
}
