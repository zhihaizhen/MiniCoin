import { useState, useEffect } from 'react';
import { getAuditDatesList } from '../../api';

/**
 * 审计日期选项的 hook
 * @returns 审计日期选项数组和加载状态
 */
export function useAuditDateOptions() {
  const [auditDates, setAuditDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditDates = async () => {
      try {
        setLoading(true);
        const res = await getAuditDatesList();
        setAuditDates(res);
      } catch (err) {
        console.error('Failed to fetch audit dates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditDates();
  }, []);

  return {
    auditDates,
    loading
  };
}
