import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useFm } from '@better-bit-fe/base-hooks';
import { goPage } from '@better-bit-fe/base-utils';
import { basePath } from '~/env';
import type { CampaignStatus } from '~/types/campaign';
import { ReactComponent as IconShare } from '~/public/image/share.svg';
import styles from './index.module.less';
import { WebmAnimation } from '@better-bit-fe/base-ui';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BannerProps {
  isLogin?: boolean;
  isEnrolled?: boolean;
  campaignStatus?: CampaignStatus;
  beginTime?: string;
  endTime?: string;
  totalRewardAmount?: string;
  rewardToken?: string;
  onEnroll?: () => Promise<void>;
  onShare?: () => void;
}

const ZERO_COUNTDOWN = { days: '0', hours: '00', minutes: '00', seconds: '00' };
const DASH_COUNTDOWN = { days: '--', hours: '--', minutes: '--', seconds: '--' };

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function secondsToCountdown(distance: number) {
  const days = Math.floor(distance / (60 * 60 * 24));
  const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((distance % (60 * 60)) / 60);
  const seconds = distance % 60;
  return {
    days: String(days),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

const Banner: React.FC<BannerProps> = ({
  isLogin,
  isEnrolled = false,
  campaignStatus,
  beginTime,
  endTime,
  totalRewardAmount = '0',
  rewardToken = 'USDT',
  onEnroll,
  onShare
}) => {
  const t = useFm();
  const [countdown, setCountdown] = useState(DASH_COUNTDOWN);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const rewardDisplay = `${totalRewardAmount} ${rewardToken}`;

  const endTimeDayjs = useMemo(
    () => (endTime ? dayjs.unix(Number(endTime)).utc() : null),
    [endTime]
  );

  const activityTimeStr = useMemo(() => {
    if (!beginTime || !endTime) return '';
    const begin = dayjs.unix(Number(beginTime)).utc().format(TIME_FORMAT);
    const end = dayjs.unix(Number(endTime)).utc().format(TIME_FORMAT);
    return `${begin} – ${end}（UTC+0）`;
  }, [beginTime, endTime]);

  const calculateCountdown = useCallback(() => {
    if (!endTimeDayjs) {
      setCountdown(DASH_COUNTDOWN);
      return;
    }
    const now = dayjs.utc();
    const distance = endTimeDayjs.diff(now, 'second');
    setCountdown(distance > 0 ? secondsToCountdown(distance) : ZERO_COUNTDOWN);
  }, [endTimeDayjs]);

  useEffect(() => {
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [calculateCountdown]);

  const handleEnroll = async () => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    if (enrollLoading) return;
    setEnrollLoading(true);
    try {
      await onEnroll?.();
    } catch (err) {
      console.error('enroll error', err);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleShare = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    onShare?.();
  };

  const btnLoading = campaignStatus === undefined;

  const renderPrimaryButton = () => {
    switch (campaignStatus) {
      case '0':
        return (
          <button className={styles.primaryButton} disabled>
            {t('not-started')}
          </button>
        );
      case '1':
        return isEnrolled ? (
          <button className={styles.primaryButton} onClick={handleShare}>
            {t('invite-now')}
          </button>
        ) : (
          <button
            className={styles.primaryButton}
            onClick={handleEnroll}
            disabled={enrollLoading}
          >
            {enrollLoading
              ? <span className={styles.btnSpinner} />
              : (t('enroll-now'))
            }
          </button>
        );
      case '2':
        return (
          <button className={styles.primaryButton} disabled>
            {t('claiming')}
          </button>
        );
      case '3':
        return (
          <button className={styles.primaryButton} disabled>
            {t('ended')}
          </button>
        );
      default:
        return (
          <button className={styles.primaryButton} disabled>
            <span className={styles.btnSpinner} />
          </button>
        );
    }
  };

  const renderH5PrimaryButton = () => {
    switch (campaignStatus) {
      case '0':
        return (
          <button className={styles.h5PrimaryButton} disabled>
            {t('not-started')}
          </button>
        );
      case '1':
        return isEnrolled ? (
          <button className={styles.h5PrimaryButton} onClick={handleShare}>
            {t('invite-now')}
          </button>
        ) : (
          <button
            className={styles.h5PrimaryButton}
            onClick={handleEnroll}
            disabled={enrollLoading}
          >
            {enrollLoading
              ? <span className={styles.btnSpinner} />
              : (t('enroll-now'))
            }
          </button>
        );
      case '2':
        return (
          <button className={styles.h5PrimaryButton} disabled>
            {t('claiming')}
          </button>
        );
      case '3':
        return (
          <button className={styles.h5PrimaryButton} disabled>
            {t('ended')}
          </button>
        );
      default:
        return (
          <button className={styles.h5PrimaryButton} disabled>
            <span className={styles.btnSpinner} />
          </button>
        );
    }
  };

  return (
    <section className={styles.banner}>
      {/* ===== PC Layout ===== */}
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: t('banner-title', { amount: `<span class="${styles.highlight}">${rewardDisplay}</span>` })
                || `参与邀请好友活动，轻松赚 <span class="${styles.highlight}">${rewardDisplay}</span> 奖励！`
            }}
          />
          <div className={styles.activityTime}>
            <span className={styles.timeLabel}>{t('activity-time')}：</span>
            <span>{activityTimeStr}</span>
          </div>

          {isEnrolled && (
            <div className={styles.pcCountdownSection}>
              <span className={styles.pcCountdownLabel}>
                {t('countdown-label')}
              </span>
              <div className={styles.pcCountdownTimer}>
                <div className={styles.pcCountdownBlock}>{countdown.days}</div>
                <span className={styles.pcCountdownUnit}>{t('days')}</span>
                <div className={styles.pcCountdownBlock}>{countdown.hours}</div>
                <span className={styles.pcCountdownSep}>:</span>
                <div className={styles.pcCountdownBlock}>{countdown.minutes}</div>
                <span className={styles.pcCountdownSep}>:</span>
                <div className={styles.pcCountdownBlock}>{countdown.seconds}</div>
              </div>
            </div>
          )}

          <div className={styles.buttonGroup}>
            {btnLoading ? (
              <>
                <div className={`${styles.skeleton} ${styles.skeletonPrimary}`} />
                <div className={`${styles.skeleton} ${styles.skeletonSecondary}`} />
              </>
            ) : (
              <>
                {renderPrimaryButton()}
                <button className={styles.shareButton} onClick={handleShare}>
                  <IconShare width={20} height={20} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.illustration}>
          <WebmAnimation
            className={styles.pcIllustration}
            loopSrc={`${basePath}/image/hero.mp4`}
          />
        </div>
      </div>

      {/* ===== H5 Layout ===== */}
      <div className={styles.h5Inner}>
        <div className={styles.h5Illustration}>
          <img
            src={`${basePath || ''}/image/invite-hero.png`}
            alt="Invite"
            width={200}
            height={200}
          />
        </div>
        <div className={styles.h5Content}>
          <div className={styles.h5TitleBlock}>
            <h1
              className={styles.h5Title}
              dangerouslySetInnerHTML={{
                __html: t('banner-title', { amount: `<span class="${styles.highlight}">${rewardDisplay}</span>` })
                  || `参与邀请好友活动，轻松赚 <span class="${styles.highlight}">${rewardDisplay}</span> 奖励！`
              }}
            />
            <div className={styles.h5ActivityTime}>
              {t('activity-time')}：{activityTimeStr}
            </div>
          </div>

          <div className={styles.h5CountdownSection}>
            <span className={styles.h5CountdownLabel}>
              {t('countdown-label')}
            </span>
            <div className={styles.h5CountdownTimer}>
              <div className={styles.h5CountdownBlock}>{countdown.days}</div>
              <span className={styles.h5CountdownUnit}>{t('days')}</span>
              <div className={styles.h5CountdownBlock}>{countdown.hours}</div>
              <span className={styles.h5CountdownSep}>:</span>
              <div className={styles.h5CountdownBlock}>{countdown.minutes}</div>
              <span className={styles.h5CountdownSep}>:</span>
              <div className={styles.h5CountdownBlock}>{countdown.seconds}</div>
            </div>
          </div>

          <div className={styles.h5ButtonGroup}>
            {btnLoading ? (
              <>
                <div className={`${styles.skeleton} ${styles.skeletonPrimary}`} />
                <div className={`${styles.skeleton} ${styles.skeletonSecondary}`} />
              </>
            ) : (
              <>
                {renderH5PrimaryButton()}
                <button className={styles.h5ShareButton} onClick={handleShare}>
                  <IconShare width={20} height={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
