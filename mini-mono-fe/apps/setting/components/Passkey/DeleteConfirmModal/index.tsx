import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface DeleteConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
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
      className={styles.deleteModal}
      closable={false}
      maskClosable={false}
      destroyOnClose
    >
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <ExclamationCircleFilled className={styles.icon} />
        </div>
        <div className={styles.title}>{t('passkey-delete-title')}</div>
        <div className={styles.desc}>{t('passkey-delete-desc')}</div>
        <div className={styles.btnGroup}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            {t('passkey-delete-cancel')}
          </button>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
            {t('passkey-delete-confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
