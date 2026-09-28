import React from 'react';
import { Modal } from 'antd';
import { isMobile, basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

type RewardType = 'PreGivenCash' | 'PostGivenCash' | 'ServiceCash' | 'PhysicalAward' | 'RealCash';

interface ClaimSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  awardName?: string; // 奖励名称
  awardAmount?: string; // 奖励数量
  awardToken?: string; // 奖励代币
  iconType?: RewardType; // 奖励类型，用于显示对应图标
}

const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({
  visible,
  onClose,
  awardName = '体验金',
  awardAmount = '10',
  awardToken = 'USDT',
  iconType = 'ServiceCash' // 默认手续费抵扣金
}) => {
  const isMb = isMobile();
  const t = useFm();
  // 根据奖励类型获取对应图标路径（与 GiftCards 保持一致）
  const getIconPath = (type: RewardType) => {
    const iconMap: Record<RewardType, string> = {
      PreGivenCash: 'gift-icon-experience.png',
      PostGivenCash: 'gift-icon-experience.png',
      ServiceCash: 'gift-icon-fee.png',
      PhysicalAward: 'gift-icon-physical-award.png',
      RealCash: 'gift-icon-cash.png'
    };
    return `${basePath}/images/${iconMap[type]}`;
  };

  return (
    <Modal
      maskClosable={false}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMb ? 343 : 400}
      centered
      className={`${styles.modal} ${isMb ? styles.mobileModal : ''}`}
      styles={{
        content: {
          backgroundColor: 'var(--fill-fill-modal, #1D1D1D)',
          padding: '24px',
          borderRadius: '12px',
          overflow: 'hidden'
        },
        mask: {
          background: 'rgba(0, 0, 0, 0.80)'
        }
      }}
    >
      <div className={styles.modalContent}>
        {/* 头部装饰和标题 */}
        <div className={styles.header}>
          <h3 className={styles.title}>🎉 {t('claim-success-modal-title')}</h3>
        </div>

        {/* 奖励内容区域 */}
        <div className={styles.rewardContent}>
          {/* 奖励图标 - 根据 iconType 动态显示 */}
          <div className={styles.couponIcon}>
            <img
              src={getIconPath(iconType)}
              alt="reward"
              className={styles.couponImg}
            />
          </div>

          {/* 奖励信息 */}
          <div className={styles.rewardInfo}>
            {/* 奖励金额 - 大字显示 */}
            <div className={styles.awardAmount}>
              {awardAmount} {awardToken}
            </div>

            {/* 奖励类型 */}
            <p className={styles.awardType}>{awardName}</p>
          </div>
        </div>

        {/* 确认按钮 */}
        <button className={styles.confirmButton} onClick={onClose}>
          {t('claim-success-modal-confirm-button')}
        </button>
      </div>
    </Modal>
  );
};

export default ClaimSuccessModal;

