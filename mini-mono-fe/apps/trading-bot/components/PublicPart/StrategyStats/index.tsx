import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

interface StrategyStatsProps {
  todayProfit: string;
  totalInvestment: string;
}

export const StrategyStats: React.FC<StrategyStatsProps> = ({ todayProfit, totalInvestment }) => {
  const t = useFm();

  return (
    <div className={styles.topSection}>
      <div className={styles.leftInfo}>
        <h1 className={styles.pageTitle}>{t('my-strategies')}</h1>
        <div className={styles.statsWrapper}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{t('today-profit-usdt')}(USDT)</div>
            <div
              className={styles.statValue}
              style={
                parseFloat(todayProfit) > 0
                  ? { color: 'var(--text-green, #72cc29)' }
                  : parseFloat(todayProfit) < 0
                    ? { color: 'var(--text-red, #f43f5e)' }
                    : { color: 'var(--text-primary, #f5f5f5)' }
              }
            >
              {todayProfit}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{t('total-investment')}(USDT)</div>
            <div className={styles.statValueWhite}>{totalInvestment}</div>
          </div>
        </div>
      </div>
      <div className={styles.rightImage}>
        <img src={`${basePath}/images/head.png`} alt={t('strategy')} className={styles.robotImage} />
      </div>
    </div>
  );
};
