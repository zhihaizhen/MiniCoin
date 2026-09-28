import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface VerifyRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  onGoToSecurity: () => void;
}

const VerifyRequiredModal: React.FC<VerifyRequiredModalProps> = ({
  visible,
  onClose,
  onGoToSecurity
}) => {
  const t = useFm();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={440}
      className={styles.verifyRequiredModal}
      centered
    >
      <div className={styles.modalContent}>
        {/* 标题 */}
        <div className={styles.modalTitle}>{t('api-verify-required-title')}</div>

        {/* 提示内容 */}
        <div className={styles.modalText}>
          {t('api-verify-required-text')}
        </div>

        {/* 按钮组 */}
        <div className={styles.buttonGroup}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('cancel')}
          </button>
          <button className={styles.confirmBtn} onClick={onGoToSecurity}>
            {t('api-go-to-security')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VerifyRequiredModal;

