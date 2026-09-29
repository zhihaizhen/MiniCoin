import React from 'react';
import { formatThousandDigit, debounce } from '~/utils';
import { useRegisterAction } from '~/hooks';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

interface TaskItem {
  id: string;
  task_id?: string;
  day_no: string;
  task_status?: 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Expired' | 'Pending';
  has_reward: '0' | '1';
  reward_type: string;
  reward_token: string;
  reward_amount: string;
  archive_value?: string;
  compare_value?: string;
}

interface TodayTaskProgressProps {
  selectedTask: TaskItem | null;
  countdown: string;
  currentDay?: string; // 当前第几天
  isLogin: boolean;
  isRegistered: boolean;
  campaignTimeStatus: string; // 0:正常进行，1:未开始活动，2:已结束活动
  registerTimeStatus?: string; // 0:正常进行，1:未开始报名，2:已结束报名
  onClaimReward: () => void;
  onTrade?: () => void;
}

const TodayTaskProgress: React.FC<TodayTaskProgressProps> = ({
  selectedTask,
  countdown,
  currentDay,
  isLogin,
  isRegistered,
  campaignTimeStatus,
  registerTimeStatus = '0', 
  onClaimReward,
  onTrade
}) => {
  const t = useFm();
  // 使用统一的报名 hook
  const { handleRegister } = useRegisterAction();

  // 登录处理
  const handleLogin = debounce(() => {
    goPage('login');
  }, 500);

  // 从选中的任务中获取当前交易量和目标交易量
  const currentAmount = React.useMemo(() => {
    // 未登录或未报名时显示 '--'
    if (!isLogin || !isRegistered) return '--';
    if (!selectedTask?.archive_value) return '--';
    return formatThousandDigit(selectedTask.archive_value);
  }, [selectedTask, isLogin, isRegistered]);

  const targetAmount = React.useMemo(() => {
    if (!selectedTask?.compare_value) return '--';
    return formatThousandDigit(selectedTask.compare_value);
  }, [selectedTask, isLogin, isRegistered]);

  // 计算进度百分比
  const progressPercentage = React.useMemo(() => {
    if (currentAmount === '--' || targetAmount === '--') return 0;
    const current = parseFloat(currentAmount.replace(/,/g, ''));
    const target = parseFloat(targetAmount.replace(/,/g, ''));
    return Math.min(100, Math.round((current / target) * 100));
  }, [currentAmount, targetAmount]);

  // 计算进度条宽度
  const progressWidth = React.useMemo(() => {
    if (currentAmount === '--' || targetAmount === '--') return 0;
    const current = parseFloat(currentAmount.replace(/,/g, ''));
    const target = parseFloat(targetAmount.replace(/,/g, ''));
    return Math.min(100, (current / target) * 100);
  }, [currentAmount, targetAmount]);

  // 获取任务状态
  const taskStatus = selectedTask?.task_status || 'Locked';

  // 根据登录状态、报名状态、活动状态和任务状态渲染按钮
  const renderButton = () => {
    // 0. 优先判断：活动已结束
    if (campaignTimeStatus === '2') {
      return (
        <button className={`${styles.registerButton} ${styles.disabled}`} disabled>
          {t('activity-ended')}
        </button>
      );
    }

    // 1. 未登录：显示"去登录"
    if (!isLogin) {
      return (
        <button className={styles.registerButton} onClick={handleLogin}>
          {t('today-task-button-login')}
        </button>
      );
    }

    // 2. 已登录但未报名：根据报名时间状态显示
    if (!isRegistered) {
      switch (registerTimeStatus) {
        case '1':
          // 未开始报名：显示"即将开始"
          return (
            <button className={`${styles.registerButton} ${styles.disabled}`} disabled>
              {t('comingSoon')}
            </button>
          );
        case '2':
          // 已结束报名：显示"已结束"
          return (
            <button className={`${styles.registerButton} ${styles.disabled}`} disabled>
              {t('closed')}
            </button>
          );
        case '0':
        default:
          // 正常进行：显示"去报名"
          return (
            <button className={styles.registerButton} onClick={handleRegister}>
              {t('today-task-button-register')}
            </button>
          );
      }
    }

    // 3. 已报名但活动未开始：显示"已报名"
    if (campaignTimeStatus === '1') {
      return (
        <button className={`${styles.registerButton} ${styles.registered}`} disabled>
          {t('today-task-button-registered')}
        </button>
      );
    }

    // 4. 已登录且已报名且活动已开始：根据任务状态显示
    switch (taskStatus) {
      case 'Locked':
      case 'Expired':
        // 未解锁或已过期：显示锁定状态
        return (
          <button className={`${styles.registerButton} ${styles.disabled}`} disabled>
            <img src={`${basePath}/icons/lock.svg`} alt="" />
            {t('today-task-button-locked')}
          </button>
        );

      case 'Done':
        // 已完成：显示已完成
        return (
          <button className={`${styles.registerButton} ${styles.completed}`} disabled>
            {t('today-task-button-completed')}
          </button>
        );

      case 'Awarding':
        // 待领取：显示"去领奖"按钮
        return (
          <button
            className={`${styles.registerButton} ${styles.claimable}`}
            onClick={onClaimReward}
          >
            {t('today-task-button-claim-reward')}
          </button>
        );

      case 'Pending':
        // 发放中（领取中）：灰色禁用状态
        return (
          <button className={`${styles.registerButton} ${styles.pending}`} disabled>
            {t('today-task-button-pending')}
          </button>
        );

      case 'Init':
        // 进行中：显示"去交易"按钮
        return (
          <button className={styles.registerButton} onClick={onTrade}>
            {t('today-task-button-trade')}
          </button>
        );

      default:
        // 默认情况：显示"去领奖"按钮
        return (
          <button className={styles.registerButton} onClick={onClaimReward}>
            {t('today-task-button-claim-reward')}
          </button>
        );
    }
  };

  return (
    <div className={styles.todayTask}>
      {/* 左侧信息区 */}
      <div className={styles.todayTaskLeft}>
        <h3 className={styles.todayTaskTitle}>{t('today-task-title')}</h3>

        <div className={styles.taskContent}>
          <div className={styles.taskTarget}>
            {t('today-task-target', { amount: targetAmount })}
          </div>

          {/* 进度信息 */}
          <div className={styles.progressInfo}>
            <div className={styles.progressItem}>
              <span className={styles.progressDot}></span>
              <span className={styles.progressLabel}>{t('today-task-trade-amount')}：</span>
              <span className={styles.progressValue}>
                <span className={styles.currentAmount}>{currentAmount}</span>&nbsp;/&nbsp;{targetAmount} USDT
              </span>
            </div>
            <div className={styles.progressItem}>
              <span className={styles.progressDot}></span>
              <span className={styles.progressLabel}>{t('today-task-progress')}：</span>
              <span className={styles.currentAmount}>
                {progressPercentage}%
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 右侧操作区 */}
      <div className={styles.todayTaskRight}>
        {renderButton()}
      </div>

      {/* 右上角倒计时角标 - 只在任务进行中且是当前天时显示 */}
      {taskStatus === 'Init' && selectedTask?.day_no === currentDay && (
        <div className={styles.countdownBadge}>
          <div className={styles.todayTaskCountdown}>{countdown}</div>
        </div>
      )}
    </div>
  );
};

export default TodayTaskProgress;
