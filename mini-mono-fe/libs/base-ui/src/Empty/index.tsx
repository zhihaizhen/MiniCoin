import React from 'react';
import Image from 'next/image';
import { useFm } from '@better-bit-fe/base-hooks';

interface EmptyProps {
  /** 图标图片完整 src 路径，由调用方自行拼接（如 `${basePath}/images/noData.png`） */
  icon?: string;
  /** 图标尺寸：large = 80×80，small = 64×64，默认 'large' */
  size?: 'large' | 'small';
  /** 主标题多语言 key，经 useFm() 翻译后展示 */
  title?: string;
  /** 副标题多语言 key（可选） */
  subtitle?: string;
  /** 描述文字多语言 key，颜色较浅（可选） */
  description?: string;
  /** 一级按钮文案多语言 key，深色背景（可选） */
  primaryBtnText?: string;
  /** 一级按钮点击回调 */
  onPrimaryClick?: () => void;
  /** 三级按钮文案多语言 key，浅色背景（可选） */
  tertiaryBtnText?: string;
  /** 三级按钮点击回调 */
  onTertiaryClick?: () => void;
  /** 外层容器自定义 class，用于控制外边距等，替代旧版 py 参数 */
  className?: string;
}

const sizeMap = {
  large: { width: 80, height: 80 },
  small: { width: 64, height: 64 }
};

const Empty: React.FC<EmptyProps> = ({
  icon,
  size = 'large',
  title,
  subtitle,
  description,
  primaryBtnText,
  onPrimaryClick,
  tertiaryBtnText,
  onTertiaryClick,
  className
}) => {
  const t = useFm();
  const { width, height } = sizeMap[size];
  const hasText = title || subtitle || description;
  const hasBtn = primaryBtnText || tertiaryBtnText;

  return (
    <div className={`flex flex-col items-center justify-center gap-2${className ? ` ${className}` : ''}`}>
      {icon && (
        <Image src={icon} alt="empty" width={width} height={height} unoptimized />
      )}
      {(hasText || hasBtn) && (
        <div className="flex flex-col items-center gap-3">
          {hasText && (
            <div className="flex flex-col items-center gap-1">
              {title && (
                <span className="text-sm font-bold leading-[18px] text-[var(--text-primary,#101112)] whitespace-nowrap">
                  {t(title)}
                </span>
              )}
              {subtitle && (
                <span className="text-xs font-medium leading-4 text-[var(--text-primary,#101112)] whitespace-nowrap">
                  {t(subtitle)}
                </span>
              )}
              {description && (
                <span className="text-xs font-normal leading-4 text-[var(--text-secondary,#808588)] whitespace-nowrap">
                  {t(description)}
                </span>
              )}
            </div>
          )}
          {hasBtn && (
            <div className="flex flex-col gap-2 items-stretch">
              {primaryBtnText && (
                <button
                  className="flex items-center justify-center h-8 px-4 rounded-lg border-0 cursor-pointer text-xs font-medium leading-4 whitespace-nowrap bg-[var(--fill-button-primary-default,#101112)] text-[var(--text-white-to-back,#fff)] hover:opacity-85"
                  onClick={onPrimaryClick}
                >
                  {t(primaryBtnText)}
                </button>
              )}
              {tertiaryBtnText && (
                <button
                  className="flex items-center justify-center h-8 px-4 rounded-lg border-0 cursor-pointer text-xs font-medium leading-4 whitespace-nowrap bg-[var(--fill-button-tertiary-default-app,#f5f5f5)] text-[var(--text-primary,#101112)] hover:opacity-85"
                  onClick={onTertiaryClick}
                >
                  {t(tertiaryBtnText)}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Empty;
