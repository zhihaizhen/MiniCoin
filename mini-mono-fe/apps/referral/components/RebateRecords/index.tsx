import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

import { Tooltip } from 'antd';
import { basePath } from '~/env';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as InfoIcon } from '~/public/icon/icon-guide.svg';
import { getRebateList } from '~/api';
import type { RebateRecord } from '~/types';
import AppPagination from '~/components/AppPagination';
import styles from './index.module.less';

const PAGE_SIZE = 10;


function formatTime(timestamp: string) {
  if (!timestamp) return '--';
  return dayjs(Number(timestamp) * 1000).format('YYYY-MM-DD');
}


const RebateRecords: React.FC = () => {
  const t = useFm();
  const [records, setRecords] = useState<RebateRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRebateList({
        page_num: page,
        page_size: PAGE_SIZE,
        rebate_type: 'Contract'
      });
      setRecords(res?.records || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error('getRebateList error', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);


  const rebateTypeLabel = (type: string) => {
    switch (type) {
      case 'Contract':
        return t('contract') || '合约';
      case 'Spot':
        return t('spot') || '现货';
      default:
        return type || '--';
    }
  };

  return (
    <section className={styles.rebateRecords}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{t('my-rebate-records') || '我的返佣'}</h2>
        <Tooltip
          title={t('rebate-records-tooltip') || 'T+1日统一结算，累计收益，次日统计'}
          placement="top"
          color="#1d1d1d"
          classNames={{ root: styles.tooltip }}
          styles={{ body: { color: '#a8aaad', fontSize: 12, lineHeight: '18px' } }}
        >
          <span className={styles.infoIcon}>
            <InfoIcon />
          </span>
        </Tooltip>
      </div>

      <div className={styles.scrollWrapper}>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHead}>
            <span className={styles.col}>{t('account-type') || '账户类型'}</span>
            <span className={styles.col}>{t('rebate-amount') || '反佣金额'} (USDT)</span>
            <span className={styles.col}>{t('trade-time') || '交易时间'}</span>
            <span className={styles.col}>{t('rebate-time') || '反佣时间'}</span>
          </div>
          {loading ? (
            <div className={styles.loadingArea}>
              <div className={styles.spinner} />
            </div>
          ) : records.length === 0 ? (
            <div className={styles.emptyArea}>
              <img className={styles.emptyImg} src={`${basePath}/image/record-empty.png`} alt="" />
              <span className={styles.emptyText}>{t('no-records') || '暂无记录'}</span>
            </div>
          ) : (
            <div className={styles.tableBody}>
              {records.map((record, idx) => (
                <div key={idx} className={styles.tableRow}>
                  <span className={styles.col}>{rebateTypeLabel(record.rebate_type)}</span>
                  <span className={styles.col}>{record.rebate_amount}</span>
                  <span className={styles.col}>{formatTime(record.trade_time)}</span>
                  <span className={styles.col}>{formatTime(record.rebate_time)}</span>
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

export default RebateRecords;
