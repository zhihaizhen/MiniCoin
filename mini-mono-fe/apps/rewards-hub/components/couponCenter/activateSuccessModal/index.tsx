import React from 'react';
import { Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as IconClose } from '~/public/images/coupon/close.svg';
import styles from './index.module.less';

interface ActivateSuccessModalProps {
  open: boolean;
  amount: number;
  currency: string;
  couponType: string;
  onClose: () => void;
  onViewUsed: () => void;
}

const ActivateSuccessModal = ({ open, amount, currency, couponType, onClose, onViewUsed }: ActivateSuccessModalProps) => {
  const t = useFm();

  return (
    <Modal
      open={open}
      centered
      footer={null}
      closeIcon={null}
      onCancel={onClose}
      width={440}
      className={styles.modalWrap}
      maskClosable={false}
    >
      <div className={styles.modal}>
        <div className={styles.head}>
          <div className={styles.closeLine}>
            <button className={styles.closeBtn} onClick={onClose}>
              <IconClose />
            </button>
          </div>
          <div className={styles.titleLine}>
            <span className={styles.title}>🎉 {t('activateSuccessTitle')}</span>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.couponFace}>
            <div className={styles.couponAmount}>
              <span className={styles.couponAmountNum}>{amount}</span>
              <span className={styles.couponAmountUnit}>{currency}</span>
            </div>
            <div className={styles.couponType}>{couponType}</div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.viewBtn} onClick={onViewUsed}>
            {t('viewUsed')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivateSuccessModal;
