import React, { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { debounce, formatThousandDigit } from '~/utils';
import { useCampaign } from '~/context';
import { useReceiveAward } from '~/hooks/apiHooks';
import { TaskCarousel, RewardModal, TodayTaskProgress, LoadingSpinner, ReferralShareModal } from '~/components';
import { getReferralInfo } from '~/api';
import styles from './index.module.less';
import { basePath, goPage } from '@better-bit-fe/base-utils';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

const DailyChallenge = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { campaignDetail, publicCampaignDetail, loading, campaignNo, refresh } = useCampaign();
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false); // 领取成功状态
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false); // 分享弹窗状态
  const [referralInfo, setReferralInfo] = useState(null); // 推荐信息

  // 领取奖励 hook
  const { run: receiveAward, loading: claimLoading } = useReceiveAward({
    onSuccess: (data) => {
      // 显示成功 toast
      message.success(t('reward-claim-success'));
      // 设置成功状态
      setClaimSuccess(true);
      // 刷新数据，让状态变为 Pending（发放中）
      refresh();
    },
    onError: (error) => {
      console.error('领取奖励失败:', error);
    }
  });

  // 是否已报名
  const isRegistered = campaignDetail?.is_register === '1';

  // 获取活动时间状态：0:正常进行，1:未开始活动，2:已结束活动
  const campaignTimeStatus = publicCampaignDetail?.campaign_time_status ?? '0';

  // 获取报名时间状态：0:正常进行，1:未开始报名，2:已结束报名
  const registerTimeStatus = useMemo(() => {
    const detail = campaignDetail || publicCampaignDetail;
    return detail?.register_time_status || '0';
  }, [campaignDetail?.register_time_status, publicCampaignDetail?.register_time_status]);

  // 获取活动总天数：优先从 max_day 获取，否则使用 task_items.length，最后默认 7
  const totalDays = useMemo(() => {
    const detail = campaignDetail || publicCampaignDetail;
    if (detail?.max_day) {
      return Number(detail.max_day);
    }
    const taskItems = detail?.task_items;
    if (taskItems && taskItems.length > 0) {
      return taskItems.length;
    }
    return 7;
  }, [campaignDetail?.max_day, publicCampaignDetail?.max_day, campaignDetail?.task_items, publicCampaignDetail?.task_items]);

  // 倒计时状态
  const [countdown, setCountdown] = useState('--');

  // 计算倒计时
  useEffect(() => {
    // 未登录或未报名，显示 '--'
    if (!isLogin || !isRegistered || !campaignDetail?.current_time) {
      setCountdown('--');
      return;
    }

    // 将后端返回的 UTC0 时间戳转换为 UTC+8 时区
    const serverTimeUTC8 = dayjs.unix(Number(campaignDetail.current_time)).utc().tz('Asia/Shanghai');

    // 后端按 UTC0 的 24:00 作为结束时间，转换到 UTC+8 就是第二天 08:00
    // 获取 UTC+8 当天的日期，然后设置为第二天的 08:00:00
    const endOfDayUTC8 = serverTimeUTC8.startOf('day').add(1, 'day').hour(8).minute(0).second(0);

    // 缓存服务器时间戳（秒）和结束时间戳（秒），用于后续计算
    const serverTimestamp = Number(campaignDetail.current_time);
    const endTimestamp = endOfDayUTC8.unix();

    const calculateCountdown = () => {
      // 当前本地时间（秒）
      const nowTimestamp = Math.floor(Date.now() / 1000);

      // 计算经过的时间（秒）= 本地当前时间 - 服务器基准时间
      const elapsed = nowTimestamp - serverTimestamp;

      // 剩余秒数 = 结束时间 - 服务器基准时间 - 经过的时间
      const currentRemaining = endTimestamp - serverTimestamp - elapsed;

      if (currentRemaining <= 0) {
        setCountdown('00h 00m 00s');
        return;
      }

      const hours = Math.floor(currentRemaining / 3600);
      const minutes = Math.floor((currentRemaining % 3600) / 60);
      const seconds = currentRemaining % 60;

      setCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    // 立即计算一次
    calculateCountdown();

    // 每秒更新一次
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, [isLogin, isRegistered, campaignDetail?.current_time]);


  // 获取已完成天数：直接从 campaignDetail.total_completed_days 获取
  const completedDays = useMemo(() => {
    if (isLogin && isRegistered && campaignDetail?.total_completed_days) {
      return campaignDetail.total_completed_days;
    }
    return '--';
  }, [isLogin, isRegistered, campaignDetail?.total_completed_days]);

  // 剩余天数：总天数 - 已完成天数
  const remainingDays = useMemo(() => {
    if (completedDays === '--') return '--';
    const remaining = totalDays - Number(completedDays);
    return remaining > 0 ? String(remaining) : '0';
  }, [completedDays, totalDays]);

  // 终极奖励金额：从 campaignDetail 的 max_day_reward_amount 获取
  const ultimateReward = useMemo(() => {
    const detail = campaignDetail || publicCampaignDetail;
    if (detail?.max_day_reward_amount) {
      return formatThousandDigit(detail.max_day_reward_amount);
    }
    return '--';
  }, [campaignDetail?.max_day_reward_amount, publicCampaignDetail?.max_day_reward_amount]);

  // 立即交易点击事件
  const handleTradeClick = debounce(() => {
    goPage('trade');
  }, 500);

  // 打开领奖弹窗
  const handleOpenRewardModal = () => {
    setClaimSuccess(false); // 重置成功状态
    setRewardModalOpen(true);
  };

  // 确认领奖（在弹窗中点击确认按钮）
  const handleConfirmClaim = debounce(async () => {
    if (!campaignNo) {
      message.error(t('error-loading'));
      return;
    }

    if (!selectedTask?.task_id) {
      message.error(t('error-task-info'));
      return;
    }

    try {
      await receiveAward({
        campaign_no: campaignNo,
        task_id: parseInt(selectedTask.task_id, 10)
      });
    } catch (error) {
      console.error('领取失败:', error);
    }
  }, 500);

  // 关闭领奖弹窗
  const handleCloseRewardModal = () => {
    if (!claimLoading) {
      setRewardModalOpen(false);
      setClaimSuccess(false); // 关闭时重置成功状态
    }
  };

  // 分享按钮点击
  const handleShare = async () => {
    if (isLogin) {
      try {
        const info = await getReferralInfo();
        setReferralInfo(info);
        setShowShareModal(true);
      } catch (error) {
        console.error('获取推荐信息失败:', error);
      }
    } else {
      goPage('login');
    }
  };

  // 查看按钮点击（关闭弹窗）
  const handleView = () => {
    handleCloseRewardModal();
  };

  // 处理任务卡片选择
  const handleSelectTask = React.useCallback((taskItem: any, index: number) => {
    setSelectedTask(taskItem);
  }, []);

  // 加载中状态
  if (loading) {
    return (
      <div className={styles.dailyChallenge}>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dailyChallenge}>
      <div className={styles.container}>
        {/* 标题区域 */}
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <div className={styles.rectangle}></div>
            <h2 className={styles.title}>{t('daily-challenge-title')}</h2>
            <div className={styles.rectangle}></div>
          </div>
        </div>

        {/* 奖励卡片 */}
        <div className={styles.rewardCards}>
          {/* 终极奖励卡片 */}
          <div className={styles.rewardCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardLeft}>
                <div className={styles.cardTop}>
                  <span className={styles.cardTag}>{t('daily-challenge-card-tag-ultimate-reward')}</span>
                  <div className={styles.cardValue}>{ultimateReward}&nbsp;USDT</div>
                </div>
                <div className={styles.cardDescription}>
                  {t('daily-challenge-card-description', { days: totalDays })}
                </div>
              </div>
              <div className={styles.cardIcon}>
                <img
                  src={`${basePath}/images/coin.png`}
                  alt="Coin"
                  className={styles.iconImage}
                />
              </div>
            </div>
          </div>

          {/* 当前完成天数卡片 */}
          <div className={styles.rewardCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardLeft}>
                <div className={styles.cardTop}>
                  <span className={styles.cardTag}>{t('daily-challenge-card-tag')}</span>
                  <div className={styles.cardValue}>{completedDays}&nbsp;{t('hero-banner-time-unit-day')}</div>
                </div>
                <div className={styles.cardDescription}>
                  {t('daily-challenge-remaining-days', { days: remainingDays })}
                </div>
              </div>
              <div className={styles.cardIcon}>
                <img
                  src={`${basePath}/images/calendar.png`}
                  alt="calendar"
                  className={styles.iconImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 任务卡片区域 */}
        <div className={styles.taskSection}>
          {/* 横幅 */}
          <div className={styles.taskBanner}>
            <img
              src={`${basePath}/images/bg-l.png`}
              alt=""
              className={styles.bannerDecorationLeft}
            />
            <div className={styles.bannerText}>
              {t('daily-challenge-banner-text', { days: totalDays, amount: ultimateReward })}
            </div>
            <img
              src={`${basePath}/images/bg-r.png`}
              alt=""
              className={styles.bannerDecorationRight}
            />
          </div>

          {/* 任务卡片列表 */}
          <TaskCarousel
            taskItems={campaignDetail?.task_items || publicCampaignDetail?.task_items}
            onSelectTask={handleSelectTask}
          />

          {/* 今日任务进度 */}
          <TodayTaskProgress
            selectedTask={selectedTask}
            countdown={countdown}
            currentDay={campaignDetail?.current_day}
            isLogin={isLogin}
            isRegistered={isRegistered}
            campaignTimeStatus={campaignTimeStatus}
            registerTimeStatus={registerTimeStatus}
            onClaimReward={handleOpenRewardModal}
            onTrade={handleTradeClick}
          />
        </div>
      </div>

      {/* 领奖弹窗 */}
      <RewardModal
        open={rewardModalOpen}
        onClose={handleCloseRewardModal}
        onConfirm={handleConfirmClaim}
        onShare={handleShare}
        rewardAmount={ultimateReward}
        loading={claimLoading}
        success={claimSuccess}
      />

      {/* 分享弹窗 */}
      <ReferralShareModal
        modalOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        referralInfo={referralInfo}
        isSuccessShare={claimSuccess}
        rewardAmount={ultimateReward}
      />
    </div>
  );
};

export default DailyChallenge;

