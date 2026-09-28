import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tooltip } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { getUserData } from '~/api';
import type { UserOverviewData, TimeRange } from '~/types';
import { ReactComponent as InfoIcon } from '~/public/icon/icon-guide.svg';
import { ReactComponent as ChevronIcon } from '~/public/icon/icon-info.svg';
import { ReactComponent as UpArrowIcon } from '~/public/icon/up.svg';
import { ReactComponent as DownArrowIcon } from '~/public/icon/down.svg';
import styles from './index.module.less';


const tooltipStyle: React.CSSProperties = {
  maxWidth: 260
};

const tooltipInnerStyle: React.CSSProperties = {
  background: '#1d1d1d',
  color: '#a8aaad',
  fontSize: 12,
  lineHeight: '18px',
  borderRadius: 8,
  padding: '8px 12px'
};

const DataOverview: React.FC = () => {
  const t = useFm();

  const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
    { label: t('time-all') || '全部时间', value: 'ALL' },
    { label: t('time-yesterday') || '昨日', value: 'YESTERDAY' },
    { label: t('time-last-7d') || '最近 7 日', value: 'LAST_7D' },
    { label: t('time-last-30d') || '最近 30 日', value: 'LAST_30D' }
  ];

  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [data, setData] = useState<UserOverviewData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getUserData({ time_range: timeRange });
      setData(res);
    } catch (err) {
      console.error('fetchUserData error', err);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = TIME_OPTIONS.find((o) => o.value === timeRange)?.label || t('time-all') || '全部时间';

  const overviewTooltip = t('overview-tooltip') || '数据为实时更新，可能存在计算误差及计算延时情况，以下数据仅供参考，给你带来的不便，敬请谅解';

  const cards = [
    {
      key: 'my-rebate',
      label: t('my-rebate') || '我的返佣',
      value: `${data?.rebate_amount || '0'} USDT`,
      tooltip: t('my-rebate-tooltip') || 'T+1日统一结算。累计收益，次日统计'
    },
    {
      key: 'trade-friends-count',
      label: t('trade-friends-count') || '交易好友数',
      value: `${data?.trade_user_count || '0'} ${t('unit-person') || '人'}`,
      tooltip: t('trade-friends-tooltip') || '统计下级产生交易的好友数。累计好友数，实时统计'
    },
    {
      key: 'register-friends-count',
      label: t('register-friends-count') || '注册好友数',
      value: `${data?.register_user_count || '0'} ${t('unit-person') || '人'}`,
      tooltip: t('register-friends-tooltip') || '统计成功邀请的下级。累计好友数，实时统计'
    }
  ];

  return (
    <section className={styles.overview}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <span className={styles.title}>{t('data-overview') || '数据总览'}</span>
        <Tooltip
          title={overviewTooltip}
          placement="bottomLeft"
          overlayStyle={tooltipStyle}
          overlayInnerStyle={tooltipInnerStyle}
        >
          <span className={styles.titleIcon}><ChevronIcon /></span>
        </Tooltip>
      </div>

      {/* ===== PC Tab ===== */}
      <div className={styles.pcTab}>
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.tabItem} ${timeRange === opt.value ? styles.tabItemActive : ''}`}
            onClick={() => setTimeRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ===== H5 Dropdown ===== */}
      <div className={styles.h5Filter} ref={dropdownRef}>
        <button className={styles.h5DropBtn} onClick={() => setShowDropdown(!showDropdown)}>
          <span>{currentLabel}</span>
          <span className={styles.chevron}>{showDropdown ? <UpArrowIcon /> : <DownArrowIcon />}</span>
        </button>
        {showDropdown && (
          <div className={styles.dropdown}>
            {TIME_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className={`${styles.dropdownItem} ${timeRange === opt.value ? styles.dropdownItemActive : ''}`}
                onClick={() => { setTimeRange(opt.value); setShowDropdown(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Cards ===== */}
      <div className={styles.cards}>
        {cards.map((card) => (
          <div key={card.key} className={styles.card}>
            <div className={styles.cardLabel}>
              <span>{card.label}</span>
              <Tooltip
                title={card.tooltip}
                placement="top"
                overlayStyle={tooltipStyle}
                overlayInnerStyle={tooltipInnerStyle}
              >
                <span className={styles.cardLabelIcon}><InfoIcon /></span>
              </Tooltip>
            </div>
            <span className={styles.cardValue}>{card.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DataOverview;
