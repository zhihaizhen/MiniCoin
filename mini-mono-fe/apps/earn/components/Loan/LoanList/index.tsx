import React, { useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';
import EmptyState from '~/components/Common/EmptyState';
import Loading from '~/components/Common/Loading';
import LoanProductItem from './Item';
import { useLoanCoinData } from '~/context/LoanCoinDataContext';
import EarnTooltip from '~/components/Common/EarnTooltip';

interface LoanProductListProps {
  from?: string;
  hiddenColumns?: number[]; // 1-based: 1=coin,2=personalLimit,3=singleLimit,4=flexible,5=7d,6=30d,7=action
}

const LoanList: React.FC<LoanProductListProps> = ({ hiddenColumns, from }) => {
  const t = useFm();
  const { borrowCoinList, isLoading } = useLoanCoinData();
  const [isMore, setIsMore] = useState(false);

  const isColVisible = (col: number) => !hiddenColumns?.includes(col);
  const visibleCount = [1, 2, 3, 4, 5, 6, 7].filter(isColVisible).length;
  const gridStyle = { gridTemplateColumns: `repeat(${visibleCount}, minmax(max-content, 1fr))` };

  const displayList = isMore ? borrowCoinList : borrowCoinList.slice(0, 10);

  return (
    <div className="w-full mt-6 md:mt-0">
      <div className="md:grid md:gap-4 mt-6" style={gridStyle}>
        <div className={`grid h-16 gap-4 text-text-tertiary text-xs font-normal leading-16 bg-bg-secondary px-2 md:col-span-full md:grid-cols-subgrid`}>
          {isColVisible(1) && <div>{t('loan.enablecoin')}</div>}
          {isColVisible(2) && <div>{t('loan.personalLimit')}</div>}
          {isColVisible(3) && <div>{t('loan.singleLimit')}</div>}
          {isColVisible(4) && (
            <div className="leading-4 flex flex-col justify-center items-start gap-0.5">
              <div className="text-text-primary text-xs">
                <EarnTooltip title={t('loan_days_0_tip')} titleClassName="text-white">
                  {t('loan_days_0')}
                </EarnTooltip>
              </div>
              <div>{t('hour-rate')}</div>
            </div>
          )}
          {isColVisible(5) && (
            <div className="leading-4 flex flex-col justify-center items-start gap-0.5">
              <div className="text-text-primary text-xs">
                <EarnTooltip title={t('loan_days_30_tip')} titleClassName="text-white">
                  {t('loan_days_7')}
                </EarnTooltip>
              </div>
              <div>{t('hour-rate')}</div>
            </div>
          )}
          {isColVisible(6) && (
            <div className="leading-4 flex flex-col justify-center items-start gap-0.5">
              <div className="text-text-primary text-xs">
                <EarnTooltip title={t('loan_days_30_tip')} titleClassName="text-white">
                  {t('loan_days_30')}
                </EarnTooltip>
              </div>
              <div>{t('hour-rate')}</div>
            </div>
          )}
          {isColVisible(7) && <div className="text-right hidden md:block">{t('action', '操作')}</div>}
        </div>

        {isLoading ? (
          <div className="md:col-span-full"><Loading /></div>
        ) : !borrowCoinList.length ? (
          <div className="md:col-span-full"><EmptyState /></div>
        ) : (
          displayList.map((item, index) => (
            <LoanProductItem key={`${item.coin}-${index}`} item={item} hiddenColumns={hiddenColumns} from={from} />
          ))
        )}
      </div>

      {borrowCoinList.length > 10 && (
        <div className="flex justify-center items-center text-sm text-text-brand-default-web mt-6">
          <div className="cursor-pointer flex items-center gap-1" onClick={() => setIsMore((v) => !v)}>
            {isMore ? (
              <>{t('hide')} <LessIcon className="text-xl" /></>
            ) : (
              <>{t('more')} <MoreIcon className="text-xl" /></>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanList;
