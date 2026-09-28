import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import cls from 'classnames';
import { ReactComponent as ChevronRightIcon } from '~/public/icons/chevron-right.svg';
import { getUserTotalInfo } from '~/api';
import styles from './index.module.less';

interface UserTotalInfo {
  active_count: number;
  total_amount: string;
  today_total_amount: string;
  daily_profit: string;
  daily_profit_rate: string;
}

export interface BotHeaderRef {
  refresh: () => void;
}

const BotHeader = forwardRef<BotHeaderRef>((props, ref) => {
  const t = useFm();
  const router = useRouter();
  const { isLogin } = useUserInfo();
  const [totalInfo, setTotalInfo] = useState<UserTotalInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLogin) {
      fetchUserTotalInfo();
    }
  }, [isLogin]);

  const fetchUserTotalInfo = async () => {
    try {
      setLoading(true);
      const res = await getUserTotalInfo({});
      setTotalInfo(res);
    } catch (error) {
      console.error('获取用户总览数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchUserTotalInfo
  }));

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    const [int, dec] = num.toFixed(4).split('.');
    return `$${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`;
  };

  const formatProfitAmount = (amount: string) => {
    const num = parseFloat(amount);
    const sign = num >= 0 ? '+' : '';
    const [int, dec] = Math.abs(num).toFixed(4).split('.');
    return `${sign}$${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`;
  };

  const handleGoToMyStrategy = () => {
    router.push(`${basePath}/my-strategy`);
  };

  const toTrade = () => {
    goPage('login');
  };

  return (
    <div className={styles.botHeader}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <div className={styles.textWrapper}>
              <h1 className={styles.title}>{t('strategy-trading')}</h1>
              <p className={styles.description}>
                {t('strategy-trading-desc')}
              </p>
            </div>
            {!isLogin && (
              <button className={styles.tradeButton} onClick={toTrade}>
                {t('trade-now')}
              </button>
            )}
            {isLogin ? (
              <div className={styles.userStats}>
                {loading ? (
                  <div className={styles.userStatLabel}>{t('loading')}</div>
                ) : totalInfo ? (
                  <>
                    <div className={styles.statsRow}>
                      <div className={styles.statCol}>
                        <div className={styles.userStatLabel}>{t('my-strategy-total-assets')}</div>
                        <div className={styles.userStatValue}>
                          {formatAmount(totalInfo.total_amount)}
                        </div>
                      </div>
                      <div className={styles.statCol}>
                        <div className={styles.userStatLabel}>{t('daily-profit-loss')}</div>
                        <div className={cls(styles.userStatValue, styles.profitValue, {
                          [styles.negativeText]: parseFloat(totalInfo.daily_profit) < 0,
                          [styles.zeroText]: parseFloat(totalInfo.daily_profit) === 0
                        })}>
                          {formatProfitAmount(totalInfo.daily_profit)}
                        </div>
                      </div>
                      <div className={styles.statCol}>
                        <div className={styles.userStatLink} onClick={handleGoToMyStrategy}>
                          <span className={styles.linkLabel}>{t('currently-running')}</span>
                          <ChevronRightIcon className={styles.chevronIcon} />
                        </div>
                        <div className={styles.userStatValue}>
                          {totalInfo.active_count}
                        </div>
                      </div>
                    </div>
                    <button className={styles.myStrategyButton} onClick={handleGoToMyStrategy}>
                      {t('my-strategies')}
                    </button>
                  </>
                ) : (
                  <div className={styles.userStatLabel}>{t('no-data')}</div>
                )}
              </div>
            ) : (
              <div className={styles.statsSection}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>{t('total-strategy-assets')}</div>
                  <div className={styles.statValue}>--</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>{t('running-strategies')}</div>
                  <div className={styles.statValue}>--</div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.imageSection}>
            <video
              src={`${basePath}/images/hero.mp4`}
              className={styles.robotImage}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </div>
    </div>
  );
});

BotHeader.displayName = 'BotHeader';

export default BotHeader;
