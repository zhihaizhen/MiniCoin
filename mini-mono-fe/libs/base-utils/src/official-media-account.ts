import type { LocaleType } from './types';

type Media = 'twitter' | 'facebook' | 'instagram' | 'discord' | ' telegram';

export const SOCIAL_MEDIAS = {
  twitter: {
    'en-US': 'https://twitter.com/'
  },
  facebook: {
    'en-US': 'https://www.facebook.com/'
  },
  instagram: {
    'en-US': 'https://www.instagram.com/'
  },
  discord: {},
  telegram: {}
} as const;

export const getOfficialAccount =
  (locale: LocaleType) =>
  (media: Media, fallback = true) => {
    const link = SOCIAL_MEDIAS?.[media]?.[locale];
    const fallbackLink = fallback
      ? SOCIAL_MEDIAS?.[media]?.['en-US'] || SOCIAL_MEDIAS['twitter']['en-US']
      : '';

    if (!link) {
      console.error(`No config url for ${locale}:${media}`);
    }

    return link || fallbackLink;
  };
