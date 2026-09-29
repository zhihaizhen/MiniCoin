import React, { useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';
import EmptyState from '~/components/Common/EmptyState';
import Loading from '~/components/Common/Loading';
import Item from './Item';
import { useLoanCoinData } from '~/context/LoanCoinDataContext';

const PledgetList: React.FC = () => {
  const t = useFm();
  const { pledgeCoinList, isLoading } = useLoanCoinData();
  const [isMore, setIsMore] = useState(false);

  const displayList = isMore ? pledgeCoinList : pledgeCoinList.slice(0, 10);

  const gridStyle = { gridTemplateColumns: `repeat(5, minmax(max-content, 1fr))` };

  return (
    <div className="w-full mt-6 md:mt-0">
      <div className="md:grid md:gap-4 mt-6" style={gridStyle}>
        <div className="grid h-16 gap-4 text-text-tertiary text-xs leading-16 bg-bg-secondary px-2 md:col-span-full md:grid-cols-subgrid">
          <div>{t('loan.pledge')}</div>
          <div>{t('loan.initial_pledge_rate')}</div>
          <div>{t('loan.early_warning_pledge_rate')}</div>
          <div>{t('loan.force_liquidate_pledge_rate')}</div>
          <div>{t('loan.individual_cap')}</div>
        </div>

        {isLoading ? (
          <div className="md:col-span-full"><Loading /></div>
        ) : !pledgeCoinList.length ? (
          <div className="md:col-span-full"><EmptyState /></div>
        ) : (
          displayList.map((item, index) => (
            <Item key={`${item.coin}-${index}`} item={item} />
          ))
        )}
      </div>

      {pledgeCoinList.length > 10 && (
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

export default PledgetList;
