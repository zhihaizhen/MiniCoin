import React, { useRef, useCallback } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

export enum CouponTabType {
  PENDING = 'pending',
  USED = 'used',
  EXPIRED = 'expired'
}

interface CouponTabsProps {
  activeTab: CouponTabType;
  onChange: (tab: CouponTabType) => void;
  counts?: {
    pending?: number;
    used?: number;
    expired?: number;
  };
}

const TAB_LIST = [
  { key: CouponTabType.PENDING, labelKey: 'couponPending' },
  { key: CouponTabType.USED, labelKey: 'used' },
  { key: CouponTabType.EXPIRED, labelKey: 'couponExpired' }
];

const CouponTabs = ({ activeTab, onChange, counts = {} }: CouponTabsProps) => {
  const t = useFm();
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleTabClick = useCallback((key: CouponTabType) => {
    onChange(key);
    const el = tabRefs.current[key];
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [onChange]);

  return (
    <div className={styles.couponTabs}>
      {TAB_LIST.map((tab) => {
        const count = counts[tab.key];
        return (
          <div
            key={tab.key}
            ref={(el) => { tabRefs.current[tab.key] = el; }}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.key)}
          >
            {t(tab.labelKey)}
            {count !== undefined && (
              <span className={styles.count}>({count})</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CouponTabs;
