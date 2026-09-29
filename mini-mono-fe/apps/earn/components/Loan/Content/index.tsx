import Rules from '~/components/Common/Rules';
import React from 'react';
import StaticSection from '~/components/Common/StaticSection';
import LoanList from '~/components/Loan/LoanList';
import LoanSteps from '~/components/Loan/Steps';

import { ReactComponent as MarketIcon } from '~/public/images/loan/market.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import CoinSearchSelect from '~/components/Common/CoinSearchSelect';
import { goPage } from '@better-bit-fe/base-utils';
import { useLoanCoinData } from '~/context/LoanCoinDataContext';

const LoanContent: React.FC = () => {
  const t = useFm();
  const { setFilterCoin } = useLoanCoinData();

  return (
    <div className="max-w-[1200px] mx-auto md:py-10 px-4 md:px-0">

      <LoanSteps />

      <div className="flex flex-col md:flex-row md:justify-between items-center gap-5 md:gap-10">
        <div className="text-text-primary text-2xl font-bold leading-[52px] text-center md:text-left">
          {t('loan.market', '借贷市场')}
        </div>
        <div className="flex justify-end items-center gap-6">
          <div className="flex items-center gap-1 text-text-secondary text-sm cursor-pointer" onClick={() => goPage('loanMaterial')}>
            <MarketIcon/>
            {t('loan.information')}
          </div>
          <CoinSearchSelect onChange={setFilterCoin} />
        </div>
      </div>
      <LoanList hiddenColumns={[2,3]}/>
      <StaticSection type='loan' />
      <Rules type='loan' />
    </div>
  )
}

export default LoanContent;
