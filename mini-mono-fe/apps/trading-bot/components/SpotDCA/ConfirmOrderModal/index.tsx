import React, { useState } from 'react';
import { Modal, message, Spin } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { getSymbolUrl, basePath } from '@better-bit-fe/base-utils';
import { createDcaStrategy } from '~/api';
import { parseCronToText } from '~/utils';
import SuccessModal from '~/components/PublicPart/SuccessModal';
import styles from './index.module.less';

interface ConfirmOrderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  strategyParams?: any;
}

const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({
  open,
  onClose,
  onConfirm,
  strategyParams,
}) => {
  const t = useFm();
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [firstInvestTime, setFirstInvestTime] = useState('');

  const handleConfirm = async () => {
    if (!strategyParams) {
      message.error(t('params-error'));
      return;
    }

    setLoading(true);
    try {
      await createDcaStrategy(strategyParams);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setFirstInvestTime(timeStr);
      onClose();
      setSuccessOpen(true);
    } catch (error) {
      console.error('DCA 策略下单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const coins = strategyParams?.relation_coin || '';
  const defaultCoinDisplay = coins.replace(/,/g, '+');
  const coinDisplay =
    strategyParams?.strategy_name && strategyParams.strategy_name !== defaultCoinDisplay
      ? strategyParams.strategy_name
      : defaultCoinDisplay;
  const margin = strategyParams?.margin || 0;
  const strategyCron = strategyParams?.strategy_cron || '';
  const priceConfig: any[] = strategyParams?.price_config || [];
  const executeImmediately = strategyParams?.execute_immediately === 'Y';

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    onConfirm();
  };

  const formatPriceRange = (pc: any) => {
    if (pc.min && pc.max) return `${pc.min}-${pc.max}`;
    if (pc.min) return `≥${pc.min}`;
    if (pc.max) return `≤${pc.max}`;
    return '--';
  };

  return (
    <>
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={440}
      className={styles.confirmOrderModal}
      centered
      maskClosable={false}
      zIndex={1070}
    >
      <div className={styles.modalContent}>
        <div className={styles.head}>
          <h3 className={styles.title}>{t('order-confirmation')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.pairSection}>
          <span className={styles.pairName}>{coinDisplay}</span>
          <span className={styles.pairTag}>{t('spot-dca')}</span>
        </div>

        {/* 4个信息标签 2x2 */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('investment-account')}</div>
            <div className={styles.infoValue}>{t('spot-account')}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('invest-per-time')}</div>
            <div className={styles.infoValue}>{margin} USDT</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('dca-cycle')}</div>
            <div className={styles.infoValue}>{parseCronToText(strategyCron, t) || '--'}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('first-dca-date')}</div>
            <div className={styles.infoValue}>{executeImmediately ? t('immediately') : '--'}</div>
          </div>
        </div>

        {/* 币种配置分割线 */}
        <div className={styles.divider} />

        <div className={styles.coinConfigSection}>
          <div className={styles.coinConfigTitle}>
            {t('coin-config')} | {t('buy-price-range')}
          </div>
          <div className={styles.coinConfigList}>
            {priceConfig.map((pc: any) => (
              <div key={pc.coin} className={styles.coinConfigRow}>
                <img className={styles.coinIcon} src={getSymbolUrl(pc.coin)} alt={pc.coin} />
                <span className={styles.coinName}>{pc.coin}</span>
                <span className={styles.coinSep}>|</span>
                <span className={styles.coinRatio}>{pc.ratio}%</span>
                <span className={styles.coinSep}>|</span>
                <span className={styles.coinRange}>{formatPriceRange(pc)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        {/* 底部提示 */}
        <div className={styles.tips}>
          <p>1.{t('dca-tip-1')}</p>
          <p>2.{t('dca-tip-2')}</p>
          <p>3.{t('dca-tip-3')}</p>
        </div>

        <div className={styles.btnGroup}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('cancel')}
          </button>
          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
            {loading && <Spin size="small" style={{ marginRight: 8 }} />}
            {t('confirm')}
          </button>
        </div>
      </div>
    </Modal>

    <SuccessModal
      open={successOpen}
      onClose={handleSuccessClose}
      onBackHome={handleSuccessClose}
      firstInvestTime={firstInvestTime}
      successDesc={t('dca-success-desc')}
      viewStrategyPath={`${basePath}/my-strategy/?tab=running&sub=2`}
    />
    </>
  );
};

export default ConfirmOrderModal;
