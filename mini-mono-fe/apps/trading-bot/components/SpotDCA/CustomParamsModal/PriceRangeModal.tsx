import React, { useState, useEffect } from 'react';
import { Modal, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { useAllSpotQuote } from 'libs/ws-service';
import { limitDecimalPlaces } from '~/utils/priceFormatter';
import styles from './index.module.less';

interface PriceConfigItem {
  symbol: string;
  priceLower: string;
  priceUpper: string;
}

interface PriceRangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: PriceConfigItem[]) => void;
  coinList: string[];
  initialConfig?: PriceConfigItem[];
}

const PriceRangeModal: React.FC<PriceRangeModalProps> = ({
  open,
  onClose,
  onConfirm,
  coinList,
  initialConfig = []
}) => {
  const t = useFm();
  const { allSpotList } = useAllSpotQuote();
  const [config, setConfig] = useState<PriceConfigItem[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initialConfig.length > 0) {
      const merged = coinList.map(symbol => {
        const existing = initialConfig.find(c => c.symbol === symbol);
        return existing || { symbol, priceLower: '', priceUpper: '' };
      });
      setConfig(merged);
    } else {
      setConfig(coinList.map(symbol => ({ symbol, priceLower: '', priceUpper: '' })));
    }
  // 仅在弹框打开时初始化一次，避免父组件重渲染时因引用变化重置输入内容
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const getCurrentPrice = (symbol: string): string => {
    if (!allSpotList || !symbol) return '--';
    const pair = allSpotList.find(
      (item: any) => item?.baseTokenId === symbol && item?.quoteTokenId === 'USDT'
    );
    return pair?.formattedLastPrice || (pair?.lastPriceNumber != null ? String(pair.lastPriceNumber) : '--');
  };

  const handleChange = (index: number, field: 'priceLower' | 'priceUpper', value: string) => {
    // 只允许数字和小数点，并限制最多 8 位小数
    const cleaned = limitDecimalPlaces(value.replace(/[^\d.]/g, ''), 8);
    const next = [...config];
    next[index] = { ...next[index], [field]: cleaned };
    setConfig(next);
  };

  const handleConfirm = () => {
    for (const item of config) {
      const lo = item.priceLower !== '' ? Number(item.priceLower) : null;
      const hi = item.priceUpper !== '' ? Number(item.priceUpper) : null;
      if (lo !== null && hi !== null && hi <= lo) {
        message.error(`${item.symbol}: ${t('price-upper-must-greater-than-lower')}`);
        return;
      }
    }
    onConfirm(config);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={440}
      className={styles.subModal}
      centered
      maskClosable={false}
    >
      <div className={styles.subModalContent}>
        <div className={styles.subModalHead}>
          <h3 className={styles.subModalTitle}>{t('buy-price-range')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.subModalBody}>
          <div className={styles.priceRangeDesc}>
            {t('price-range-desc')}
          </div>
          {config.map((item, index) => (
            <div key={item.symbol} className={styles.priceRangeRow}>
              <div className={styles.priceRangeCoinInfo}>
                <img
                  className={styles.priceRangeCoinIcon}
                  src={getSymbolUrl(item.symbol)}
                  alt={item.symbol}
                />
                <span className={styles.priceRangeCoinName}>{item.symbol}</span>
                <span className={styles.priceRangeCurrent}>
                  {t('current-price')}: {getCurrentPrice(item.symbol)}
                </span>
              </div>
              <div className={styles.priceRangeInputs}>
                <Input
                  className={styles.priceInput}
                  placeholder={t('lowest-price')}
                  autoComplete="off"
                  value={item.priceLower}
                  onChange={(e) => handleChange(index, 'priceLower', e.target.value)}
                />
                <span className={styles.priceRangeSep}>-</span>
                <Input
                  className={styles.priceInput}
                  placeholder={t('highest-price')}
                  autoComplete="off"
                  value={item.priceUpper}
                  onChange={(e) => handleChange(index, 'priceUpper', e.target.value)}
                />
              </div>
            </div>
          ))}
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

export default PriceRangeModal;
