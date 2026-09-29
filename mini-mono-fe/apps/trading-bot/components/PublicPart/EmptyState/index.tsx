import React from 'react';
import Image from 'next/image';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  py?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'empty.png',
  py = 'py-16'
}) => {
  const t = useFm();
  return (
    <div className={`flex flex-col items-center justify-center ${py} gap-1`}>
      {/* 空状态图标 */}
      <div className={`w-20 h-20 mb-1 flex items-center justify-center`}>
        <Image
          src={`${basePath}/images/${icon}`}
          alt="empty"
          width={80}
          height={80}
          unoptimized
        />
      </div>
      {/* 空状态文字 */}
      <div className="text-sm leading-5 text-[var(--text-secondary,#A8AAAD)]">
        {title ? t(`${title}`) : t('default-empty-title')}
      </div>
      {description && (
        <div className="text-xs text-white/60 mt-1">
          {description}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
