import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { stopStrategy } from '~/api';
import styles from './index.module.less';
import { basePath } from '@better-bit-fe/base-utils';

interface StopConfirmModalProps {
  visible: boolean;
  strategyName: string;
  runningTime: string;
  strategyId: string;
  spotGrid?: {
    baseToken: string;
    quoteToken: string;
    baseTokenTotal: number;
    quoteTokenTotal: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export const StopConfirmModal: React.FC<StopConfirmModalProps> = ({
  visible,
  strategyName,
  runningTime,
  strategyId,
  spotGrid,
  onConfirm,
  onCancel
}) => {
  const {
    baseToken = '',
    quoteToken = 'USDT',
    baseTokenTotal = 0,
    quoteTokenTotal = 0
  } = spotGrid || {};
  const t = useFm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await stopStrategy({
        strategy_id: Number(strategyId)
      });

      messageApi.open({
        type: 'success',
        content: t('strategy-stopped-success'),
        className: styles.customMessage,
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
            <h3 className={styles.title}>{t('spot-grid-stop-confirm')}</h3>
          </div>

          <div className={styles.body}>
            <p className={styles.description}>
              {t('stop-strategy-description', { strategyName, runningTime })}
            </p>

            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                {t('settlement-method-selected')}
                <span className={styles.highlight}> {t('sell-on-termination', { token: baseToken })}</span>
              </p>
              <p className={styles.infoText}>
                {t('return-assets-description', {
                  baseAmount: (
                    <span className={styles.highlight}>
                      {baseTokenTotal.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}{' '}
                      {baseToken}
                    </span>
                  ),
                  quoteAmount: (
                    <span className={styles.highlight}>
                      {quoteTokenTotal.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}{' '}
                      {quoteToken}
                    </span>
                  ),
                  marketPrice: <span className={styles.highlight}>{t('market-best-price')}</span>
                })}
              </p>
            </div>
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
