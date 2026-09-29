import React, { memo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import { TagEnum } from '~/enums';


interface Props {
  prd: {
    product_type: string
    product_tag: string
  }
}
const ProductTag = memo(({ prd }: Props) => {
  const t = useFm();

  const baseTagClasses = 'text-[10px] leading-4 px-1 flex items-center justify-center gap-0.5 border font-medium rounded-sm mr-1';
  const greenTagClasses = `${baseTagClasses} text-text-brand-default-web border-text-brand-default`;
  const redTagClasses = `${baseTagClasses} text-text-red border-text-red`;

  if (!prd) return <div className="h-5" />;
  if (prd.product_tag === TagEnum.NEWBIE) {
    return (
      <div className="bg-text-brand-default-web text-black px-1 py-0.5 text-[10px] rounded-sm">
        {t('newbie')}
      </div>
    )
    // return (
    //   <div className={greenTagClasses}>
    //   <Image
    //       src={`${basePath}/images/newer.png`}
    //       alt="new"
    //       width={14}
    //       height={14}
    //       loader={({ src }) => src}
    //     />
    //     {t('newer')}
    //   </div>
    // );
  }
  if (prd.product_type === TagEnum.RUSH) {
    return (
      <div className={redTagClasses}>
      <Image
          src={`${basePath}/images/hot.png`}
          alt="new"
          width={14}
          height={14}
          loader={({ src }) => src}
        />
        {t('rush')}
      </div>
    );
  }
  if (prd.product_type === TagEnum.DEFI) {
    return (
      <div className="flex items-center justify-center">
        <div className={greenTagClasses}>
          DeFi
        </div>
        <div className={greenTagClasses}>
        {t('reward')}
        </div>
      </div>

    );
  }
  return <div className="h-5" />;
});

ProductTag.displayName = 'ProductTag';

export default ProductTag;
