import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { basePath, isPC } from '@better-bit-fe/base-utils';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import RegisterButton from '../RegisterButton';
import { useCampaign } from '~/context';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

const formatTime = (timestamp: string) => {
  if (!timestamp) return '';
  return dayjs
    .unix(Number(timestamp))
    .tz('Asia/Shanghai')
    .format(isPC() ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY/MM/DD HH:mm');
};

const HeroBanner = () => {
  const { campaignDetail } = useCampaign();
  const t = useFm();

  // 活动时间显示
  const activityTime = useMemo(() => {
    if (!campaignDetail) {
      return '';
    }
    const startTime = formatTime(campaignDetail.campaign_begin_time);
    const endTime = formatTime(campaignDetail.campaign_end_time);
    return `${startTime} ~ ${endTime} (UTC+8)`;
  }, [campaignDetail]);

  return (
    <div className={styles.heroBanner}>
      {/* PC / H5 全宽 KV 视频 */}
      <div className={styles.bgDecoration}>
        <WebmAnimation
          className={`${styles.bgVideo} ${styles.bgVideoPc}`}
          loopSrc={`${basePath}/images/hero-bg.mp4`}
          loopClassName="object-contain"
        />
        <WebmAnimation
          className={`${styles.bgVideo} ${styles.bgVideoH5}`}
          loopSrc={`${basePath}/images/hero-bg-h5.mp4`}
          loopClassName="object-contain"
        />
      </div>

      {/* 主内容区 - Flex 居中布局 */}
      <div className={styles.mainContent}>
        {/* 文字内容区 */}
        <div className={styles.textContent}>
          <div className={styles.titleWrapper}>
            <div className={styles.title}>
              {t('hero-title', {
                i: (chunks) => <span className={styles.amount}>{chunks}</span>
              })}
            </div>
          </div>

          <div className={styles.timeTag}>
            <div className={styles.timeIcon}>
              <img src={`${basePath}/images/clock.svg`} alt="clock" width="18" height="18" />
            </div>
            <span className={styles.timeText}>{activityTime}</span>
          </div>

          {/* H5 端按钮 */}
          <div className={styles.buttonMobile}>
            <RegisterButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

