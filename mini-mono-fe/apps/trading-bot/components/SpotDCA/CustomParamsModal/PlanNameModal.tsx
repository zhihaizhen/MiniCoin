import React, { useState, useEffect } from 'react';
import { Modal, Input } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import styles from './index.module.less';

interface PlanNameModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  initialValue?: string;
  mode?: 'create' | 'edit';
}

const PlanNameModal: React.FC<PlanNameModalProps> = ({
  open,
  onClose,
  onConfirm,
  initialValue = '',
  mode = 'create'
}) => {
  const t = useFm();
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    if (open) {
      setName(initialValue);
    }
  }, [open, initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 20) {
      setName(val);
    }
  };

  const handleConfirm = () => {
    onConfirm(name.trim());
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={392}
      className={styles.subModal}
      centered
      maskClosable={false}
    >
      <div className={styles.subModalContent}>
        <div className={styles.subModalHead}>
          <h3 className={styles.subModalTitle}>{mode === 'edit' ? t('rename-strategy') : t('dca-plan-name')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.subModalBody}>
          <Input
            className={styles.planNameInput}
            placeholder={t('enter-plan-name')}
            value={name}
            onChange={handleChange}
            maxLength={20}
          />
          <div className={styles.planNameTip}>
            {t('max-20-chars')} ({name.length} / 20)
          </div>
        </div>
        <div className={styles.subModalFooter}>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            {t('confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PlanNameModal;
