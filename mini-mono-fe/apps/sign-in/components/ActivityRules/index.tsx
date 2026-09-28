import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface ItemProps {
  index?: number;
  title?: string;
  content?: string;
}

const RuleItem: React.FC<ItemProps> = ({ index, title, content }) => {
  return (
    <div className={styles.ruleItem}>
      <div className={styles.ruleIndex}>{`${index}.`}</div>
      <div className={styles.ruleContent}>
        {title && <span className={styles.ruleTitle}>{title}</span>}
        {content}
      </div>
    </div>
  );
};

const ActivityRules = () => {
  const t = useFm();

  // 表格数据 - 只有两列：天数和当日合约交易量要求
  const tableData = [
    { day: t('activity-rules-item2-table-day1'), amount: '≥ 10,000 USDT' },
    { day: t('activity-rules-item2-table-day2'), amount: '≥ 30,000 USDT' },
    { day: t('activity-rules-item2-table-day3'), amount: '≥ 50,000 USDT' },
    { day: t('activity-rules-item2-table-day4'), amount: '≥ 100,000 USDT' },
    { day: t('activity-rules-item2-table-day5'), amount: '≥ 300,000 USDT' },
    { day: t('activity-rules-item2-table-day6'), amount: '≥ 500,000 USDT' },
    { day: t('activity-rules-item2-table-day7'), amount: '≥ 1,000,000 USDT' }
  ];

  return (
    <div className={styles.activityRules}>
      <h1 className={styles.title}>{t('activity-rules-title')}</h1>
      <div className={styles.rulesList}>
        {/* 规则 1 */}
        <RuleItem
          index={1}
          content={t('activity-rules-item1-content')}
        />

        {/* 规则 2 - 表格 */}
        <RuleItem
          index={2}
          content={t('activity-rules-item2-content')}
        />
        <div className={styles.ruleItem}>
          <div className={styles.ruleContent}>
            <div className={styles.tableWrapper}>
              <ul className={styles.rewardTable}>
                {/* 表头 */}
                <li className={styles.tableHeader}>
                  <span className={styles.tableCell}>{t('activity-rules-item2-table-header-day')}</span>
                  <span className={styles.tableCell}>{t('activity-rules-item2-table-header')}</span>
                </li>
                {/* 数据行 */}
                {tableData.map((row, index) => (
                  <li key={index} className={styles.tableRow}>
                    <span className={styles.tableCell}>{row.day}</span>
                    <span className={styles.tableCell}>{row.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <RuleItem index={3} content={t('activity-rules-item3-content')} />
        <RuleItem index={4} content={t('activity-rules-item4-content')} />
        <RuleItem index={5} content={t('activity-rules-item5-content')} />
        <RuleItem index={6} content={t('activity-rules-item6-content')} />
      </div>
    </div>
  );
};

export default ActivityRules;
