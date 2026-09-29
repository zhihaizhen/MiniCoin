import React, { memo, useState } from 'react';
import type { MouseEvent } from 'react';
import Image from 'next/image';
import BigNumber from 'bignumber.js';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getSymbolUrl, goPage, isMobile } from '@better-bit-fe/base-utils';
import LoanModal from '~/components/Common/LoanModal';
import type { BorrowCoinConfig } from '~/interface';
import { ReactComponent as QuickIcon } from '~/public/images/loan/quick.svg';

interface OnchainProductItemProps {
  item: BorrowCoinConfig;
  hiddenColumns?: number[];
  from?: string;
}

interface InterestRateProps {
  precision: number;
  hourRate: BigNumber.Value;
  rate: BigNumber.Value;
}


const formatDecimal = (value: BigNumber.Value, precision: number) =>
  new BigNumber(value)
    .decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat()
    .toString();

const formatAnnualRate = (rate: BigNumber.Value, precision: number) =>
  formatDecimal(new BigNumber(rate).times(100), precision);

const InterestRate = ({ hourRate, rate, precision }: InterestRateProps) => (
  <div className="font-base flex justify-start items-center gap-1">
    <span className="text-text-secondary">
      {formatAnnualRate(hourRate, precision)}%
    </span>
    <span>/</span>
    {formatAnnualRate(rate, precision)}%
  </div>
);

const LoanProductItem = memo(
  ({ item, hiddenColumns, from }: OnchainProductItemProps) => {
    const t = useFm();
    const { isLogin } = useUserInfo();
    const [showModal, setShowModal] = useState(false);
    const precision = Number(item.precision_digits);

    const isColVisible = (col: number) => !hiddenColumns?.includes(col);

    const handleLoan = (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (!isLogin) {
        goPage('login');
        return;
      }

      if (isMobile()) {
        goPage('download');
        return;
      }

      setShowModal(true);
    };

    return (
      <>
        <div
          className={`${from === 'material' ? 'min-h-[80px] text-sm border-b-[0.5px] border-line-border-default rounded-none' : 'min-h-[60px] text-base'} flex justify-between items-center gap-4 text-text-primary font-medium px-2 py-6 rounded-lg hover:bg-(--fill-fill-hover-1,#F5F5F5) md:col-span-full md:grid md:grid-cols-subgrid`}
        >
          {isColVisible(1) && (
            <div className="flex justify-start items-center gap-2 ">
              <Image
                src={getSymbolUrl(item.coin)}
                alt={item.coin}
                width={from === 'material' ? 20 : 24}
                height={from === 'material' ? 20 : 24}
                loader={({ src }) => src}
              />
              <span className={from === 'material' ? '' : 'text-base font-bold'}>{item.coin}</span>
            </div>
          )}

          {isColVisible(2) && (
            <div className="block font-base">
              {formatDecimal(item.individual_cap, precision)}
            </div>
          )}
          {isColVisible(3) && (
            <div className="block font-base">
              {formatDecimal(item.min_investment_quota, precision)}
            </div>
          )}
          {isColVisible(4) && (
            <InterestRate
              hourRate={item.hour_liquid_fixed_interest_rate}
              rate={item.liquid_fixed_interest_rate}
              precision={precision}
            />
          )}
          {isColVisible(5) && (
            <InterestRate
              hourRate={item.hour_days_7_interest_rate}
              rate={item.days_7_interest_rate}
              precision={precision}
            />
          )}
          {isColVisible(6) && (
            <InterestRate
              hourRate={item.hour_days_30_interest_rate}
              rate={item.days_30_interest_rate}
              precision={precision}
            />
          )}
          {isColVisible(7) && (
            <div className="hidden md:flex justify-end">
              <div
                className="min-w-[100px] w-fit h-8 select-none px-[22px] flex items-center text-sm font-medium justify-center cursor-pointer rounded-lg text-nowrap bg-text-brand-default-web hover:bg-fill-button-brand-hover text-black"
                onClick={handleLoan}
              >
                <QuickIcon className="mr-1" />
                {t('loan')}
              </div>
            </div>
          )}
        </div>
        <LoanModal
          coinConfig={item}
          open={showModal}
          close={() => setShowModal(false)}
        />
      </>
    );
  }
);

LoanProductItem.displayName = 'LoanProductItem';
export default LoanProductItem;
