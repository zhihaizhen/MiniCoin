import { useState, useEffect } from 'react';
import { getReserveData } from '../../api';

// 储备金数据类型
export interface ReserveData {
  symbol: string;
  name: string;
  ratio: string;
  iconName: string;
}

/**
 * 管理储备金数据的 hook
 * @param auditDate 审计日期，用于获取对应日期的储备金数据
 * @returns 储备金数据数组和加载状态
 */
export function useReserveData(auditDate?: string) {
  const [reserveData, setReserveData] = useState<ReserveData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auditDate) return;
    const fetchReserveData = async () => {
      try {
        setLoading(true);

        const res = await getReserveData(auditDate || '');

        setReserveData(res);
      } catch (err) {
        console.error('Failed to fetch reserve data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReserveData();
  }, [auditDate]);

  return {
    reserveData,
    loading
  };
}
