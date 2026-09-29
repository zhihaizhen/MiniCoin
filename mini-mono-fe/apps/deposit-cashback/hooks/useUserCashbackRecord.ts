import { useState, useEffect } from 'react';
import { getUserCashbackRecord } from '../api';

export interface UserCashbackItem {
  id: number;
  currency: string;
  amount: number;
  cashback_time: number; // utc0秒级时间戳
}

export function useUserCashbackRecord() {
  const [userCashbackRecord, setUserCashbackRecord] = useState<UserCashbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCashbackRecord = async () => {
      try {
        setLoading(true);
        const res = await getUserCashbackRecord({
          page_num: 1,
          page_size: 50
        });
        setUserCashbackRecord(res?.records || []);
      } catch (err) {
        console.error('Failed to fetch user cashback record:', err);
        setUserCashbackRecord([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCashbackRecord();
  }, []);

  return {
    userCashbackRecord,
    loading
  };
}
