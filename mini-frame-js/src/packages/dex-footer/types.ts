export interface SocialMediaItem {
  seq: number
  name: string
  pic_url: string
  redirect_url: string
}

export interface LocaleSocialMedia {
  social_medias: SocialMediaItem[]
}

export type SocialMediaMap = Record<string, LocaleSocialMedia>
