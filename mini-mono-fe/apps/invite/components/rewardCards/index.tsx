import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '~/env';
import type { TaskItem, RewardItem } from '~/types/campaign';
import styles from './index.module.less';

function getRewardLabel(reward: RewardItem, t: (key: string) => string) {
  return t(`reward-label-${reward.reward_product_type}-${reward.coupon_type}`);
}

interface CouponCardProps {
  amount: string;
  token: string;
  label: string;
}

const CouponCard: React.FC<CouponCardProps> = ({ amount, token, label }) => {
  const prefix = basePath || '';
  return (
    <div className={styles.coupon}>
      <img
        className={styles.couponBg}
        src={`${prefix}/image/coupon-bg.svg`}
        alt=""
      />
      <img
        className={styles.couponIcon}
        src={`${prefix}/image/coupon-icon.svg`}
        alt=""
      />
      <div className={styles.couponAmount}>
        <span className={styles.couponNum}>{amount}</span>
        <span className={styles.couponUnit}>{token}</span>
      </div>
      <img
        className={styles.couponDivider}
        src={`${prefix}/image/coupon-divider.svg`}
        alt=""
      />
      <div className={styles.couponLabel}>{label}</div>
    </div>
  );
};

interface NumberItemProps {
  num: number;
  text: string;
}

const NumberItem: React.FC<NumberItemProps> = ({ num, text }) => (
  <div className={styles.numberItem}>
    <div className={styles.numberBadge}>
      <span>{num}</span>
      <span>.</span>
    </div>
    <span className={styles.numberText}>{text}</span>
  </div>
);

interface RewardCardsProps {
  taskOnce?: TaskItem | null;
  taskCounter?: TaskItem | null;
}

const RewardCards: React.FC<RewardCardsProps> = ({ taskOnce, taskCounter }) => {
  const t = useFm();

  const onceRewards = taskOnce?.reward_items ?? [];
  const counterRewards = taskCounter?.reward_items ?? [];

  return (
    <section className={styles.rewardCards}>
      {/* Reward Card 1: 新用户注册奖励 */}
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderBg} />
            <span className={styles.sectionHeaderText}>
              <span className={styles.headerGreen}>{t('reward-one-label')}</span>
              <span className={styles.headerWhite}>{t('reward-one-title')}</span>
            </span>
          </div>
          <ul className={styles.descList}>
            <li>{t('reward-one-desc-1')}</li>
            <li>{t('reward-one-desc-2')}</li>
          </ul>
        </div>
        {onceRewards.map((reward,index) => (
          <div key={reward.task_id + '-' + index} className={styles.couponCard}>
            <div className={styles.couponCardBg} />
            <div className={styles.couponCardInner}>
              <div className={styles.couponInfo}>
                <h3 className={styles.couponTitle}>
                  {t('coupon-title-prefix') || '赠送好友'} {reward.award_volume} {reward.award_token} {getRewardLabel(reward, t)}
                </h3>
                <p className={styles.couponSubtitle}>
                  {t('reward-one-coupon-subtitle')}
                </p>
              </div>
              <CouponCard
                amount={reward.award_volume}
                token={reward.award_token}
                label={getRewardLabel(reward, t)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reward Card 2: 邀请好友赢奖励 */}
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderBg} />
            <span className={styles.sectionHeaderText}>
              <span className={styles.headerGreen}>{t('reward-two-label')}</span>
              <span className={styles.headerWhite}>{t('reward-two-title')}</span>
            </span>
          </div>
          <ul className={styles.descList}>
            <li>{t('reward-two-desc-1')}</li>
            <li>{t('reward-two-desc-2')}</li>
          </ul>
          <div className={styles.conditionBlock}>
            <p className={styles.conditionTitle}>
              {t('valid-user-condition') || '被邀请用户需同时满足以下条件，方可被认定为有效用户：'}
            </p>
            <div className={styles.conditionList}>
              <NumberItem num={1} text={t('condition-1')} />
              <NumberItem num={2} text={t('condition-2')} />
            </div>
          </div>
        </div>
        {counterRewards.map((reward) => (
          <div key={reward.task_id} className={styles.couponCard}>
            <div className={styles.couponCardBg} />
            <div className={styles.couponCardInner}>
              <div className={styles.couponInfo}>
                <h3 className={styles.couponTitle}>
                  {reward.award_volume} {reward.award_token} {getRewardLabel(reward, t)}
                </h3>
                <p className={styles.couponSubtitle}>
                  {t('reward-two-coupon-subtitle')}
                </p>
              </div>
              <CouponCard
                amount={reward.award_volume}
                token={reward.award_token}
                label={getRewardLabel(reward, t)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RewardCards;
