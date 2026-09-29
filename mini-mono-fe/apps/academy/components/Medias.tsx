import XIcon from '~/public/images/medias/x.svg';
import InstagramIcon from '~/public/images/medias/instagram.svg';
import TelegramIcon from '~/public/images/medias/telegram.svg';
import DiscordIcon from '~/public/images/medias/discord.svg';
import MediumIcon from '~/public/images/medias/medium.svg';
import FacebookIcon from '~/public/images/medias/facebook.svg';
import CopyIcon from '~/public/images/medias/copy.svg';
import copy from 'copy-to-clipboard';

import type { Article } from '~/types/academy';
import { message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';

interface Props {
  article: Article;
  url?: string;
}

export function Medias({ article, url: shareUrl }: Props) {
  const t = useFm();
  const currentUrl = shareUrl || (typeof window === 'undefined' ? '' : window.location.href);
  const url = encodeURIComponent(currentUrl);
  const title = encodeURIComponent(article?.title);

  const copyCurrentPageUrl = async () => {
    copy(window.location.href || currentUrl);
    message.success(t('copyTips'));
  };

  const medias = [
    {
      icon: CopyIcon,
      label: 'Copy',
      onClick: copyCurrentPageUrl,
    },
    {
      icon: XIcon,
      href: `https://x.com/intent/post?url=${url}&text=${title}`,
      label: 'Share on X',
    },
    {
      icon: TelegramIcon,
      href: `https://t.me/EasiCoinAnnouncements`,
      label: 'Share on Telegram',
    },
    {
      icon: MediumIcon,
      href: `https://medium.com/p/import`, // 官方分享下架了
      label: 'Medium',
    },
    {
      icon: InstagramIcon,
      href: `https://www.instagram.com/`,
      label: 'Instagram',
    },
    {
      icon: DiscordIcon,
      href: `https://discord.com/`,
      label: 'Discord',
    },
    {
      icon: FacebookIcon,
      href: `http://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`,
      label: 'Share on Facebook',
    }
  ];

  return (
    <div className="flex items-center md:justify-start justify-center gap-4 md:mt-0 mt-10">
      {medias.map(({ icon, href, label, onClick }) =>
        onClick ? (
          <button
            key={label}
            type="button"
            onClick={onClick}
            aria-label={label}
            className="block h-8 md:h-6 w-8 md:w-6 cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" className="h-full w-full my-0! mx-auto" />
          </button>
        ) : (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="block h-8 md:h-6 w-8 md:w-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" className="h-full w-full my-0! mx-auto" />
          </a>
        )
      )}
    </div>
  );
}
