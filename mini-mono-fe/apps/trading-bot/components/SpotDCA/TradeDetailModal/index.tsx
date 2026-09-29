import React from 'react';
import { Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import { Empty } from '@better-bit-fe/base-ui';
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';

interface TradeDetail {
  id: number;
  strategyId: number;
  strategyExecPlanId: number;
  symbolId: string;
  baseTokenId: string;
  quoteTokenId: string;
  orderId: number;
  dealPrice: string | number;
  dealQty: string | number;
  dealAmount: string | number;
  orderSide: 'BUY' | 'SELL';
  fee: string | number;
  dealTime: string;
}

interface DcaTradeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  trades: TradeDetail[];
  loading?: boolean;
  remarkCode?: string;
  isActive?: boolean;
  planExecAt?: string;
  planSymbol?: string;
}

export const DcaTradeDetailModal: React.FC<DcaTradeDetailModalProps> = ({
  visible,
  onClose,
  trades,
  loading = false,
  remarkCode,
  isActive = false,
  planExecAt,
  planSymbol
}) => {
  const t = useFm();

  const formatTime = (value: any) => {
    if (!value) return '--';
    if (typeof value === 'string' && value.includes('-')) {
      const utcVal = /[Z+]/.test(value) ? value : `${value}Z`;
      return dayjs(utcVal).format('YYYY-MM-DD HH:mm:ss');
    }
    const n = Number(value);
    if (Number.isNaN(n)) return '--';
    return dayjs(n < 1e12 ? n * 1000 : n).format('YYYY-MM-DD HH:mm:ss');
  };

  const formatNumber = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return '--';
    if (n === 0) return '0';
    return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  const renderField = (label: string, value: React.ReactNode, valueClassName?: string) => (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldValue}${valueClassName ? ` ${valueClassName}` : ''}`}>{value}</span>
    </div>
  );

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      closeIcon={null}
      width={440}
      maskClosable={false}
      className={styles.tradeDetailModal}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('trade-detail')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loadingWrapper}>
              <Spin />
            </div>
          ) : trades.length === 0 ? (
            remarkCode ? (
              <div className={styles.tradeList}>
                <div className={styles.tradeCard}>
                  <div className={styles.fieldRow}>
                    {renderField(t('order-direction'), t('buy'), styles.valueBuy)}
                    {renderField(t('trade-coin'), planSymbol || '--')}
                  </div>
                  <div className={styles.fieldRow}>
                    {renderField(t('completed-time'), planExecAt ? formatTime(planExecAt) : '--')}
                    {renderField(t('avg-price'), '--')}
                  </div>
                  <div className={styles.fieldRow}>
                    {renderField(t('trade-amount'), '--')}
                    {renderField(`${t('fee')}(${planSymbol || '--'})`, '--')}
                  </div>
                  <div className={styles.fieldRow}>
                    {renderField(t('trade-quantity'), '--')}
                    {renderField(
                      t('failure-reason'),
                      t(remarkCode) || remarkCode,
                      styles.valueFailure
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyWrapper}>
                <Empty title="no-data" icon={`${basePath}/images/noData.png`} size="small" />
              </div>
            )
          ) : (
            <div className={styles.tradeList}>
              {trades.map((trade, idx) => (
                <div key={trade.id || idx} className={styles.tradeCard}>
                  <div className={styles.fieldRow}>
                    {renderField(
                      t('order-direction'),
                      trade.orderSide === 'BUY' ? t('buy') : t('sell'),
                      trade.orderSide === 'BUY' ? styles.valueBuy : styles.valueSell
                    )}
                    {renderField(t('trade-coin'), trade.baseTokenId || '--')}
                  </div>
                  <div className={styles.fieldRow}>
                    {renderField(t('completed-time'), formatTime(trade.dealTime))}
                    {renderField(t('avg-price'), formatNumber(trade.dealPrice))}
                  </div>
                  <div className={styles.fieldRow}>
                    {renderField(t('trade-amount'), formatNumber(trade.dealAmount))}
                    {renderField(`${t('fee')}(${trade.baseTokenId || '--'})`, formatNumber(trade.fee))}
                  </div>
                  <div className={styles.fieldRow}>
                    {renderField(t('trade-quantity'), formatNumber(trade.dealQty))}
                    {remarkCode
                      ? renderField(
                        t('failure-reason'),
                        t(remarkCode) || remarkCode,
                        styles.valueFailure
                      )
                      : isActive
                        ? renderField(t('investment-account'), t('spot-account'))
                        : <div className={styles.field} />
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <button className={styles.confirmBtn} onClick={onClose}>
            {t('got-it')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
