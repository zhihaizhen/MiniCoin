import React from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import Marquee from 'react-fast-marquee';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface RewardIcon {
  id: string;
  label: string;
  iconType: string
}

const RewardIcons = () => {
  const t = useFm();
  const rewards: RewardIcon[] = [
    { id: '1', label: t('reward-icons-powerbank'), iconType: 'gift1' },
    { id: '2', label: t('reward-icons-suitcase'), iconType: 'gift2' },
    { id: '3', label: t('reward-icons-tshirt'), iconType: 'gift3' },
    { id: '4', label: t('reward-icons-thermos'), iconType: 'gift4' },
    { id: '5', label: t('reward-icons-umbrella'), iconType: 'gift5' },
    { id: '6', label: t('reward-icons-cap'), iconType: 'gift6' },
    { id: '7', label: t('reward-icons-backpack'), iconType: 'gift7' },
    { id: '8', label: t('reward-icons-fee-voucher'), iconType: 'fee' },
    // { id: '9', label: t('reward-icons-cash'), iconType: 'cash' },
    { id: '10', label: t('reward-icons-experience'), iconType: 'experience' },
  ];

  const getIconPath = (iconType: string) => {
    const iconMap = {
      fee: 'gift-icon-fee.png',
      // cash: 'gift-icon-cash.png',
      experience: 'gift-icon-experience.png',
      gift1: 'gift-icon-1.png',
      gift2: 'gift-icon-2.png',
      gift3: 'gift-icon-3.png',
      gift4: 'gift-icon-4.png',
      gift5: 'gift-icon-5.png',
      gift6: 'gift-icon-6.png',
      gift7: 'gift-icon-7.png',
    };
    return `${basePath}/images/${iconMap[iconType]}`;
  };

  const getIconBgPath = () => {
    return `${basePath}/images/gift-icon-bg-fee.png`;
  };

  // 渲染单个卡片
  const renderCard = (reward: RewardIcon, index: number) => (
    <div key={`${reward.id}-${index}`} className={styles.rewardItem}>
      <div className={styles.iconWrapper}>
        <img
          className={styles.iconBg}
          src={getIconBgPath()}
          alt="background"
        />
        <img
          className={styles.icon}
          src={getIconPath(reward.iconType)}
          alt={reward.label}
        />
      </div>
      <span className={styles.label}>{reward.label}</span>
    </div>
  );

  return (
    <div className={styles.rewardIcons}>
      <div className={styles.container}>
        <Marquee
          speed={30}
          gradient={false}
          pauseOnHover={true}
          direction="left"
          className={styles.marqueeWrapper}
        >
          {rewards.map((reward, index) => renderCard(reward, index))}
        </Marquee>
      </div>
    </div>
  );
};

export default RewardIcons;

