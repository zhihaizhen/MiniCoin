import * as React from 'react';
import { isMobile, isApp } from '@better-bit-fe/base-utils';
import { ReactComponent as TwitterSvg } from './icons/twitter.svg';
import { ReactComponent as DiscordSvg } from './icons/discord.svg';
import { ReactComponent as InstagramSvg } from './icons/instagram.svg';
import { ReactComponent as TelegramSvg } from './icons/telegram.svg';


export function Footer() {
  const isMb = isMobile();
  const medias = [
    {
      name: 'Twitter',
      icon: <TwitterSvg />,
      url: 'https://x.com/EasiCoin_EN'
    },
    {
      name: 'Telegram',
      icon: <TelegramSvg />,
      url: 'https://t.me/EasiCoin_ZH'
    },
    {
      name: 'Discord',
      icon: <DiscordSvg />,
      url: 'https://discord.gg/kfSyjuw9'
    },
    {
      name: 'Instagram',
      icon: <InstagramSvg />,
      url: 'https://www.instagram.com/easi_coin/'
    }
  ]
  return (
    <div className='max-w-[1440px] mx-auto flex flex-col sm:h-auto sm:flex-row bg-[#fff] p-[40px] sm:p-[40px_120px] items-center justify-between'>
      <div className='sm:w-[33.3%]'>

        <img src='/static/image/header/brand-primary.svg?url' alt="Footer Logo" />
      </div>
      <div className='sm:w-[33.3%] w-[0]'>
        {
          !isMb && <div className='text-center'>© 2025 Easicoin Limited.</div>
        }
      </div>

      <div className='flex items-center justify-end sm:w-[33.3%] gap-[19px] sm:gap-[0] my-[24px] sm:my-0'>
        {medias.map((media, index) => (
          <a
            key={index}
            href={media.url}
            target="_blank"
            rel="noreferrer"
            className='ml-[16px] text-[#101112] hover:opacity-60 transition-opacity cursor-pointer'
          >
            {media.icon}
          </a>
        ))}
      </div>

      <div>
        {
          isMb && <div className='sm:w-[33.3%] text-center'>© 2025 Easicoin Limited.</div>
        }
      </div>
    </div>
  );
}
