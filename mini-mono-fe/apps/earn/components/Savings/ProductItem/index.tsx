import React, { useMemo, useState, memo } from 'react';
import Image from 'next/image';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import SavingsPrdGroup from '~/components/Savings/ProductItem/PrdGroup';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as DownIcon } from '~/public/images/down.svg';
import { ReactComponent as UpIcon } from '~/public/images/up.svg';
import { ReactComponent as DownSolidIcon } from '~/public/images/arrow-down-solid.svg';
import { ProductGroupProps } from '~/interface';
import { getCategoryAndAprRange } from '~/utils';

export interface ItemProps {
  coin: string;
  product_collections: Array<ProductGroupProps>;
}

interface ProductItemProps {
  prd: ItemProps;
}

const ProductItem = memo(({ prd }: ProductItemProps) => {
  const t = useFm();
  const [isGroupVisible, setIsGroupVisible] = useState(false);

  const { categoryLabel, aprRangeLabel } = useMemo(() => {
    return getCategoryAndAprRange(
      prd.product_collections as ProductGroupProps[] | undefined,
      {
        fixed: t('fixed'),
        liquid: t('liquid')
      }
    );
  }, [prd.product_collections, t]);

  return (
    <div>
      <div
        className="min-h-[60px] py-4 mb-3 flex justify-between items-center md:grid grid-cols-[1fr_2fr_3fr_1fr] gap-4 text-text-primary text-base font-medium rounded-lg hover:bg-(--fill-fill-hover-1,#F5F5F5)">
        <div className="flex justify-start items-center gap-2 text-base">
          <Image
            src={getSymbolUrl(prd.coin)}
            alt={prd.coin}
            width={40}
            height={40}
            loader={({ src }) => src}
          />
          <span className="flex-1">{prd.coin}</span>
        </div>
        <div className="hidden md:block">{aprRangeLabel}</div>
        <div
          className="md:hidden flex items-center gap-1 text-text-primary"
          onClick={() => setIsGroupVisible((visible) => !visible)}
        >
          {aprRangeLabel} <DownSolidIcon />
        </div>
        <div className="font-medium hidden md:block">{categoryLabel}</div>
        <div className="hidden md:flex justify-end">
          <div
            className="min-w-[100px] w-fit h-8 text-sm font-medium select-none px-[22px] flex items-center justify-center gap-2 cursor-pointer rounded-lg
             bg-text-brand-default-web hover:bg-fill-button-brand-hover text-nowrap"
            onClick={() => setIsGroupVisible((visible) => !visible)}
          >
            {t(isGroupVisible ? 'hide' : 'subscribe')}
            {isGroupVisible ? <UpIcon /> : <DownIcon />}
          </div>
        </div>
      </div>
      {isGroupVisible &&
        prd.product_collections.map(
          (group: ProductGroupProps, index: number) => (
            <SavingsPrdGroup key={group.product_tag + index} group={group} />
          )
        )}
    </div>
  );
});

ProductItem.displayName = 'SavingsProductItem';

export default ProductItem;
