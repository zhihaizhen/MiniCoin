import React, { useEffect, useState, memo } from 'react';
import Image from 'next/image';
import { getSymbolUrl, isMobile } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { ISimpleEarnProduct, ProductGroupProps } from '~/interface';
import { Switch } from 'antd';
import { formatApr } from '~/utils';

interface SimpleProductItemProps {
  prd: ISimpleEarnProduct;
  onSwitch: (checked: boolean) => void;
}

const SimpleProductItem = memo(({ prd, onSwitch }: SimpleProductItemProps) => {
  const [aprRange, setAprRange] = useState<string>('');

  const handleItemSwitch = (checked: boolean) => {
    onSwitch(checked);
  };

  const [isH5, setIsH5] = useState(false);

  useEffect(() => {
    setIsH5(!!isMobile());
  }, []);

  useEffect(() => {
    const minApr = prd.min_apr
    const maxApr = prd.max_apr
    // 生成利率范围标签
    const isValidRange = +minApr !== Infinity && +maxApr !== -Infinity;
    const aprRangeLabel = !isValidRange
      ? '-'
      : minApr === maxApr
        ? formatApr(minApr)
        : `${formatApr(minApr)} ~ ${formatApr(maxApr)}`;
    setAprRange(aprRangeLabel);
  }, [prd]);

  return (
    <div>
      <div className="h-[44px] md:h-auto md:min-h-[60px] py-4 mb-3 md:px-2 px-[14px] flex justify-between items-center md:grid md:grid-cols-[2fr_3fr] gap-4 text-text-primary text-base font-medium
         rounded-lg hover:bg-(--fill-fill-hover-1,#F5F5F5) border md:border-none border-solid border-line-border-default ">
        <div className="flex justify-start items-center gap-2 text-sm md:text-base font-medium">
          <Image
            src={getSymbolUrl(prd.coin)}
            alt={prd.coin}
            width={isH5 ? 22 : 24}
            height={isH5 ? 22 : 24}
            loader={({ src }) => src}
          />
          <span className="flex-1">{prd.coin}</span>
        </div>
        <div className="flex items-center gap-14 md:grid grid-cols-[3fr_1fr] ">
          <div>{aprRange}</div>
          <div className="flex justify-end">
            <Switch className="hidden! md:block! custom-big-switch" checked={prd?.auto_renew} onChange={handleItemSwitch} />
            <Switch className="custom-small-switch md:hidden!" checked={prd?.auto_renew} onChange={handleItemSwitch} />
          </div>
        </div>
      </div>
    </div>
  );
});

SimpleProductItem.displayName = 'SimpleProductItem';

export default SimpleProductItem;
