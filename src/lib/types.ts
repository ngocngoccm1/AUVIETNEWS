export type Locale = 'vi' | 'en' | 'de';
export interface Article { id:string; slug:string; category:string; subcategory:string|null; cover_image:string|null; author:string; published_at:string; reading_time:number; views:number; featured:boolean; title_vi:string; title_en:string|null; title_de:string|null; excerpt_vi:string|null; excerpt_en:string|null; excerpt_de:string|null; content_vi:string|null; content_en:string|null; content_de:string|null; source_url?:string; source_name?:string; source_topic?:string; image_credit?:string; local_image?:string; }
export interface Comment { id:string; article_id:string; author_name:string; content:string; created_at:string; }
export type Localized = Record<Locale, string>;
export function localize(article: Article, key: 'title'|'excerpt'|'content', locale:Locale) { return article[`${key}_${locale}`] || article[`${key}_vi`] || ''; }
