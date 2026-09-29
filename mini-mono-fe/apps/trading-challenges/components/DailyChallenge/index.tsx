import React, { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { debounce, jumpToPage, formatThousandDigit } from '~/utils';
import { useCampaign } from '~/context';
import { useRegisterAction } from '~/hooks';
import GiftCards from '../GiftCards';
import CashbackRecordModal from '../AwardListModal';
import styles from './index.module.less';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

type RewardType = 'PreGivenCash' | 'PostGivenCash' | 'ServiceCash' | 'PhysicalAward' | 'RealCash';

// 进度卡片组件
interface ProgressCardProps {
  currentAmount: string;
  targetAmount: string;
  countdown: string;
  showMobileButton?: boolean;
  isLogin: boolean;
  hasClaimedReward: boolean;
  onRegisterClick: () => void;
  onTradeClick: () => void;
  onViewRewardsClick: () => void;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  currentAmount,
  targetAmount,
  countdown,
  showMobileButton = false,
  isLogin,
  hasClaimedReward,
  onRegisterClick,
  onTradeClick,
  onViewRewardsClick
}) => {
  const t = useFm();

  return (
    <div className={styles.progressCard}>
      <div className={styles.progressSection}>
        <div className={styles.progressLeft}>
          <div className={styles.progressLabel}>
            <span className={styles.labelText}>{t('daily-challenge-label-trading-volume')}</span>
          </div>
          <div className={styles.progressValues}>
            <span className={styles.currentValue}>{currentAmount}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.targetValue}>{targetAmount}</span>
          </div>
        </div>

        <div className={styles.progressMiddle}>
          <div className={styles.progressLabel}>
            <span className={styles.labelText}>{t('daily-challenge-label-countdown')}</span>
          </div>
          <div className={styles.progressValues}>
            <span className={styles.countdownValue}>{countdown}</span>
          </div>
        </div>

        <div className={styles.progressRight}>
          {isLogin && hasClaimedReward ? (
            // 登录且已领奖：显示两个按钮
            <div className={styles.buttonGroup}>
              <button className={styles.viewRewardsButton} onClick={onViewRewardsClick}>
                <div className={styles.viewRewardsBtnGlow}></div>
                <span>{t('daily-challenge-button-view-rewards')}</span>
              </button>
              <button className={styles.tradeButton} onClick={onTradeClick}>
                {t('daily-challenge-button-trade-now')}
              </button>
            </div>
          ) : (
            // 其他情况：显示单个按钮
            <>
              {isLogin ? (
                <button className={styles.tradeButton} onClick={onTradeClick}>
                  {t('daily-challenge-button-trade-now')}
                </button>
              ) : (
                <button className={styles.tradeButton} onClick={onRegisterClick}>
                  {t('daily-challenge-button-register-now')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* H5 端底部按钮 */}
      {showMobileButton && (
        <div className={styles.progressButtonMobile}>
          {isLogin && hasClaimedReward ? (
            // 登录且已领奖：显示两个按钮（垂直排列）
            <div className={styles.buttonGroupMobile}>
              <button className={styles.tradeButton} onClick={onTradeClick}>
                {t('daily-challenge-button-trade-now')}
              </button>
              <button className={styles.viewRewardsButton} onClick={onViewRewardsClick}>
                <div className={styles.viewRewardsBtnGlow}></div>
                <span>{t('daily-challenge-button-view-rewards')}</span>
              </button>
            </div>
          ) : (
            // 其他情况：显示单个按钮
            <>
              {isLogin ? (
                <button className={styles.tradeButton} onClick={onTradeClick}>
                  {t('daily-challenge-button-trade-now')}
                </button>
              ) : (
                <button className={styles.tradeButton} onClick={onRegisterClick}>
                  {t('daily-challenge-button-register-now')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Day 卡片组件
interface DayCardProps {
  day: number;
  isUnlocked: boolean;
  rewardText?: string;
  taskStatus?: 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Pending' | 'Expired';
  onTradeClick?: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, isUnlocked, rewardText, taskStatus, onTradeClick }) => {
  const t = useFm();
  const hasReward = !!rewardText;

  // 根据任务状态渲染不同的按钮内容
  const renderButton = () => {
    // 未解锁状态或已过期：显示锁定图标
    if (!isUnlocked || taskStatus === 'Expired') {
      return (
        <div className={styles.lockedContent}>
          <div className={styles.lockIcon}>
            <img src={`${basePath}/images/lock.svg`} alt="lock" />
          </div>
          <span className={styles.dayText}>Day {day.toString().padStart(2, '0')}</span>
        </div>
      );
    }

    // 已解锁状态：根据 task_status 显示不同内容
    switch (taskStatus) {
      case 'Done':
      case 'Awarding':
      case 'Pending':
        // 已完成/发放中/待处理：显示打勾图标
        return (
          <>
            <span className={styles.dayText}>Day {day.toString().padStart(2, '0')}</span>
            <div className={styles.checkIcon}>
              <img src={`${basePath}/images/check.svg`} alt="check" />
            </div>
          </>
        );

      case 'Init':
        // 进行中：显示"去交易"按钮
        return (
          <>
            <span className={styles.dayText}>Day {day.toString().padStart(2, '0')}</span>
            <button className={styles.dayCardTradeButton} onClick={onTradeClick}>
              {t('daily-challenge-button-go-trade')}
            </button>
          </>
        );

      default:
        // 默认情况：显示"去交易"按钮
        return (
          <>
            <span className={styles.dayText}>Day {day.toString().padStart(2, '0')}</span>
            <button className={styles.dayCardTradeButton} onClick={onTradeClick}>
              {t('daily-challenge-button-go-trade')}
            </button>
          </>
        );
    }
  };

  return (
    <div className={styles.dayCardWrapper}>
      {/* PC 端：tooltip 在外面 */}
      {hasReward && (
        <div className={styles.tooltipPC}>
          <div className={styles.tooltipContent}>
            <img src={`${basePath}/images/reward-icon.svg`} alt="reward" className={styles.tooltipIcon} />
            <span className={styles.tooltipText}>{rewardText}</span>
          </div>
          <div className={styles.tooltipArrow}></div>
        </div>
      )}

      <div className={`${styles.dayCard} ${isUnlocked ? styles.dayCardUnlocked : ''}`}>
        {renderButton()}

        {/* H5 端：tooltip 在 dayCard 内部 */}
        {hasReward && (
          <div className={styles.tooltipMobile}>
            <div className={styles.tooltipContent}>
              <img src={`${basePath}/images/reward-icon.svg`} alt="reward" className={styles.tooltipIcon} />
              <span className={styles.tooltipText}>{rewardText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DailyChallenge = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { campaignDetail, publicCampaignDetail, loading } = useCampaign();

  // 从 campaignDetail 中获取是否已领过奖励
  const hasClaimedReward = campaignDetail?.is_record === '1';

  // 是否已报名
  const isRegistered = campaignDetail?.is_register === '1';

  // 获取活动时间状态：0:正常进行，1:未开始活动，2:已结束活动
  const campaignTimeStatus = publicCampaignDetail?.campaign_time_status ?? '0';

  // 只有活动进行中（状态为'0'）才展示进度卡片
  const shouldShowProgress = campaignTimeStatus === '0';

  // 获取当前交易量：未登录或未报名显示 '--'，已报名取 private 接口的 archive_value（格式化）
  const currentAmount = useMemo(() => {
    if (isLogin && isRegistered) {
      const value = campaignDetail?.archive_value;
      return value ? formatThousandDigit(value) : '--';
    }
    return '--';
  }, [isLogin, isRegistered, campaignDetail?.archive_value]);

  // 获取目标交易量：已报名取 private 接口的 compare_value，未报名或未登录取 public 接口的 compare_value（格式化）
  const targetAmount = useMemo(() => {
    let value: string | undefined;

    if (isLogin && isRegistered) {
      // 已登录且已报名：使用 private 接口数据
      value = campaignDetail?.compare_value;
    } else {
      // 未登录或未报名：使用 public 接口数据
      value = publicCampaignDetail?.compare_value;
    }

    return value ? formatThousandDigit(value) : '--';
  }, [isLogin, isRegistered, campaignDetail?.compare_value, publicCampaignDetail?.compare_value]);

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
        setCountdown('00 : 00 : 00');
        return;
      }

      const hours = Math.floor(currentRemaining / 3600);
      const minutes = Math.floor((currentRemaining % 3600) / 60);
      const seconds = currentRemaining % 60;

      setCountdown(
        `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
      );
    };

    // 立即计算一次
    calculateCountdown();

    // 每秒更新一次
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, [isLogin, isRegistered, campaignDetail?.current_time]);

  // 返现记录弹窗状态
  const [showCashbackModal, setShowCashbackModal] = useState(false);

  // 使用报名 hook
  const { handleRegister } = useRegisterAction();

  // 获取奖励类型文本 key
  const getRewardTypeKey = (rewardType: RewardType): string => {
    const keyMap: Record<RewardType, string> = {
      PreGivenCash: 'reward-type-experience-cash',
      PostGivenCash: 'reward-type-experience-cash',
      ServiceCash: 'reward-type-service-cash',
      PhysicalAward: 'reward-type-physical-award',
      RealCash: 'reward-type-real-cash'
    };
    return keyMap[rewardType] || 'reward-type-default';
  };

  // 从接口获取展示的任务数据
  const dayCards = useMemo(() => {
    // 获取 public 接口数据
    const publicTaskItems = publicCampaignDetail?.task_items || [];

    // 未登录或未报名：取前5条数据（从 public 接口）
    if (!isLogin || !isRegistered) {
      const DISPLAY_COUNT = 5;
      const firstFiveTasks = publicTaskItems.slice(0, DISPLAY_COUNT);
      return firstFiveTasks.map((task) => {
        const dayNumber = parseInt(task.day_no);
        const hasReward = task.has_reward === '1';

        let rewardText = '';
        if (hasReward) {
          const rewardTypeText = t(getRewardTypeKey(task.reward_type as RewardType));
          if (task.reward_type === 'PhysicalAward') {
            rewardText = `${rewardTypeText}`;
          } else {
            rewardText = `${task.reward_amount} ${task.reward_token} ${rewardTypeText}`;
          }
        }

        return {
          day: dayNumber,
          isUnlocked: false, // 未登录或未报名全部锁定
          rewardText,
          hasReward,
          taskStatus: undefined
        };
      });
    }

    // 已登录且已报名：根据规则展示
    const taskItems = campaignDetail?.task_items || [];
    // 用 current_day 作为当前天数（原来用 taskItems.length，现在接口返回全部天数所以不能再用 length）
    const currentDay = parseInt(campaignDetail?.current_day || '0', 10);
    const taskCount = currentDay; // 保持后续情况1/2/3分支逻辑不变
    const TOTAL_DAYS = 30; // 活动总天数
    const DISPLAY_COUNT = 5; // 显示的卡片数量

    // 创建 public 接口数据的映射（用于获取未解锁卡片的数据）
    const publicTaskMap = new Map(publicTaskItems.map((task) => [parseInt(task.day_no), task]));
    // 创建 private 接口数据的映射（用于按 day_no 查找，不依赖数组顺序）
    const privateTaskMap = new Map(taskItems.map((task) => [parseInt(task.day_no), task]));

    // 情况1：数据少于5天，前面显示已有数据，后面补未解锁卡片
    if (taskCount < DISPLAY_COUNT) {
      const result = [];

      // 显示已有的任务数据（按 day_no 1~currentDay 顺序取）
      for (let day = 1; day <= currentDay; day++) {
        const task = privateTaskMap.get(day);
        if (!task) continue;
        const dayNumber = parseInt(task.day_no);
        const hasReward = task.has_reward === '1';

        let rewardText = '';
        if (hasReward) {
          const rewardTypeText = t(getRewardTypeKey(task.reward_type as RewardType));
          if (task.reward_type === 'PhysicalAward') {
            rewardText = `${rewardTypeText}`;
          } else {
            rewardText = `${task.reward_amount} ${task.reward_token} ${rewardTypeText}`;
          }
        }

        result.push({
          day: dayNumber,
          isUnlocked: true,
          rewardText,
          hasReward,
          taskStatus: task.task_status
        });
      }

      // 补充未解锁的卡片（从 public 接口获取数据）
      const unlockedCount = DISPLAY_COUNT - taskCount;
      for (let i = 0; i < unlockedCount; i++) {
        const dayNumber = currentDay + i + 1; // 原来用 taskCount，现在 taskCount === currentDay 所以等价
        const publicTask = publicTaskMap.get(dayNumber);

        let rewardText = '';
        let hasReward = false;

        if (publicTask) {
          hasReward = publicTask.has_reward === '1';
          if (hasReward) {
            const rewardTypeText = t(getRewardTypeKey(publicTask.reward_type as RewardType));
            if (publicTask.reward_type === 'PhysicalAward') {
              rewardText = `${rewardTypeText}`;
            } else {
              rewardText = `${publicTask.reward_amount} ${publicTask.reward_token} ${rewardTypeText}`;
            }
          }
        }

        result.push({
          day: dayNumber,
          isUnlocked: false,
          rewardText,
          hasReward,
          taskStatus: undefined
        });
      }

      return result;
    }

    // 情况2：数据等于5天，直接显示前5天
    if (taskCount === DISPLAY_COUNT) {
      const result2 = [];
      for (let day = 1; day <= DISPLAY_COUNT; day++) {
        const task = privateTaskMap.get(day);
        if (!task) continue;
        const dayNumber = parseInt(task.day_no);
        const hasReward = task.has_reward === '1';

        let rewardText = '';
        if (hasReward) {
          const rewardTypeText = t(getRewardTypeKey(task.reward_type as RewardType));
          if (task.reward_type === 'PhysicalAward') {
            rewardText = `${rewardTypeText}`;
          } else {
            rewardText = `${task.reward_amount} ${task.reward_token} ${rewardTypeText}`;
          }
        }

        result2.push({
          day: dayNumber,
          isUnlocked: true,
          rewardText,
          hasReward,
          taskStatus: task.task_status
        });
      }
      return result2;
    }

    // 情况3：数据超过5天，展示 前2天 + 当天(居中) + 未来2天未解锁
    // currentDay 已在上方通过 campaignDetail.current_day 获取
    const remainingDays = TOTAL_DAYS - currentDay; // 剩余天数
    const result = [];

    // 计算要显示的范围
    let pastDaysCount: number; // 显示过去多少天（不含当天）
    let futureUnlockedCount: number; // 要补充多少条未解锁卡片

    if (remainingDays >= 2) {
      // 剩余天数>=2：显示 前2天 + 当天(居中) + 未来2天（未解锁）
      // 例如：第10天，显示 Day08, Day09, Day10(居中), Day11, Day12
      pastDaysCount = 2; // 显示前2天
      futureUnlockedCount = 2; // 补2条未解锁
    } else if (remainingDays === 1) {
      // 第29天：显示 前3天 + 当天 + 未来1天（未解锁）
      // 例如：Day26, Day27, Day28, Day29, Day30
      pastDaysCount = 3;
      futureUnlockedCount = 1;
    } else {
      // 第30天（最后一天）：显示 前4天 + 当天
      // 例如：Day26, Day27, Day28, Day29, Day30
      pastDaysCount = 4;
      futureUnlockedCount = 0;
    }

    // 计算起始 day：前N天 + 当天，从 currentDay - pastDaysCount 开始
    const startDay = currentDay - pastDaysCount;

    // 添加已解锁的任务（按 day_no 从 privateTaskMap 取，不依赖数组顺序）
    for (let day = startDay; day <= currentDay; day++) {
      const task = privateTaskMap.get(day);
      if (!task) continue;
      const dayNumber = parseInt(task.day_no);
      const hasReward = task.has_reward === '1';

      let rewardText = '';
      if (hasReward) {
        const rewardTypeText = t(getRewardTypeKey(task.reward_type as RewardType));
        if (task.reward_type === 'PhysicalAward') {
          rewardText = `${rewardTypeText}`;
        } else {
          rewardText = `${task.reward_amount} ${task.reward_token} ${rewardTypeText}`;
        }
      }

      result.push({
        day: dayNumber,
        isUnlocked: true,
        rewardText,
        hasReward,
        taskStatus: task.task_status
      });
    }

    // 添加未解锁的未来天数卡片（从 public 接口获取数据）
    for (let i = 0; i < futureUnlockedCount; i++) {
      const dayNumber = currentDay + i + 1;
      const publicTask = publicTaskMap.get(dayNumber);

      let rewardText = '';
      let hasReward = false;

      if (publicTask) {
        hasReward = publicTask.has_reward === '1';
        if (hasReward) {
          const rewardTypeText = t(getRewardTypeKey(publicTask.reward_type as RewardType));
          if (publicTask.reward_type === 'PhysicalAward') {
            rewardText = `${rewardTypeText}`;
          } else {
            rewardText = `${publicTask.reward_amount} ${publicTask.reward_token} ${rewardTypeText}`;
          }
        }
      }

      result.push({
        day: dayNumber,
        isUnlocked: false,
        rewardText,
        hasReward,
        taskStatus: undefined
      });
    }

    return result;
  }, [campaignDetail, publicCampaignDetail, isLogin, isRegistered, t]);

  // 立即交易点击事件
  const handleTradeClick = debounce(() => {
    jumpToPage('trade');
  }, 500);

  // 查看获得奖励点击事件
  const handleViewRewardsClick = debounce(() => {
    setShowCashbackModal(true);
  }, 500);

  // 关闭返现记录弹窗
  const handleCloseCashbackModal = () => {
    setShowCashbackModal(false);
  };

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

        {/* 进度说明 */}
        <div className={styles.progressInfo}>
          <span className={styles.infoText}>
            {t('daily-challenge-progress-info-prefix')}
            <span className={styles.highlight}>&nbsp;{targetAmount} USDT,&nbsp;</span>
            {t('daily-challenge-progress-info-suffix')}
          </span>
        </div>

        {/* 进度卡片 - H5 端独立显示在外面 - 仅活动进行中展示 */}
        {shouldShowProgress && (
          <div className={styles.progressCardWrapperMobile}>
            <ProgressCard
              currentAmount={currentAmount}
              targetAmount={targetAmount}
              countdown={countdown}
              showMobileButton={true}
              isLogin={isLogin}
              hasClaimedReward={hasClaimedReward}
              onRegisterClick={handleRegister}
              onTradeClick={handleTradeClick}
              onViewRewardsClick={handleViewRewardsClick}
            />
          </div>
        )}

        {/* 每日奖励 */}
        <div className={styles.rewardsGrid}>
          {/* PC 端进度卡片在这里 - 仅活动进行中展示 */}
          <div className={styles.progressCardWrapperPC}>
            {shouldShowProgress && (
              <ProgressCard
                currentAmount={currentAmount}
                targetAmount={targetAmount}
                countdown={countdown}
                isLogin={isLogin}
                hasClaimedReward={hasClaimedReward}
                onRegisterClick={handleRegister}
                onTradeClick={handleTradeClick}
                onViewRewardsClick={handleViewRewardsClick}
              />
            )}
          </div>

          {/* Days卡片 */}
          <div className={styles.daysContainer}>
            {dayCards.map((card, index) => (
              <React.Fragment key={card.day}>
                <DayCard
                  day={card.day}
                  isUnlocked={card.isUnlocked}
                  rewardText={card.hasReward ? card.rewardText : ''}
                  taskStatus={card.taskStatus}
                  onTradeClick={handleTradeClick}
                />
                {index < dayCards.length - 1 && <div className={styles.divider}></div>}
              </React.Fragment>
            ))}
          </div>

          {/* Gift 卡片区域 */}
          <GiftCards />
        </div>
      </div>

      {/* 返现记录弹窗 */}
      <CashbackRecordModal
        visible={showCashbackModal}
        onClose={handleCloseCashbackModal}
      />
    </div>
  );
};

export default DailyChallenge;

