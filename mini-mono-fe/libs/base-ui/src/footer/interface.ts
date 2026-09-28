// 单个社交媒体项
export interface SocialMediaItem {
  /** 排序 */
  seq: number;
  /** 名称 */
  name: string;
  /** 图片地址 */
  pic_url: string;
  /** 跳转地址 */
  redirect_url: string;
}

// 单语言数据结构
export interface LocaleSocialMedia {
  social_medias: SocialMediaItem[];
}

// 多语言数据结构（支持任意语言 key）
export type SocialMediaMap = Record<string, LocaleSocialMedia>;
