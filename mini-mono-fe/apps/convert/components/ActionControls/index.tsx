import React from 'react';
import CoinSelectDropDown, { Option } from '~/components/CoinSelectDropDown';
import AddAssetsModal from '~/components/AddAssetsModal';
import ConfirmModal from '~/components/ConfirmModal';
import { ISymbolSwapConfig, ISymbolSwapQuoteInfo } from '~/interface';

interface ActionControlsProps {
  t: (key: string) => string;
  // 用户登录状态
  isLogin: boolean | undefined;
  // 确认按钮是否禁用
  isConfirmDisabled: boolean;
  // 确认按钮加载状态
  confirmLoading: boolean;
  // 确认按钮点击处理函数
  handleConfirm: () => void;
  // 是否显示源币种下拉框
  showFromDropDown: boolean;
  // 源币种列表
  fromSymbolList: Option[];
  // 币种选择处理函数
  handleSymbolSelect: (config: ISymbolSwapConfig) => void;
  // 设置源币种下拉框显示状态
  setShowFromDropDown: (val: boolean) => void;
  // 是否显示目标币种下拉框
  showToDropDown: boolean;
  // 目标币种列表
  toSymbolList: Option[];
  // 设置目标币种下拉框显示状态
  setShowToDropDown: (val: boolean) => void;
  // 是否显示添加资产弹窗
  isShowAddAssets: boolean;
  // 设置添加资产弹窗显示状态
  setIsShowAddAssets: (val: boolean) => void;
  // 当前交易对符号
  curSymbol: string;
  // 是否显示确认弹窗
  isShowConfirm: boolean;
  // 兑换报价信息
  swapQuote: ISymbolSwapQuoteInfo | undefined;
  // 兑换完成处理函数
  handleComplete: () => void;
  // 倒计时秒数
  countdown: number;
  // 倒计时周期数
  countdownCycle: number;
  // 重置倒计时周期处理函数
  resetCycleNum: () => void;
  // 关闭确认弹窗处理函数
  handleCloseConfirm: () => void;

  MAX_COUNTDOWN_CYCLES: number;
}

/**
 * 确认按钮及币种选择、增加资产、确认下单等弹窗
 * @param t
 * @param isLogin
 * @param isConfirmDisabled
 * @param confirmLoading
 * @param handleConfirm
 * @param showFromDropDown
 * @param fromSymbolList
 * @param handleSymbolSelect
 * @param setShowFromDropDown
 * @param showToDropDown
 * @param toSymbolList
 * @param setShowToDropDown
 * @param isShowAddAssets
 * @param setIsShowAddAssets
 * @param curSymbol
 * @param isShowConfirm
 * @param swapQuote
 * @param handleComplete
 * @param countdown
 * @param countdownCycle
 * @param resetCycleNum
 * @param handleCloseConfirm
 * @constructor
 */
const ActionControls: React.FC<ActionControlsProps> = ({
  t,
  isLogin,
  isConfirmDisabled,
  confirmLoading,
  handleConfirm,
  showFromDropDown,
  fromSymbolList,
  handleSymbolSelect,
  setShowFromDropDown,
  showToDropDown,
  toSymbolList,
  setShowToDropDown,
  isShowAddAssets,
  setIsShowAddAssets,
  curSymbol,
  isShowConfirm,
  swapQuote,
  handleComplete,
  countdown,
  countdownCycle,
  resetCycleNum,
  handleCloseConfirm,
  MAX_COUNTDOWN_CYCLES
}) => {
  return (
    <>
      <div
        className={`w-full h-12 btn-primary flex items-center justify-center gap-2 ${
          (isConfirmDisabled || confirmLoading) && isLogin
            ? 'btn-primary-disabled text-text-quaternary!'
            : ''
        }`}
        onClick={handleConfirm}
        aria-disabled={isConfirmDisabled || confirmLoading}
      >
        {isLogin ? countdownCycle < MAX_COUNTDOWN_CYCLES ? t('convert') : t('refresh-rate') : t('login')}
      </div>
      <CoinSelectDropDown
        visible={showFromDropDown}
        optionsList={fromSymbolList}
        onSelect={handleSymbolSelect}
        onClose={() => setShowFromDropDown(false)}
      />
      <CoinSelectDropDown
        className="top-80"
        visible={showToDropDown}
        optionsList={toSymbolList}
        onSelect={handleSymbolSelect}
        onClose={() => setShowToDropDown(false)}
      />
      <AddAssetsModal
        open={isShowAddAssets}
        symbol={curSymbol.replace('_', '/')}
        close={() => setIsShowAddAssets(false)}
      />
      <ConfirmModal
        open={isShowConfirm}
        swapQuote={swapQuote}
        complete={handleComplete}
        countdown={countdown}
        cycleNum={countdownCycle}
        update={resetCycleNum}
        close={handleCloseConfirm}
      />
    </>
  );
};

export default ActionControls;
