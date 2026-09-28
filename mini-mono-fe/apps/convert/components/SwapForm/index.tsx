import React from 'react';
import AmountInput from '~/components/AmountInput';
import { ReactComponent as TransferIcon } from '~/public/images/coin-transfer.svg';
import { ChangeStatusEnum } from '~/enums';

interface SwapFormProps {
  t: (key: string) => string;
  fromCoin: string;
  fromAmount: string;
  fromPlaceHolder: string;
  fromValidStr: string;
  balance: string;
  loading: boolean;
  handleFromValue: (e: any) => void;
  setShowFromDropDown: (val: boolean) => void;
  setIsShowAddAssets: (val: boolean) => void;
  handleMaxBalance: () => void;
  handleTransfer: () => void;
  toCoin: string;
  toAmount: string;
  toPlaceHolder: string;
  toValidStr: string;
  handleToValue: (e: any) => void;
  setShowToDropDown: (val: boolean) => void;
  showFromDropDown: boolean;
  showToDropDown: boolean;
  lastChange: ChangeStatusEnum
}

/**
 * 金额输入框及其交互逻辑
 * @param t
 * @param fromCoin
 * @param fromAmount
 * @param fromPlaceHolder
 * @param fromValidStr
 * @param balance
 * @param loading
 * @param handleFromValue
 * @param setShowFromDropDown
 * @param setIsShowAddAssets
 * @param handleMaxBalance
 * @param handleTransfer
 * @param toCoin
 * @param toAmount
 * @param toPlaceHolder
 * @param toValidStr
 * @param handleToValue
 * @param setShowToDropDown
 * @constructor
 */
const SwapForm: React.FC<SwapFormProps> = React.memo(({
  t,
  fromCoin,
  fromAmount,
  fromPlaceHolder,
  fromValidStr,
  balance,
  loading,
  handleFromValue,
  setIsShowAddAssets,
  handleMaxBalance,
  handleTransfer,
  toCoin,
  toAmount,
  toPlaceHolder,
  toValidStr,
  handleToValue,
  setShowToDropDown,
  setShowFromDropDown,
  showFromDropDown,
  showToDropDown,
  lastChange

}) => {
  return (
    <div className="relative">
      <AmountInput
        label={t('from')}
        coin={fromCoin}
        amount={fromAmount}
        placeholder={fromPlaceHolder}
        validStr={fromValidStr}
        showBalance
        balance={balance}
        loading={loading}
        active={lastChange === ChangeStatusEnum.FROM}
        onAmountChange={handleFromValue}
        showDropDown={showFromDropDown}
        onCoinClick={() => setShowFromDropDown(true)}
        onAddAssets={() => setIsShowAddAssets(true)}
        onMaxBalance={handleMaxBalance}
        t={t}
      />
      <div
        className="absolute w-9 h-9 bg-bg-primary rounded-lg flex items-center justify-center left-1/2 -translate-x-1/2 -translate-y-[9px] cursor-pointer z-1"
        onClick={handleTransfer}
      >
        <TransferIcon />
      </div>
      <div className="mt-4">
        <AmountInput
          label={t('to')}
          coin={toCoin}
          amount={toAmount}
          placeholder={toPlaceHolder}
          validStr={toValidStr}
          loading={loading}
          active={lastChange === ChangeStatusEnum.TO}
          showDropDown={showToDropDown}
          onCoinClick={() => setShowToDropDown(true)}
          onAmountChange={handleToValue}
          t={t}
        />
      </div>
    </div>
  );
});

export default SwapForm;
