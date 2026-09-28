import React, { useCallback } from 'react';
import { Input, Slider } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface InvestmentInputProps {
  investAmount: string;
  sliderValue: number;
  spotBalance: string;
  tokenSymbol: string;
  onValueChange: (investAmount: string, sliderValue: number) => void;
  onSwitchAccount: () => void;
  showTitle?: boolean;
  title?: string;
  recommendMinAmount?: string;
  actionIcon?: React.ReactNode;
  errorMsg?: string;
  onBlur?: () => void;
}

const limitDecimalPlaces = (value: string, maxDecimals = 8): string => {
  if (!value) return value;

  const regex = /^\d*\.?\d*$/;
  if (!regex.test(value)) {
    return value.slice(0, -1);
  }

  const parts = value.split('.');
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    return `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
  }

  return value;
};

const calcSliderFromAmount = (amount: string, balance: number): number => {
  if (balance > 0 && amount) {
    return Math.min(100, Math.max(0, (Number(amount) / balance) * 100));
  }
  return 0;
};

const calcAmountFromSlider = (slider: number, balance: number): string => {
  return (balance * slider / 100).toFixed(2);
};

const InvestmentInput: React.FC<InvestmentInputProps> = ({
  investAmount,
  sliderValue,
  spotBalance,
  tokenSymbol,
  onValueChange,
  onSwitchAccount,
  title,
  recommendMinAmount,
  actionIcon,
  errorMsg,
  onBlur
}) => {
  const t = useFm();
  const displayTitle = title || t('investment-amount');
  const placeholder = recommendMinAmount
    ? `${t('recommend')} ≥ ${recommendMinAmount}`
    : t('please-enter');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = limitDecimalPlaces(e.target.value, 2);
    const balance = Number(spotBalance);
    onValueChange(value, calcSliderFromAmount(value, balance));
  }, [spotBalance, onValueChange]);

  const handleSliderChange = useCallback((value: number) => {
    const balance = Number(spotBalance);
    onValueChange(calcAmountFromSlider(value, balance), value);
  }, [spotBalance, onValueChange]);

  return (
    <div className={styles.investSection}>
      <h4 className={styles.sectionTitle}>{displayTitle}</h4>
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <Input
            className={errorMsg ? styles.inputError : undefined}
            value={investAmount}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            suffix={<span className={styles.inputSuffix}>{tokenSymbol}</span>}
          />
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        </div>
        <div className={styles.sliderWrapper}>
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            marks={{
              0: '0%',
              25: '25%',
              50: '50%',
              75: '75%',
              100: '100%'
            }}
            tooltip={{
              color: 'var(--fill-fill-tooltip-web, #28292A)',
              formatter: (value) => `${value}%`
            }}
          />
        </div>
        <div className={styles.availableBalance}>
          <span className={styles.balanceLabel}>{t('spot-account-available')}</span>
          <div className={styles.balanceValue}>
            <span>{spotBalance} {tokenSymbol}</span>
            <span className={styles.switchIcon} onClick={onSwitchAccount}>{actionIcon}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentInput;
