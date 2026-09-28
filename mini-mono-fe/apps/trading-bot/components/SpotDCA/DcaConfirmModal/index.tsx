import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { pauseDcaStrategy, resumeDcaStrategy } from '~/api';
import { basePath } from '@better-bit-fe/base-utils';
import styles from '../StopConfirmModal/index.module.less';

interface DcaConfirmModalProps {
  visible: boolean;
  strategyId: string;
  mode: 'pause' | 'resume';
  onConfirm: () => void;
  onCancel: () => void;
}

export const DcaConfirmModal: React.FC<DcaConfirmModalProps> = ({
  visible,
  strategyId,
  mode,
  onConfirm,
  onCancel
}) => {
  const t = useFm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const titleText = mode === 'pause'
    ? t('dca-pause-confirm-title')
    : t('dca-resume-confirm-title');

  const descText = mode === 'pause'
    ? t('dca-pause-confirm-desc')
    : t('dca-resume-confirm-desc');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (mode === 'pause') {
        await pauseDcaStrategy({ strategy_id: strategyId });
        messageApi.open({
          type: 'success',
          content: t('pause-success'),
          className: styles.customMessage
        });
      } else {
        await resumeDcaStrategy({ strategy_id: strategyId });
        messageApi.open({
          type: 'success',
          content: t('resume-success'),
          className: styles.customMessage
        });
      }
      onConfirm();
    } catch (error) {
      console.error(`${mode} DCA策略失败:`, error);
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
              <img src={`${basePath}/images/stop-icon.png`} alt="notice" className={styles.stopIcon} />
            </div>
            <h3 className={styles.title}>{titleText}</h3>
            <p className={styles.desc}>{descText}</p>
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
              {t('confirm')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
