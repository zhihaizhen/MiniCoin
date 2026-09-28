import React, { useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { goPage } from '@better-bit-fe/base-utils';
import { basePath } from '~/env';
import type { TaskItem } from '~/types/campaign';
import styles from './index.module.less';

interface MyRewardsProps {
  taskCounter?: TaskItem | null;
  isLogin?: boolean;
  claiming?: boolean;
  onInvite?: () => void;
  onClaimReward?: () => void;
}

const MyRewards: React.FC<MyRewardsProps> = ({ taskCounter, isLogin, claiming, onInvite, onClaimReward }) => {
  const t = useFm();
  const prefix = basePath || '';

  const total = Number(taskCounter?.compare_value) || 3;
  const progress = Number(taskCounter?.archive_value) || 0;
  const progressPercent = Math.min((progress / total) * 100, 100);

  const rewardAmount = useMemo(() => {
    if (!taskCounter?.reward_items?.length) return '0';
    const sum = taskCounter.reward_items.reduce(
      (acc, r) => acc + (Number(r.award_volume) || 0), 0
    );
    return String(sum);
  }, [taskCounter]);

  const rewardDisplay = `${rewardAmount}USDT`;

  return (
    <section className={styles.myRewards}>
      <h2 className={styles.title}>{t('my-rewards') || '我的奖励'}</h2>

      {/* PC Steps */}
      <div className={styles.stepsPC}>
        <div className={styles.stepsRow}>
          <div className={styles.stepIcon}>
            <img
              className={styles.stepIconImg}
              src={`${prefix}/image/ic-user.svg`}
              alt=""
            />
          </div>
          <div className={styles.stepLine} />
          <div className={styles.stepIcon}>
            <img
              className={styles.stepIconImg}
              src={`${prefix}/image/ic-group.svg`}
              alt=""
            />
          </div>
          <div className={styles.stepLine} />
          <div className={styles.stepIconActive}>
            <img
              className={styles.stepIconActiveImg}
              src={`${prefix}/image/ic-invite.svg`}
              alt=""
            />
          </div>
        </div>
        <div className={styles.stepsLabels}>
          <span className={styles.stepLabel}>{t('step-1')}</span>
          <span className={styles.stepLabel}>{t('step-2')}</span>
          <span className={styles.stepLabelRight}>
            {t('step-3', { amount: rewardDisplay }) || `${total}位有效用户可得${rewardDisplay}`}
          </span>
        </div>
      </div>

      {/* H5 Steps */}
      <div className={styles.stepsH5}>
        <div className={styles.h5StepRow}>
          <div className={styles.h5StepIcon}>
            <img src={`${prefix}/image/ic-user.svg`} alt="" />
          </div>
          <div className={styles.h5StepContent}>{t('step-1')}</div>
        </div>
        <div className={styles.h5StepDash} />
        <div className={styles.h5StepRow}>
          <div className={styles.h5StepIcon}>
            <img src={`${prefix}/image/ic-group.svg`} alt="" />
          </div>
          <div className={styles.h5StepContent}>{t('step-2')}</div>
        </div>
        <div className={styles.h5StepDash} />
        <div className={styles.h5StepRow}>
          <div className={styles.h5StepIconActive}>
            <img src={`${prefix}/image/ic-invite.svg`} alt="" />
          </div>
          <div className={styles.h5StepContent}>
            {t('step-3', { amount: rewardDisplay }) || `${total}位有效用户可得${rewardDisplay}`}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className={styles.progressCard}>
        <div className={styles.progressInfo}>
          <div className={styles.progressText}>
            <span className={styles.progressLabel}>{t('invited-valid-users') || '已邀请有效用户数'}</span>
            <span className={styles.progressCount}>
              <span className={styles.progressCurrent}>{progress}</span>
              <span className={styles.progressTotal}>{t('valid-users', { total }) || `/${total}个`}</span>
            </span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={styles.progressHint}>
            {t('progress-hint') || '奖励进度根据您邀请的有效好友任务进度计算'}
          </p>
        </div>
        {taskCounter?.task_status === 'Awarding' ? (
          <button
            className={`${styles.inviteButton} ${styles.claimButton}`}
            onClick={onClaimReward}
            disabled={claiming}
          >
            {claiming
              ? (t('claiming-reward') || '领取中...')
              : (t('claim-reward') || '领取奖励')
            }
          </button>
        ) : taskCounter?.task_status === 'Done' ? (
          <button className={styles.inviteButton} disabled>
            {t('reward-claimed') || '已领取'}
          </button>
        ) : (
          <button className={styles.inviteButton} onClick={() => {
            if (!isLogin) {
              goPage('login');
              return;
            }
            onInvite?.();
          }}>
            {t('go-invite') || '去邀请'}
          </button>
        )}
      </div>
    </section>
  );
};

export default MyRewards;
