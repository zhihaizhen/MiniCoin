import React from 'react';
import { Modal } from 'antd';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';

import styles from './index.module.less';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  onBackHome: () => void;
  onRefresh?: () => void;
  firstInvestTime?: string;
  successDesc?: string;
  viewStrategyPath?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  onRefresh,
  firstInvestTime,
  successDesc,
  viewStrategyPath
}) => {
  const t = useFm();
  const router = useRouter();

  const handleClose = () => {
    onClose();
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
      }, 300);
    }
  };

  const handleViewStrategy = () => {
    const targetPath = viewStrategyPath || `${basePath}/my-strategy/`;
    const locale = router.locale || '';
    const localePrefix = locale ? `/${locale}` : '';
    window.location.href = `${localePrefix}${targetPath}`;
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={null}
      width={430}
      className={styles.successModal}
      centered
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <CloseIcon className={styles.closeIcon} />
        </button>

        <div className={styles.bodySection}>
          <div className={styles.iconWrapper}>
            <img src={`${basePath}/images/check.png`} alt="success" className={styles.checkIcon} />
          </div>

          <div className={styles.successInfo}>
            <div className={styles.successTitle}>{t('created-success')}</div>
            <div className={styles.successDesc}>
              {firstInvestTime && <p>{t('investment-success-time')}: <span className={styles.investTime}>{firstInvestTime}</span></p>}
              <p>{successDesc || t('investment-success-desc')}</p>
            </div>
          </div>
        </div>

        <div className={styles.btnGroup}>
          <button className={styles.viewBtn} onClick={handleViewStrategy}>
            {t('view-strategy')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
