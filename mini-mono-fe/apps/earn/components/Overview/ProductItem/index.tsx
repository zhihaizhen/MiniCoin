import React, { useMemo, useState, memo } from 'react';
import Image from 'next/image';
import BigNumber from 'bignumber.js';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import PrdGroup from '~/components/Overview/ProductItem/PrdGroup';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as UpIcon } from '~/public/images/up.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/images/arrow-down.svg';
import { ProductGroupProps } from '~/interface';
import { getCategoryAndAprRange } from '~/utils';
import { rotate } from 'next/dist/server/lib/squoosh/impl';

export interface ItemProps {
  coin: string;
  spot_amount?: number;
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
        className="min-h-[60px] flex justify-between items-center md:grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 text-text-primary text-base px-2
          cursor-pointer font-medium rounded-lg hover:bg-(--fill-fill-hover-1,#F5F5F5) py-4 mb-3"
        onClick={() => setIsGroupVisible((visible) => !visible)}>
        <div className="flex justify-start items-center gap-2 text-base">
          <Image
            src={getSymbolUrl(prd.coin)}
            alt={prd.coin}
            width={40}
            height={40}
            loader={({ src }) => src}
          />
          <div className="flex-1">
            <div>{prd.coin} </div>
            {
              isGroupVisible && prd.spot_amount > 0 &&
              <div className="text-text-secondary text-sm font-normal">
                {t('spot_free_amount')}: { new BigNumber(prd.spot_amount).decimalPlaces(8).toFormat()  }</div>
            }
          </div>
        </div>
        <div className="hidden md:block">{!isGroupVisible && aprRangeLabel}</div>
        <div
          className="md:hidden flex items-center gap-1 text-text-primary"
          onClick={() => setIsGroupVisible((visible) => !visible)}
        >
          {aprRangeLabel} <ArrowDownIcon />
        </div>
        <div className="font-medium hidden md:block">{!isGroupVisible && categoryLabel}</div>
        <div
          className="hidden md:flex items-center justify-end"
          onClick={() => setIsGroupVisible((visible) => !visible)}
        >
          {isGroupVisible ? <ArrowDownIcon className={"rotate-180"} /> : <ArrowDownIcon />}
        </div>
      </div>
      {isGroupVisible &&
        prd.product_collections.map(
          (group: ProductGroupProps, index: number) => (
            <PrdGroup key={group.product_tag + index} group={group} />
          )
        )}
    </div>
  );
});

ProductItem.displayName = 'ProductItem';

export default ProductItem;
