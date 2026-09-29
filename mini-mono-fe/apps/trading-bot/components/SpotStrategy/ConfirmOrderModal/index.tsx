import React, { useState } from 'react';
import { Modal, message, Spin } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import SuccessModal from '~/components/PublicPart/SuccessModal';
import { addSpotGrid } from '~/api';
import { calculateGridStep, calculateGridProfitRate } from '~/utils/gridCalculator';
import { getTerminationConditionsText } from '~/utils';
import styles from './index.module.less';

interface ConfirmOrderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  strategyParams?: any;
  onRefresh?: () => void; // 新增刷新回调
}

const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({ open, onClose, onConfirm, strategyParams, onRefresh }) => {
  const t = useFm();
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const feeRate = strategyParams?.feeRate || 0;
  const baseAmount = strategyParams?.buyQty ? String(strategyParams.buyQty) : '0';

  const handleConfirm = async () => {
    if (!strategyParams) {
      message.error(t('params-error'));
      return;
    }

    setLoading(true);
    try {
      console.log('创建策略参数:', strategyParams);
      const res = await addSpotGrid(strategyParams);

      if (res) {
        message.success(t('strategy-created-success'));
        onClose();
        setSuccessOpen(true);
      } else {
        message.error(res?.message || t('strategy-created-failed'));
      }
    } catch (error) {
      console.error('创建策略失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    onConfirm();
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
      >
        <div className={styles.modalContent}>
          {/* 头部 */}
          <div className={styles.head}>
            <h3 className={styles.title}>{t('order-confirmation')}</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          {/* 币对信息 */}
          <div className={styles.pairSection}>
            <div className={styles.pairTopRow}>
              <div className={styles.pairLeft}>
                <span className={styles.pairName}>
                  {strategyParams?.base_token}/{strategyParams?.quote_token}
                </span>
                <span className={styles.pairTag}>
                  {strategyParams?.strategy_type === 2 ? t('spot-dca') : t('spot-grid')}
                </span>
              </div>
            </div>
          </div>

          {/* 主体内容 */}
          <div className={styles.bodySection}>
            {(
              <>
                <div className={styles.description}>
                  {(() => {
                    const investmentAmount = strategyParams?.investment_amount || 0;
                    const quoteToken = strategyParams?.quote_token || 'USDT';
                    const baseToken = strategyParams?.base_token || 'BTC';

                    // 使用特殊标记包裹需要高亮的数值
                    const text = t('order-confirmation-desc', {
                      investmentAmount: `<highlight>${investmentAmount} ${quoteToken}</highlight>`,
                      baseAmount: `<highlight>${baseAmount} ${baseToken}</highlight>`
                    });

                    // 解析文本，将 <highlight>xxx</highlight> 标记的部分高亮显示
                    const parts = text.split(/(<highlight>.*?<\/highlight>)/g);
                    return parts.map((part, index) => {
                      // 匹配 <highlight>xxx</highlight> 格式
                      const match = part.match(/^<highlight>(.*?)<\/highlight>$/);
                      if (match) {
                        return (
                          <span key={index} className={styles.highlightValue}>
                            {match[1]}
                          </span>
                        );
                      }
                      return <span key={index}>{part}</span>;
                    });
                  })()}
                </div>

                <div className={styles.infoSection}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>{t('price-range')}</div>
                      <div className={styles.infoValue}>
                        {strategyParams?.price_lower || '-'}~{strategyParams?.price_upper || '-'}
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>
                        {t('grid-quantity')} ({strategyParams?.grid_type === 1 ? t('arithmetic') : t('geometric')})
                      </div>
                      <div className={styles.infoValue}>{strategyParams?.grid_count || '-'}</div>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>{t('grid-spacing')}</div>
                      <div className={styles.infoValue}>
                        {strategyParams?.price_lower && strategyParams?.price_upper && strategyParams?.grid_count
                          ? calculateGridStep({
                            priceLower: strategyParams.price_lower,
                            priceUpper: strategyParams.price_upper,
                            gridCount: strategyParams.grid_count,
                            gridType: strategyParams.grid_type
                          }, strategyParams.minPricePrecision)
                          : '-'}
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>{t('profit-per-grid')}</div>
                      <div className={styles.infoValue}>
                        {strategyParams?.price_lower && strategyParams?.price_upper && strategyParams?.grid_count && feeRate
                          ? calculateGridProfitRate({
                            priceLower: strategyParams.price_lower,
                            priceUpper: strategyParams.price_upper,
                            gridCount: strategyParams.grid_count,
                            gridType: strategyParams.grid_type
                          }, feeRate)
                          : '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>{t('stop-condition')}</div>
                      <div className={styles.infoValue}>
                        {getTerminationConditionsText(strategyParams || {}, t)}
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>{t('settlement-mode')}</div>
                      <div className={styles.infoValue}>{t('sell-on-termination', { token: strategyParams?.base_token })}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 底部按钮 */}
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
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ConfirmOrderModal;
