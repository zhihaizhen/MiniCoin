import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import LoanList from '~/components/Loan/LoanList';
import CoinSearchSelect from '~/components/Common/CoinSearchSelect';
import PledgeList from '~/components/Loan/PledgeList';
import { useLoanCoinData } from '~/context/LoanCoinDataContext';

const ACTIVE_KEYS = ['loan', 'pledge'] as const;
type ActiveKey = typeof ACTIVE_KEYS[number];

const Material: React.FC = () => {

  const t = useFm();
  const router = useRouter();
  const [activeKey, setActiveKey] = useState<ActiveKey>('loan');
  const { setFilterCoin } = useLoanCoinData();

  useEffect(() => {
    if (!router.isReady) return;

    const queryActiveKey = router.query.tab;
    const nextActiveKey = Array.isArray(queryActiveKey)
      ? queryActiveKey[0]
      : queryActiveKey;

    if (ACTIVE_KEYS.includes(nextActiveKey as ActiveKey)) {
      setActiveKey(nextActiveKey as ActiveKey);
    }
  }, [router.isReady, router.query.tab]);

  const handleActiveKeyChange = (key: ActiveKey) => {
    setActiveKey(key);
    void router.replace(
      {
        pathname: `${basePath || ''}${router.pathname}`,
        query: {
          ...router.query,
          tab: key
        }
      },
      undefined,
      { shallow: true }
    );
  };

  const items = useMemo(() => [
    {
      key: 'loan',
      label: t('loan.coins', '借贷币种')
    },
    {
      key: 'pledge',
      label: t('loan.pledge', '质押币种')
    },
  ], [t]);

  return (
    <div className="max-w-[1200px] mx-auto md:py-10 px-4 md:px-0">
      <div className="flex items-center gap-1 text-xs text-text-secondary mb-10">
        <span
          className="cursor-pointer hover:text-text-primary"
          onClick={() => goPage('loan')}
        >
          {t('earn.loan', '质押借币')}
        </span>
        <span>/</span>
        <span className="text-text-primary">{t('loan.information', '借贷资料')}</span>
      </div>
      <h1 className="text-text-primary font-bold text-[20px]"> {t('loan.information', '借贷资料')}</h1>
      <div className="flex flex-col md:flex-row justify-between gap-6 overflow-x-auto scrollbar-hide mt-6">

        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <div
                key={item.key}
                onClick={() => handleActiveKeyChange(item.key as ActiveKey)}
                className={`cursor-pointer py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-fill-button-brand-default text-text-brand-default'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        <CoinSearchSelect onChange={setFilterCoin} className="w-40 md:w-[220px] h-9!" />

      </div>

      {activeKey === 'loan' && (
        <LoanList hiddenColumns={[7]} from={'material'} />
      )}
      {activeKey === 'pledge' && (
        <PledgeList />
      )}

    </div>
  )
}

export default Material;
