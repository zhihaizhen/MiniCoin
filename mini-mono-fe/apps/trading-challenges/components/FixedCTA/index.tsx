import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import RegisterButton from '../RegisterButton';
import { useCampaign } from '~/context';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

interface CountdownBoxProps {
  value: string;
  label: string;
}

const CountdownBox: React.FC<CountdownBoxProps> = ({ value, label }) => {
  return (
    <div className={styles.countdownItem}>
      <div className={styles.countdownBox}>{value}</div>
      <span className={styles.countdownLabel}>{label}</span>
    </div>
  );
};

const ZERO_COUNTDOWN = { days: '0', hours: '0', minutes: '0', seconds: '0' };
const DASH_COUNTDOWN = { days: '--', hours: '--', minutes: '--', seconds: '--' };

function secondsToCountdown(distance: number) {
  const days = Math.floor(distance / (60 * 60 * 24));
  const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((distance % (60 * 60)) / 60);
  const seconds = distance % 60;
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

const FixedCTA = () => {
  const t = useFm();
  const { campaignDetail } = useCampaign();

  const campaignTimeStatus = campaignDetail?.campaign_time_status ?? '1';

  const beginTime = React.useMemo(() => {
    if (!campaignDetail?.campaign_begin_time) return null;
    return dayjs.unix(Number(campaignDetail.campaign_begin_time)).tz('Asia/Shanghai');
  }, [campaignDetail?.campaign_begin_time]);

  const endTime = React.useMemo(() => {
    if (!campaignDetail?.campaign_end_time) return null;
    return dayjs.unix(Number(campaignDetail.campaign_end_time)).tz('Asia/Shanghai');
  }, [campaignDetail?.campaign_end_time]);

  const [countdown, setCountdown] = React.useState(ZERO_COUNTDOWN);
  const [isCampaignStarted, setIsCampaignStarted] = React.useState(false);

  const [isFixed, setIsFixed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const placeholderRef = React.useRef<HTMLDivElement>(null);
  const hasBeenVisibleRef = React.useRef(false);

  const calculateCountdown = React.useCallback(() => {
    if (campaignTimeStatus === '2') {
      setCountdown(ZERO_COUNTDOWN);
      setIsCampaignStarted(true);
      return;
    }

    const now = dayjs().tz('Asia/Shanghai');

    if (campaignTimeStatus === '1' && beginTime) {
      const distance = beginTime.diff(now, 'second');
      setIsCampaignStarted(false);
      setCountdown(distance > 0 ? secondsToCountdown(distance) : ZERO_COUNTDOWN);
      return;
    }

    if (campaignTimeStatus === '0' && endTime) {
      const distance = endTime.diff(now, 'second');
      setIsCampaignStarted(true);
      setCountdown(distance > 0 ? secondsToCountdown(distance) : ZERO_COUNTDOWN);
      return;
    }

    setCountdown(DASH_COUNTDOWN);
  }, [beginTime, endTime, campaignTimeStatus]);

  useEffect(() => {
    // 立即计算一次
    calculateCountdown();

    // 每秒更新一次
    const timer = setInterval(() => {
      calculateCountdown();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [calculateCountdown]);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初始检查
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // IntersectionObserver 效果 - 仅在 PC 端使用
  useEffect(() => {
    // H5 端不使用 IntersectionObserver
    if (isMobile) {
      setIsFixed(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 首先标记组件已经可见过
        if (entry.isIntersecting) {
          hasBeenVisibleRef.current = true;
          // 如果占位元素出现在可视区域，移除 fixed 状态
          setIsFixed(false);
        } else if (hasBeenVisibleRef.current) {
          // 只有在组件曾经可见过，现在不可见时，才设置为 fixed
          setIsFixed(true);
        }
      },
      {
        threshold: 0, // 当组件完全不可见时触发
        rootMargin: '0px'
      }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      if (placeholderRef.current) {
        observer.unobserve(placeholderRef.current);
      }
    };
  }, [isMobile]);

  return (
    <>
      {/* 占位元素，用于检测滚动位置 - 仅 PC 端需要 */}
      {!isMobile && <div ref={placeholderRef} style={{ height: '1px', visibility: 'hidden' }} />}
      <div
        className={`${styles.ctaBar} ${isFixed ? styles.fixed : styles.static}`}
      >
        <div className={styles.ctaContainer}>
          <div className={styles.countdownSection}>
            <span className={styles.countdownText}>
              {isCampaignStarted ? t('fixed-cta-campaign-end-text') : t('fixed-cta-campaign-start-text')}
            </span>
            <div className={styles.countdownBoxes}>
              <CountdownBox value={countdown.days} label={t('countdown-days')} />
              <CountdownBox value={countdown.hours} label={t('countdown-hours')} />
              <CountdownBox value={countdown.minutes} label={t('countdown-minutes')} />
              <CountdownBox value={countdown.seconds} label={t('countdown-seconds')} />
            </div>
          </div>

          {/* PC 端显示按钮，H5 端隐藏（按钮已在 HeroBanner 中） */}
          {!isMobile && <RegisterButton />}
        </div>
      </div>
    </>
  );
};

export default FixedCTA;

