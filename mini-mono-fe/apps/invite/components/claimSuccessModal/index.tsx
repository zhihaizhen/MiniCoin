import React from 'react';
import { Modal } from 'antd';
import { useRouter } from 'next/router';
import { isMobile as isMobileDevice } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '~/env';
import styles from './index.module.less';

interface ClaimedAward {
  amount: string;
  token: string;
  name: string;
  productType: string;
}

interface ClaimSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  claimedAward: ClaimedAward | null;
}

const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({
  visible,
  onClose,
  claimedAward
}) => {
  const isMobile = isMobileDevice();
  const t = useFm();
  const { locale } = useRouter();
  const prefix = basePath || '';

  const awardAmount = claimedAward?.amount ?? '0';
  const awardToken = claimedAward?.token ?? 'USDT';
  const awardName = claimedAward?.name;
  const productType = claimedAward?.productType;

  const handleGoToCouponCenter = () => {
    onClose();
    window.location.href = `/${locale}/rewards-hub/coupon-center`;
  };

  return (
    <Modal
      maskClosable={false}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? 'calc(100% - 32px)' : 400}
      centered
      className={`${styles.modal} ${isMobile ? styles.mobileModal : ''}`}
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
        <div className={styles.header}>
          <h3 className={styles.title}>🎉 {t('claim-success-title') || '恭喜您获得'}</h3>
        </div>

        <div className={styles.rewardContent}>
          <div className={styles.couponIcon}>
            <img
              src={`${prefix}/image/gift-all.png`}
              alt="reward"
              className={styles.couponImg}
            />
          </div>

          <div className={styles.rewardInfo}>
            <div className={styles.awardAmount}>
              {awardAmount} {awardToken}
            </div>
            <p className={styles.awardType}>{(t(`reward-label-${productType}-${awardName}`))}</p>
          </div>
        </div>

        <button className={styles.confirmButton} onClick={handleGoToCouponCenter}>
          {t('go-to-coupon-center') || '前往卡券中心查看'}
        </button>
      </div>
    </Modal>
  );
};

export default ClaimSuccessModal;
