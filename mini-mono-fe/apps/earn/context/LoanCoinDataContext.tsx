import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getLoanAssetOverview, getLoanCurrency, getPledgeCurrency } from '~/api/loan';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import { BorrowCoinConfig, PledgeCoinConfig } from '~/interface';

export interface LoanAsset {
  coin: string;
  amount: string;
}

interface LoanAssetOverview {
  overdue_order_count?: number;
  running_order_count?: number;
  borrow_assets?: LoanAsset[];
  pledge_assets?: LoanAsset[];
}

interface LoanCoinDataContextType {
  borrowCoinList: BorrowCoinConfig[];
  pledgeCoinList: PledgeCoinConfig[];
  sourceBorrowCoinList: BorrowCoinConfig[];
  sourcePledgeCoinList: PledgeCoinConfig[];
  isLoading: boolean;
  loanAssetOverview: LoanAssetOverview;
  isAssetOverviewLoading: boolean;
  filterCoin: string;
  setFilterCoin: (coin: string) => void;
  refresh: () => Promise<void>;
  refreshLoanAssetOverview: () => Promise<void>;
}

const LoanCoinDataContext = createContext<LoanCoinDataContextType | undefined>(undefined);

export const LoanCoinDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLogin } = useUserInfo();
  const { refreshTrigger } = useEarnDataRefresh();
  const [sourceBorrowCoinList, setSourceBorrowCoinList] = useState<BorrowCoinConfig[]>([]);
  const [sourcePledgeCoinList, setSourcePledgeCoinList] = useState<PledgeCoinConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loanAssetOverview, setLoanAssetOverview] = useState<LoanAssetOverview>({});
  const [isAssetOverviewLoading, setIsAssetOverviewLoading] = useState(true);
  const [filterCoin, setFilterCoin] = useState<string>('');

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loanRes, pledgeRes] = await Promise.all([
        getLoanCurrency({}),
        getPledgeCurrency({})
      ]);
      setSourceBorrowCoinList(Array.isArray(loanRes.data) ? loanRes.data : []);
      setSourcePledgeCoinList(Array.isArray(pledgeRes.data) ? pledgeRes.data : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLoanAssetOverview = useCallback(async () => {
    if (!isLogin) {
      if (isLogin !== undefined) {
        setIsAssetOverviewLoading(false);
      }
      setLoanAssetOverview({});
      return;
    }

    setIsAssetOverviewLoading(true);
    try {
      const res = await getLoanAssetOverview();
      setLoanAssetOverview(res || {});
    } finally {
      setIsAssetOverviewLoading(false);
    }
  }, [isLogin]);

  const borrowCoinList = useMemo(() => {
    const normalizedFilterCoin = filterCoin.trim().toUpperCase();
    if (!normalizedFilterCoin) return sourceBorrowCoinList;
    return sourceBorrowCoinList.filter((item) => item.coin.toUpperCase() === normalizedFilterCoin);
  }, [filterCoin, sourceBorrowCoinList]);

  const pledgeCoinList = useMemo(() => {
    const normalizedFilterCoin = filterCoin.trim().toUpperCase();
    if (!normalizedFilterCoin) return sourcePledgeCoinList;
    return sourcePledgeCoinList.filter((item) => item.coin.toUpperCase() === normalizedFilterCoin);
  }, [filterCoin, sourcePledgeCoinList]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    void fetchLoanAssetOverview();
  }, [fetchLoanAssetOverview, refreshTrigger]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);
  const refreshLoanAssetOverview = useCallback(() => fetchLoanAssetOverview(), [fetchLoanAssetOverview]);

  return (
    <LoanCoinDataContext.Provider
      value={{
        borrowCoinList,
        pledgeCoinList,
        sourceBorrowCoinList,
        sourcePledgeCoinList,
        isLoading,
        loanAssetOverview,
        isAssetOverviewLoading,
        filterCoin,
        setFilterCoin,
        refresh,
        refreshLoanAssetOverview
      }}
    >
      {children}
    </LoanCoinDataContext.Provider>
  );
};

export const useLoanCoinData = () => {
  const context = useContext(LoanCoinDataContext);
  if (!context) {
    throw new Error('useLoanCoinData must be used within LoanCoinDataProvider');
  }
  return context;
};
