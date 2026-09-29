import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Input, Radio } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow_down.svg';
import { limitDecimalPlaces, getPrecisionDecimals } from '~/utils/priceFormatter';
import styles from './index.module.less';

interface AdvancedSettingsProps {
  open: boolean;
  onToggle: () => void;
  takeProfitType: string;
  onTakeProfitTypeChange: (value: string) => void;
  takeProfitPrice?: string;
  onTakeProfitPriceChange?: (value: string) => void;
  stopLossType: string;
  onStopLossTypeChange: (value: string) => void;
  stopLossPrice?: string;
  onStopLossPriceChange?: (value: string) => void;
  baseToken?: string;
  quoteToken?: string;
  useStopPrefix?: boolean;
  currentPrice?: number;
  minPricePrecision?: string | null;
}

export interface AdvancedSettingsRef {
  validate: () => boolean;
  scrollIntoView: () => void;
}

const AdvancedSettings = forwardRef<AdvancedSettingsRef, AdvancedSettingsProps>((props, ref) => {
  const {
    open,
    onToggle,
    takeProfitType,
    onTakeProfitTypeChange,
    takeProfitPrice = '',
    onTakeProfitPriceChange,
    stopLossType,
    onStopLossTypeChange,
    stopLossPrice = '',
    onStopLossPriceChange,
    baseToken,
    quoteToken = 'USDT',
    useStopPrefix = false,
    currentPrice = 0,
    minPricePrecision = null
  } = props;
  const t = useFm();
  const precisionDecimals = getPrecisionDecimals(minPricePrecision);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const takeProfitInputRef = useRef<HTMLDivElement>(null);
  const stopLossInputRef = useRef<HTMLDivElement>(null);
  const [takeProfitTouched, setTakeProfitTouched] = useState(false);
  const [stopLossTouched, setStopLossTouched] = useState(false);

  // 仅在焦点离开整个高级设置区域时触发校验
  const handleContentBlur = (e: React.FocusEvent<HTMLElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && contentRef.current?.contains(relatedTarget)) {
      return; // 焦点仍在高级设置区域内，不校验
    }
    if (takeProfitType === takeProfitPriceValue && takeProfitPrice) {
      setTakeProfitTouched(true);
    }
    if (stopLossType === stopLossPriceValue && stopLossPrice) {
      setStopLossTouched(true);
    }
  };

  // 验证止盈价格
  const validateTakeProfit = () => {
    if (takeProfitType === takeProfitPriceValue && takeProfitPrice) {
      return !(currentPrice > 0 && Number(takeProfitPrice) < currentPrice);
    }
    return true;
  };

  // 验证止损价格
  const validateStopLoss = () => {
    if (stopLossType === stopLossPriceValue && stopLossPrice) {
      return !(currentPrice > 0 && Number(stopLossPrice) > currentPrice);
    }
    return true;
  };

  const takeProfitError = takeProfitTouched && currentPrice > 0 && takeProfitPrice && Number(takeProfitPrice) < currentPrice;
  const stopLossError = stopLossTouched && currentPrice > 0 && stopLossPrice && Number(stopLossPrice) > currentPrice;

  // 暴露验证方法给父组件
  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    validate: () => {
      const isTakeProfitValid = validateTakeProfit();
      const isStopLossValid = validateStopLoss();

      if (!isTakeProfitValid || !isStopLossValid) {
        const scrollAndFocus = (targetRef: React.RefObject<HTMLDivElement>) => {
          targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = targetRef.current?.querySelector('input');
          input?.focus();
        };

        if (!open) {
          onToggle();
          setTimeout(() => {
            if (!isTakeProfitValid) {
              setTakeProfitTouched(true);
              scrollAndFocus(takeProfitInputRef);
            } else {
              setStopLossTouched(true);
              scrollAndFocus(stopLossInputRef);
            }
          }, 100);
        } else {
          if (!isTakeProfitValid) {
            setTakeProfitTouched(true);
            scrollAndFocus(takeProfitInputRef);
          } else {
            setStopLossTouched(true);
            scrollAndFocus(stopLossInputRef);
          }
        }
        return false;
      }
      return true;
    }
  }));

  const takeProfitBreakValue = useStopPrefix ? 'stop_break_upper' : 'breakUpper';
  const takeProfitPriceValue = useStopPrefix ? 'stop_take_profit' : 'price';
  const stopLossBreakValue = useStopPrefix ? 'stop_break_lower' : 'breakLower';
  const stopLossPriceValue = useStopPrefix ? 'stop_loss' : 'price';

  // 处理止盈价格输入变化
  const handleTakeProfitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = limitDecimalPlaces(e.target.value, precisionDecimals ?? 8);
    setTakeProfitTouched(false);
    onTakeProfitPriceChange?.(value);
  };

  // 处理止盈价格失焦
  const handleTakeProfitPriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleContentBlur(e);
  };

  // 处理止损价格输入变化
  const handleStopLossPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = limitDecimalPlaces(e.target.value, precisionDecimals ?? 8);
    setStopLossTouched(false);
    onStopLossPriceChange?.(value);
  };

  // 处理止损价格失焦
  const handleStopLossPriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleContentBlur(e);
  };

  // 处理止盈 Radio 点击
  const handleTakeProfitRadioClick = (value: string) => {
    if (takeProfitType === value) {
      // 如果点击的是已选中的，则取消选择
      onTakeProfitTypeChange('');
    } else {
      // 否则选中
      onTakeProfitTypeChange(value);
    }
  };

  // 处理止损 Radio 点击
  const handleStopLossRadioClick = (value: string) => {
    if (stopLossType === value) {
      // 如果点击的是已选中的，则取消选择
      onStopLossTypeChange('');
    } else {
      // 否则选中
      onStopLossTypeChange(value);
    }
  };

  return (
    <div ref={sectionRef} className={styles.advancedSection}>
      <div className={styles.advancedHeader} onClick={onToggle}>
        <span>{t('advanced-settings')}</span>
        <ArrowDownIcon className={`${styles.arrowIcon} ${open ? styles.open : ''}`} />
      </div>
      {open && (
        <div ref={contentRef} className={styles.advancedContent}>
          <div className={styles.stopConditionTitle}>{t('stop-condition')}</div>

          {/* 止盈 */}
          <div className={styles.conditionGroup}>
            <div className={styles.radioGroup}>
              <Radio
                checked={takeProfitType === takeProfitBreakValue}
                onClick={() => handleTakeProfitRadioClick(takeProfitBreakValue)}
              >
                {t('break-upper-limit')}
              </Radio>
              <Radio
                checked={takeProfitType === takeProfitPriceValue}
                onClick={() => handleTakeProfitRadioClick(takeProfitPriceValue)}
              >
                {t('take-profit-price')}
              </Radio>
            </div>
            {takeProfitType === takeProfitPriceValue && (
              <div ref={takeProfitInputRef} className={`${styles.conditionInput} ${takeProfitError ? styles.hasError : ''}`}>
                <Input
                  placeholder={t('take-profit-price-placeholder')}
                  suffix={quoteToken}
                  value={takeProfitPrice}
                  onChange={handleTakeProfitPriceChange}
                  onBlur={handleTakeProfitPriceBlur}
                />
                {takeProfitError && (
                  <div className={styles.errorTip}>{t('take-profit-too-low')}</div>
                )}
              </div>
            )}
          </div>

          {/* 止损 */}
          <div className={styles.conditionGroup}>
            <div className={styles.radioGroup}>
              <Radio
                checked={stopLossType === stopLossBreakValue}
                onClick={() => handleStopLossRadioClick(stopLossBreakValue)}
              >
                {t('break-lower-limit')}
              </Radio>
              <Radio
                checked={stopLossType === stopLossPriceValue}
                onClick={() => handleStopLossRadioClick(stopLossPriceValue)}
              >
                {t('stop-loss-price')}
              </Radio>
            </div>
            {stopLossType === stopLossPriceValue && (
              <div ref={stopLossInputRef} className={`${styles.conditionInput} ${stopLossError ? styles.hasError : ''}`}>
                <Input
                  placeholder={t('stop-loss-price-placeholder')}
                  suffix={quoteToken}
                  value={stopLossPrice}
                  onChange={handleStopLossPriceChange}
                  onBlur={handleStopLossPriceBlur}
                />
                {stopLossError && (
                  <div className={styles.errorTip}>{t('stop-loss-too-high')}</div>
                )}
              </div>
            )}
          </div>
          <div className={styles.conditionDesc}>
            <div className={styles.conditionDescLabel}>{t('settlement-mode')}</div>
            <div className={styles.conditionDescValue}>{t('sell-on-termination', { token: baseToken })}</div>
          </div>
        </div>
      )}
    </div>
  );
});

AdvancedSettings.displayName = 'AdvancedSettings';

export default AdvancedSettings;
