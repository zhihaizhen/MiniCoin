import React from 'react';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import { formatPriceByPrecision, getPrecisionDecimals } from '~/utils/priceFormatter';
import styles from './index.module.less';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';

interface TradeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  tradeData?: any;
  minPricePrecision?: string | null;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ visible, onClose, tradeData, minPricePrecision }) => {
  const t = useFm();

  const formatTime = (value: any) => {
    if (!value) return t('pending');
    const n = Number(value);
    if (Number.isNaN(n)) return t('pending');
    return dayjs(n > 1e12 ? n : n * 1000).format('YYYY-MM-DD HH:mm:ss');
  };

  const formatPrice = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return '--';
    const decimals = getPrecisionDecimals(minPricePrecision) ?? 2;
    if (minPricePrecision) {
      const truncated = formatPriceByPrecision(String(value), minPricePrecision);
      return Number(truncated).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: 8 });
  };

  const formatQty = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return '--';
    if (n === 0) return '0';
    return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  const formatProfit = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return '--';
    if (n === 0) return '0';
    const formatted = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    return n > 0 ? `+${formatted}` : formatted;
  };
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      closeIcon={null}
      width={430}
      maskClosable={false}
      className={styles.tradeDetailModal}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('trade-details')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>
          {/* 配对利润 */}
          <div className={styles.profitSection}>
            <span className={styles.profitLabel}>{t('pair-profit')} ({tradeData?.quoteToken || 'USDT'})</span>
            <span className={styles.profitValue}>{formatProfit(tradeData?.closePnl)}</span>
          </div>

          {/* 卖单信息 */}
          <div className={styles.section}>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('order-direction')}</div>
                  <div className={styles.infoValue}>
                    <span className={styles.directionSell}>{t('sell')}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('filled-time')}</div>
                  <div className={styles.infoValue}>{formatTime(tradeData?.closeOrderTime)}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('avg-order-price')} ({tradeData?.quoteToken || 'USDT'})</div>
                  <div className={styles.infoValue}>{formatPrice(tradeData?.closeOrderPrice)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('filled-amount')} ({tradeData?.quoteToken || 'USDT'})</div>
                  <div className={styles.infoValue}>{formatPrice(tradeData?.closeOrderValue)}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('filled-quantity')} ({tradeData?.baseToken})</div>
                  <div className={styles.infoValue}>{formatQty(tradeData?.closeOrderQty)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('fee')} ({tradeData?.quoteToken})</div>
                  <div className={styles.infoValue}>{formatQty(tradeData?.closeOrderFee)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 买单信息 */}
          <div className={styles.section}>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('order-direction')}</div>
                  <div className={styles.infoValue}>
                    <span className={styles.directionBuy}>{t('buy')}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('filled-time')}</div>
                  <div className={styles.infoValue}>{formatTime(tradeData?.openOrderTime)}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('avg-order-price')} ({tradeData?.quoteToken || 'USDT'})</div>
                  <div className={styles.infoValue}>{formatPrice(tradeData?.openOrderPrice)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('filled-amount')} ({tradeData?.quoteToken || 'USDT'})</div>
                  <div className={styles.infoValue}>{formatPrice(tradeData?.openOrderValue)}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('filled-quantity')} ({tradeData?.baseToken})</div>
                  <div className={styles.infoValue}>{formatQty(tradeData?.openOrderQty)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>{t('fee')} ({tradeData?.quoteToken})</div>
                  <div className={styles.infoValue}>{formatQty(tradeData?.openOrderFee)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
