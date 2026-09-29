import { useState, useEffect } from 'react';
import { getUserDepositList } from '../api';

export interface DepositNotification {
  user_id: string;
  amount: string;
}

export interface DepositApiResponse {
  records?: DepositNotification[];
}

/**
 * 管理充值通知数据的 hook
 * @returns 充值通知数据数组和加载状态
 */
export function useDepositData() {
  const [depositData, setDepositData] = useState<DepositNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepositData = async () => {
      try {
        setLoading(true);
        const res = await getUserDepositList({});
        setDepositData(res.records || []);
      } catch (err) {
        console.error('Failed to fetch deposit data:', err);
        setDepositData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepositData();
  }, []);

  return {
    depositData,
    loading
  };
}
