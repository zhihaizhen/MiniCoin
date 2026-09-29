import React from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import { useFm } from '@better-bit-fe/base-hooks';

interface EmptyStateProps {
  title?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({title}) => {
  const t = useFm()
  return (
    <div className="w-full md:w-auto  flex flex-col items-center justify-center">
      <div className={`relative w-[80px] h-[80px] md:w-[84px] md:h-[84px] flex items-center justify-center`}>
        <Image
          src={`${basePath}/images/empty.png`}
          alt="empty"
          fill
          unoptimized
        />
      </div>
      {/* 空状态文字 */}
      <div className="text-xs font-semibold leading-5 text-text-secondary mt-2">
        {title ? title : t('no-data')}
      </div>

    </div>
  )
};

export default EmptyState;
