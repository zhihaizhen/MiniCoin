import React from 'react';
import { message } from 'antd';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import copy from 'copy-to-clipboard';

// 导入图标
import DownloadIcon from './icons/ic-download.svg';
import CopyLinkIcon from './icons/copy-link.svg';
import XIcon from './icons/ic-social-x.svg';
import TelegramIcon from './icons/ic-social-telegram.svg';
import FacebookIcon from './icons/ic-social-facebook.svg';
import InstagramIcon from './icons/ic-social-instagram.svg';
import DiscordIcon from './icons/ic-social-discord.svg';
import MediumIcon from './icons/ic-social-medium.svg';

interface SocialShareActionsProps {
  inviteLink?: string;
  inviteCode?: string;
  onDownload?: () => void;
  className?: string;
  shareText?: string;
}

// 社交媒体分享 URL
const SOCIAL_SHARE_URL = {
  x: 'https://twitter.com/intent/tweet',
  telegram: 'https://t.me/share/url',
  medium: 'https://medium.com/@easicoin402',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
  discord: 'https://discord.gg/84fna5WzsK',
  instagram: 'https://www.instagram.com/easicoin_/'
};

// 弹出新窗口
const popupNewWindow = (url: string) => {
  const w = 800;
  const h = 600;
  const scroll = 'yes';
  const { width, height } = window.screen;
  const leftPosition = width ? (width - w) / 2 : 0;
  const topPosition = height ? (height - h) / 2 : 0;
  const settings = `height=${h},width=${w},top=${topPosition},left=${leftPosition},scrollbars=${scroll},resizable`;
  window.open(url, '', settings);
};

const SocialShareActions: React.FC<SocialShareActionsProps> = ({
  inviteLink = '',
  inviteCode = '',
  onDownload,
  className,
  shareText: customShareText
}) => {
  const t = useFm();

  const shareText = customShareText || t('inviteShareText').replace('{code}', inviteCode);

  const handleCopyLink = () => {
    copy(inviteLink);
    message.success(t('copyTips'));
  };

  const handleShare = (platform: keyof typeof SOCIAL_SHARE_URL) => {
    const baseUrl = SOCIAL_SHARE_URL[platform];
    if (!baseUrl) return;

    const encodedText = encodeURIComponent(shareText);
    const urlParam = platform === 'facebook' ? 'u' : 'url';
    const shareUrl = `${baseUrl}?${urlParam}=${inviteLink}&text=${encodedText}`;

    popupNewWindow(shareUrl);
  };


  const renderActionItem = (
    icon: string,
    label: string,
    onClick: () => void,
    hasBrandBg?: boolean,
    iconSize?: string
  ) => {
    // 如果没有指定 iconSize，图片填充整个容器
    // 如果指定了 iconSize，在移动端需要放大 (36/28 ≈ 1.29倍)
    const getIconStyle = () => {
      if (!iconSize) return undefined;

      const [width, height] = iconSize.split(' ');
      const widthNum = parseFloat(width);
      const heightNum = parseFloat(height);

      // 使用 CSS 变量来处理响应式
      return {
        width,
        height,
        '--mobile-width': `${widthNum * 1.5}px`,
        '--mobile-height': `${heightNum * 1.5}px`
      } as React.CSSProperties;
    };

    return (
      <div
        className="flex flex-col items-center cursor-pointer gap-2 flex-1 max-md:flex-[0_0_auto] max-md:min-w-0"
        onClick={onClick}
      >
        <div
          className={cls(
            'w-7 h-7 rounded-full flex justify-center items-center shrink-0 max-md:w-9 max-md:h-9 mb-2 md:mb-0',
            hasBrandBg ? 'bg-[var(--fill-button-brand-default,#abe127)]' : 'bg-transparent'
          )}
        >
          <img
            src={icon}
            alt={label}
            className={cls(
              'object-contain',
              iconSize ? 'max-md:[width:var(--mobile-width)] max-md:[height:var(--mobile-height)]' : 'w-full h-full'
            )}
            style={getIconStyle()}
          />
        </div>
        <div className="text-[var(--text-primary,#f5f5f5)] text-xs font-normal leading-[18px] text-center max-w-[64px] break-words max-md:hidden">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className={cls('py-4 md:py-6 px-4 rounded-xl bg-[var(--bg-secondary,#1d1d1d)]', className)}>
      <div
        className={cls(
          'flex justify-between items-start',
          'max-md:justify-start max-md:gap-5 max-md:overflow-x-auto max-md:pb-1',
          'max-md:[&::-webkit-scrollbar]:h-1 max-md:[&::-webkit-scrollbar-thumb]:bg-white/20'
        )}
      >
        {renderActionItem(DownloadIcon, t('save-image'), onDownload, true, '24px 24px')}
        {renderActionItem(CopyLinkIcon, t('copy-link'), handleCopyLink, true, '20px 14px')}
        {renderActionItem(XIcon, 'X', () => handleShare('x'))}
        {renderActionItem(TelegramIcon, 'Telegram', () => handleShare('telegram'))}
        {renderActionItem(FacebookIcon, 'Facebook', () => handleShare('facebook'))}
        {renderActionItem(InstagramIcon, 'Instagram', () => handleShare('instagram'))}
        {renderActionItem(DiscordIcon, 'Discord', () => handleShare('discord'))}
        {renderActionItem(MediumIcon, 'Medium', () => handleShare('medium'))}
      </div>
    </div>
  );
};

export default SocialShareActions;
