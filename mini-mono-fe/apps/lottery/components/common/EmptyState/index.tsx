import React from 'react';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';

interface EmptyStateProps {
  title?: string;
  type?: string;
  description?: string;
  isBlock?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  type,
  description,
  isBlock
}) => {
  const t = useFm();
  const toTrade = () => {
    if (isBlock) {
      goPage('blockTrade');
    } else {
      goPage('trade');
    }
  };
  if (type === 'red') {
    return (
      <div className="w-full md:w-auto md:min-w-[960px] flex flex-col items-center justify-center py-[50px] md:py-[100px]">
        <div className={`relative w-[80px] h-[80px] md:w-[84px] md:h-[84px] flex items-center justify-center`}>
          <ExportedImage
            src={`${basePath}/images/red-empty.png`}
            alt="empty"
            fill
          />
        </div>
        {/* 空状态文字 */}
        <div className="text-xs font-semibold leading-5 text-text-secondary mt-2">
          {title}
        </div>

      </div>
    )
  }
  return (
    <div className="w-full md:w-auto md:min-w-[960px] flex flex-col items-center justify-center border border-white/20 rounded-[20px] py-[50px] md:py-[100px]">
      {/* 空状态图标 */}
      <div className={`relative w-20 h-20 md:w-[120px] md:h-[120px] flex items-center justify-center`}>
        <ExportedImage
          src={`${basePath}/images/empty.png`}
          alt="empty"
          fill
        />
      </div>
      {/* 空状态文字 */}
      <div className="text-lg md:text-[20px] font-semibold leading-5 text-white mt-4">
        {title}
      </div>
      <p className="text-sm md:text-base text-text-secondary mt-2">
        {isBlock ? t('trade-block-get-lucky') : t('trade-get-lucky')}
      </p>
      <div className="min-w-[200px] md:min-w-60 h-12 flex justify-center items-center text-black text-[16px] md:text-base font-semibold mt-6
            rounded-full border border-line-border-default ] bg-fill-button-green-default shadow-[0_1px_16px_6px_rgba(142,184,39,0.3)] cursor-pointer hover:opacity-90"
           onClick={toTrade}
      >
         {isBlock ? t('go-block-trade'): t('go-trade')}
      </div>
    </div>
  );
};

export default EmptyState;
