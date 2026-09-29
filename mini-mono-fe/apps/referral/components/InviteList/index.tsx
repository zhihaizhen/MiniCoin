import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '~/env';
import { getUserList } from '~/api';
import type { InviteUserRecord } from '~/types';
import AppPagination from '~/components/AppPagination';
import styles from './index.module.less';

const PAGE_SIZE = 10;

function formatTime(timestamp: string) {
  if (!timestamp) return '--';
  return dayjs(Number(timestamp) * 1000).format('YYYY-MM-DD');
}

const InviteList: React.FC = () => {
  const t = useFm();
  const [records, setRecords] = useState<InviteUserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserList({ page_num: page, page_size: PAGE_SIZE });
      setRecords(res?.records || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error('getUserList error', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <section className={styles.inviteList}>
      <h2 className={styles.title}>{t('invite-user-list') || '被邀请人列表'}</h2>
      <div className={styles.scrollWrapper}>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHead}>
            <span className={styles.col}>{t('friend-id') || '好友 ID'}</span>
            <span className={styles.col}>{t('register-time') || '注册时间'}</span>
            <span className={styles.col}>{t('rebate-rate') || '反佣比例'}</span>
            <span className={styles.col}>{t('trade-status') || '是否交易'}</span>
          </div>
          {loading ? (
            <div className={styles.loadingArea}>
              <div className={styles.spinner} />
            </div>
          ) : records.length === 0 ? (
            <div className={styles.emptyArea}>
              <img className={styles.emptyImg} src={`${basePath}/image/empty.png`} alt="" />
              <span className={styles.emptyText}>{t('no-data') || '暂无数据'}</span>
            </div>
          ) : (
            <div className={styles.tableBody}>
              {records.map((record, idx) => (
                <div key={record.user_id + idx} className={styles.tableRow}>
                  <span className={styles.col}>{record.user_id}</span>
                  <span className={styles.col}>{formatTime(record.register_time)}</span>
                  <span className={styles.col}>{record.user_rebate_rate}%</span>
                  <span className={styles.col}>
                    <span className={record.user_trade_status ? styles.statusYes : styles.statusNo}>
                      {record.user_trade_status ? (t('yes') || '是') : (t('no') || '否')}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AppPagination
        current={page}
        total={total}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </section>
  );
};

export default InviteList;
