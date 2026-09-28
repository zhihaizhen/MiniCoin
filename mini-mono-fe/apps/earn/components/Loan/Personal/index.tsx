import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { goPage, basePath } from '@better-bit-fe/base-utils';
import { ReactComponent as RightArrowIcon } from '~/public/images/right-arrow.svg';
import { ReactComponent as MarketwIcon } from '~/public/images/loan/market.svg';
import { ReactComponent as HistoryIcon } from '~/public/images/loan/history.svg';
import LoanAssets from '~/components/Loan/LoanAssets';
import InprogressOrders from '~/components/Loan/InprogressOrders';
import { useLoanCoinData } from '~/context/LoanCoinDataContext';

const ACTIVE_KEYS = ['inprogressorders', 'loanasset'] as const;
type ActiveKey = typeof ACTIVE_KEYS[number];

const Personal: React.FC = () => {
  const t = useFm();
  const router = useRouter();
  const { loanAssetOverview } = useLoanCoinData();
  const currentLoanNum = loanAssetOverview.running_order_count || 0;

  const [activeKey, setActiveKey] = useState<ActiveKey>('inprogressorders');

  useEffect(() => {
    if (!router.isReady) return;

    const queryActiveKey = router.query.activeKey;
    const nextActiveKey = Array.isArray(queryActiveKey)
      ? queryActiveKey[0]
      : queryActiveKey;

    if (ACTIVE_KEYS.includes(nextActiveKey as ActiveKey)) {
      setActiveKey(nextActiveKey as ActiveKey);
    }
  }, [router.isReady, router.query.activeKey]);

  const handleActiveKeyChange = (key: ActiveKey) => {
    setActiveKey(key);
  };

  const items = useMemo(
    () => [
      {
        key: 'inprogressorders',
        label: `${t('loan.inprogressorders', '进行中订单')}(${currentLoanNum})`
      },
      {
        key: 'loanasset',
        label: t('loan.asset', '借贷资产')
      }
    ],
    [t, currentLoanNum]
  );

  return (
    <div className="max-w-[1200px] mx-auto md:py-10 px-4 md:px-0">
      <div className="flex justify-between items-center mb-6">
        <div
          className="flex items-center gap-2 cursor-pointer text-lg text-text-primary font-bold"
          onClick={() => goPage('loan')}
        >
          <RightArrowIcon className="rotate-180" />
          {t('loan.market', '借贷市场')}
        </div>
        <div className="flex items-center gap-6 text-text-secondary text-sm">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => goPage('loanBorrowHistory')}
          >
            <HistoryIcon /> {t('loan.history', '借贷历史')}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => goPage('loanMaterial')}
          >
            <MarketwIcon /> {t('loan.information', '借贷资料')}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-text-primary text-2xl font-bold leading-[52px] text-center md:text-left">
          {t('loan.effective', '有效借贷')}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide mt-6">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <div
              key={item.key}
              onClick={() => handleActiveKeyChange(item.key as ActiveKey)}
              className={`cursor-pointer text-base font-medium border-b-2 transition-colors duration-200 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-fill-button-primary-default text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {item.label}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        {activeKey === 'inprogressorders' && <InprogressOrders />}
        {activeKey === 'loanasset' && <LoanAssets />}
      </div>
    </div>
  );
};

export default Personal;
