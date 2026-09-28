import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getWalletList } from '~/api';
import { useEarnDataRefresh } from '~/context/EarnDataContext';

export interface Asset {
  coin: string;
  wallet_balance: string; // 资产总额
  total_pnl: string; // 累计收益
}

interface WalletListContextType {
  assetsList: Asset[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const WalletListContext = createContext<WalletListContextType | undefined>(undefined);

export const WalletListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLogin } = useUserInfo();
  const { refreshTrigger } = useEarnDataRefresh();

  const [assetsList, setAssetsList] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletList = useCallback(async () => {
    if (!isLogin) {
      if (isLogin !== undefined) {
        setLoading(false);
      }
      setAssetsList([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getWalletList();
      setAssetsList(res?.list || []);
    } catch {
      setAssetsList([]);
    } finally {
      setLoading(false);
    }
  }, [isLogin]);

  useEffect(() => {
    void fetchWalletList();
  }, [fetchWalletList, refreshTrigger]); //refreshTrigger 更新依赖

  const refresh = useCallback(() => fetchWalletList(), [fetchWalletList]);

  return (
    <WalletListContext.Provider value={{ assetsList, loading, refresh }}>
      {children}
    </WalletListContext.Provider>
  );
};

export const useWalletList = () => {
  const context = useContext(WalletListContext);
  if (!context) {
    throw new Error('useWalletList must be used within WalletListProvider');
  }
  return context;
};
