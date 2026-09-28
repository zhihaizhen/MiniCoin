import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface DisclaimerModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  visible,
  onConfirm,
  onCancel
}) => {
  const t = useFm();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={440}
      centered
      className={styles.disclaimerModal}
      closable={false}
      maskClosable={false}
      destroyOnClose
    >
      <div className={styles.modalContent}>
        <div className={styles.head}>
          <div className={styles.title}>{t('passkey-disclaimer-title')}</div>
          <CloseOutlined className={styles.closeIcon} onClick={onCancel} />
        </div>
        <div className={styles.body}>
          <div className={styles.bodyInner}>
            <p className={styles.paragraph}>{t('passkey-disclaimer-heading')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p1')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p2')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p3')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p4')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p5')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p6')}</p>
            <p className={styles.paragraph}>{t('passkey-disclaimer-p7')}</p>
          </div>
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
            {t('passkey-disclaimer-confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DisclaimerModal;
