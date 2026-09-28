import React, { useEffect, useState } from 'react';
import { Modal, Input, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import { validatePasskeyName } from '~/utils/passkey/naming';
import styles from './index.module.less';

interface RenameModalProps {
  visible: boolean;
  initialName: string;
  loading?: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
  visible,
  initialName,
  loading,
  onConfirm,
  onCancel
}) => {
  const t = useFm();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) {
      setName(initialName || '');
    }
  }, [visible, initialName]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!validatePasskeyName(trimmed)) {
      message.error(t('passkey-rename-invalid'));
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={440}
      centered
      className={styles.renameModal}
      closable={false}
      maskClosable={false}
      destroyOnClose
    >
      <div className={styles.content}>
        <div className={styles.head}>
          <span />
          <CloseOutlined className={styles.closeIcon} onClick={onCancel} />
        </div>
        <div className={styles.illustration}>
          <img
            src={`${basePath}/images/passkey/illustration.png`}
            alt=""
            width={120}
            height={120}
          />
        </div>
        <div className={styles.title}>{t('passkey-rename-title')}</div>
        <div className={styles.field}>
          <div className={styles.label}>{t('passkey-rename-label')}</div>
          <Input
            className={styles.input}
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.confirmBtn}
          disabled={loading || !name.trim()}
          onClick={handleConfirm}
        >
          {t('passkey-rename-confirm')}
        </button>
      </div>
    </Modal>
  );
};

export default RenameModal;
