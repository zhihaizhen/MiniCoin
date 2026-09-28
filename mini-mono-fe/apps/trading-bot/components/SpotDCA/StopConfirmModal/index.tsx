import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { terminateDcaStrategy } from '~/api';
import styles from './index.module.less';
import { basePath } from '@better-bit-fe/base-utils';

interface StopConfirmModalProps {
  visible: boolean;
  strategyId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const StopConfirmModal: React.FC<StopConfirmModalProps> = ({
  visible,
  strategyId,
  onConfirm,
  onCancel
}) => {
  const t = useFm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await terminateDcaStrategy({ strategy_id: strategyId });
      messageApi.open({
        type: 'success',
        content: t('strategy-stopped-success'),
        className: styles.customMessage
      });
      onConfirm();
    } catch (error) {
      console.error('终止策略失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        width={440}
        maskClosable={false}
        className={styles.stopConfirmModal}
      >
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <img src={`${basePath}/images/stop-icon.png`} alt="stop" className={styles.stopIcon} />
            </div>
            <h3 className={styles.title}>{t('dca-stop-confirm-title')}</h3>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onCancel} disabled={loading}>
              {t('cancel')}
            </button>
            <button
              className={`${styles.confirmButton} ${loading ? styles.loading : ''}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <span className={styles.spinner}></span>}
              {t('stop')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
