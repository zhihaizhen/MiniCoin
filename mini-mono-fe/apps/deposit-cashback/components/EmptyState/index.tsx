import React from 'react';
import Image from 'next/image';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description
}) => {
  const t = useFm();
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-1">
      {/* 空状态图标 */}
      <div className={`w-20 h-20 mb-1 flex items-center justify-center`}>
        <Image
          src={`${basePath}/images/empty.png`}
          alt="empty"
          width={80}
          height={80}
          unoptimized
        />
      </div>
      {/* 空状态文字 */}
      <div className="text-sm leading-5 text-text-primary">
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
