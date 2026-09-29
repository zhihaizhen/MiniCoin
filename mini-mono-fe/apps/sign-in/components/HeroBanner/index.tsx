import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { message } from 'antd';
import { useCampaign } from '~/context';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReferralShareModal, RegisterButton, RewardModal } from '~/components';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getReferralInfo } from '~/api';
import { useReceiveAward } from '~/hooks/apiHooks';
import { debounce, formatThousandDigit } from '~/utils';
import { basePath, goPage } from '@better-bit-fe/base-utils';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const HeroBanner = () => {
  const [mounted, setMounted] = useState(false);
  const { campaignDetail, campaignNo, refresh } = useCampaign();
  const t = useFm();
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { isLogin, userInfo } = useUserInfo();
  const [referralInfo, setReferralInfo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // 领取奖励 hook
  const { run: receiveAward, loading: claimLoading } = useReceiveAward({
    onSuccess: (data) => {
      message.success(t('reward-claim-success'));
      setClaimSuccess(true);
      refresh();
    },
    onError: (error) => {
      console.error('领取奖励失败:', error);
    }
  });


  useEffect(() => {
    setMounted(true);
  }, []);

  // 倒计时逻辑 - 根据活动状态计算开始或结束倒计时
  useEffect(() => {
    if (!campaignDetail?.campaign_begin_time || !campaignDetail?.campaign_end_time) return;

    const calculateCountdown = () => {
      const now = dayjs().unix();
      const startTime = Number(campaignDetail.campaign_begin_time);
      const endTime = Number(campaignDetail.campaign_end_time);

      // 判断活动是否已开始
      const hasStarted = now >= startTime;
      const targetTime = hasStarted ? endTime : startTime;
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (24 * 60 * 60));
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = Math.floor(diff % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, [campaignDetail]);


  // 格式化活动时间 (UTC0 秒级时间戳)
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    return dayjs.unix(Number(timestamp)).utc().format('YYYY-MM-DD HH:mm:ss');
  };

  // 活动时间显示
  const activityTime = useMemo(() => {
    if (!campaignDetail) {
      return '';
    }
    const startTime = formatTime(campaignDetail.campaign_begin_time);
    const endTime = formatTime(campaignDetail.campaign_end_time);
    return `${t('hero-banner-activity-time')}${startTime} – ${endTime}（UTC+0）`;
  }, [campaignDetail, t]);


  const fetchReferralInfo = async () => {
    const res = await getReferralInfo();
    setReferralInfo(res);
  }

  const closeShareModal = () => {
    setShowShareModal(false)
  }

  useEffect(() => {
    if (isLogin === true) {
      fetchReferralInfo();
    }
  }, [isLogin])


  const handleShare = () => {
    if (isLogin) {
      setShowShareModal(true)
    } else {
      handleLogin();
    }
  }

  const handleLogin = debounce(() => {
    goPage('login');
  }, 500);

  // 去交易点击事件
  const handleTradeClick = debounce(() => {
    goPage('trade');
  }, 500);

  // 打开领奖弹窗
  const handleOpenRewardModal = () => {
    setClaimSuccess(false);
    setRewardModalOpen(true);
  };

  // 确认领奖
  const handleConfirmClaim = debounce(async () => {
    if (!campaignNo) {
      message.error(t('error-loading'));
      return;
    }

    // 获取当前任务
    const currentDay = campaignDetail?.current_day === '0' ? '1' : campaignDetail?.current_day;
    const currentTask = campaignDetail?.task_items?.find(item => item.day_no === currentDay);

    if (!currentTask?.task_id) {
      message.error(t('error-task-info'));
      return;
    }

    try {
      await receiveAward({
        campaign_no: campaignNo,
        task_id: parseInt(currentTask.task_id, 10)
      });
    } catch (error) {
      console.error('领取失败:', error);
    }
  }, 500);

  // 关闭领奖弹窗
  const handleCloseRewardModal = () => {
    if (!claimLoading) {
      setRewardModalOpen(false);
      setClaimSuccess(false);
    }
  };

  // 分享按钮点击（成功后）
  const handleShareAfterClaim = async () => {
    if (isLogin) {
      try {
        const info = await getReferralInfo();
        setReferralInfo(info);
        setShowShareModal(true);
      } catch (error) {
        console.error('获取推荐信息失败:', error);
      }
    }
  };

  // 格式化倒计时数字为两位数
  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // 判断活动是否已开始
  const hasActivityStarted = useMemo(() => {
    if (!campaignDetail?.campaign_begin_time) return false;
    const now = dayjs().unix();
    const startTime = Number(campaignDetail.campaign_begin_time);
    return now >= startTime;
  }, [campaignDetail]);

  // 获取活动总天数
  const totalDays = useMemo(() => {
    if (campaignDetail?.max_day) {
      return campaignDetail.max_day;
    }
    if (campaignDetail?.task_items && campaignDetail.task_items.length > 0) {
      return String(campaignDetail.task_items.length);
    }
    return '-';
  }, [campaignDetail?.max_day, campaignDetail?.task_items]);

  // 获取最大单日奖励金额
  const maxRewardAmount = useMemo(() => {
    if (campaignDetail?.max_day_reward_amount) {
      return formatThousandDigit(campaignDetail.max_day_reward_amount);
    }
    return '--';
  }, [campaignDetail?.max_day_reward_amount]);

  return (
    <div className={styles.heroBanner}>
      <div className={styles.container}>
        {/* 左侧内容区 */}
        <div className={styles.leftContent}>
          {/* 标题 */}
          <h1 className={styles.title}>
            {t('hero-banner-title-main', { days: totalDays })}
            <br />
            <span className={styles.highlight}>&nbsp;{maxRewardAmount}&nbsp;USDT&nbsp;</span>{t('hero-banner-title-reward-type')}
          </h1>

          {/* 活动时间 */}
          <div className={styles.timeInfo}>
            {activityTime}
          </div>

          {/* 倒计时 */}
          <div className={styles.countdownSection}>
            <div className={styles.countdownLabel}>
              {hasActivityStarted ? t('hero-banner-countdown-before-end') : t('hero-banner-countdown-before-start')}
            </div>
            <div className={styles.countdownTimer}>
              <div className={styles.timeUnit}>
                <div className={styles.timeBox}>{formatNumber(countdown.days)}</div>
                <span className={styles.unitLabel}>{t('hero-banner-time-unit-day')}</span>
              </div>
              <div className={styles.timeUnit}>
                <div className={styles.timeBox}>{formatNumber(countdown.hours)}</div>
              </div>
              <span className={styles.timeSeparator}>:</span>
              <div className={styles.timeUnit}>
                <div className={styles.timeBox}>{formatNumber(countdown.minutes)}</div>
              </div>
              <span className={styles.timeSeparator}>:</span>
              <div className={styles.timeUnit}>
                <div className={styles.timeBox}>{formatNumber(countdown.seconds)}</div>
              </div>
            </div>
          </div>

          {/* 按钮组 */}
          <div className={styles.buttonGroup}>
            <RegisterButton onClaimReward={handleOpenRewardModal} onTrade={handleTradeClick} />
            <button className={styles.shareButton} onClick={handleShare}>
              <img src={`${basePath}/icons/share.svg`} alt="Share" width="20" height="20" />
            </button>
          </div>
        </div>

        {/* 右侧装饰视频 */}
        <div className={styles.rightDecoration}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className={styles.heroVideo}
          >
            <source src={`${basePath}/hero.mp4`} type="video/mp4" />
          </video>
        </div>
      </div>

      {/* 领奖弹窗 */}
      <RewardModal
        open={rewardModalOpen}
        onClose={handleCloseRewardModal}
        onConfirm={handleConfirmClaim}
        onShare={handleShareAfterClaim}
        rewardAmount={maxRewardAmount}
        loading={claimLoading}
        success={claimSuccess}
      />

      {/* 分享弹窗 */}
      <ReferralShareModal
        referralInfo={referralInfo}
        modalOpen={showShareModal}
        onClose={closeShareModal}
        isSuccessShare={claimSuccess}
        rewardAmount={maxRewardAmount}
      />
    </div>
  );
};

export default HeroBanner;

