import React, { memo } from 'react';
import Image from 'next/image';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import {  PledgeCoinConfig } from '~/interface';
import BigNumber from 'bignumber.js';

interface PledgeItemProps {
  item: PledgeCoinConfig;
}
const formatDecimal = (value: BigNumber.Value, precision: number) =>
  new BigNumber(value)
    .decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat()
    .toString();

const formatAnnualRate = (rate: BigNumber.Value, precision: number) =>
  formatDecimal(new BigNumber(rate).times(100), precision);

const PledgeItem = memo(({ item }: PledgeItemProps) => {

  return (
    <>
      <div
        className="min-h-[80px] flex justify-between items-center gap-4 text-text-primary text-sm font-medium px-2 py-4 md:py-0
        hover:bg-(--fill-fill-hover-1,#F5F5F5) border-b-[0.5px] border-line-border-default md:col-span-full md:grid md:grid-cols-subgrid"
      >
        <div className="flex justify-start items-center gap-2 text-base">
          <Image
            src={getSymbolUrl(item.coin)}
            alt={item.coin}
            width={20}
            height={20}
            loader={({ src }) => src}
          />
          <div className="flex items-center gap-1">
            <span>{item.coin}</span>
          </div>
        </div>
        <div> {formatAnnualRate(+item.initial_pledge_rate, +item.precision_digits)} % </div>
        <div> {formatAnnualRate(+item.early_warning_pledge_rate, +item.precision_digits)} % </div>
        <div> {formatAnnualRate(+item.force_liquidate_pledge_rate, +item.precision_digits)} % </div>
        <div> {new BigNumber(+item.individual_cap).toFormat()} </div>
      </div>
    </>
  );
});
PledgeItem.displayName = 'PledgeItem';
export default PledgeItem;
