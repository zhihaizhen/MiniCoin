import React, { useMemo, useState } from 'react';
import Rules from '~/components/Rules';
import { goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { ISymbolSwapConfig } from '~/interface';
import { ChangeStatusEnum, SwapSideEnum } from '~/enums';
import BigNumber from 'bignumber.js';
import { ReactComponent as HistoryIcon } from '~/public/images/history.svg';

// Custom Hooks
import { useSwapData } from '~/hooks/useSwapData';
import { useSwapLogic } from '~/hooks/useSwapLogic';

// Sub-components
import ConvertHeader from '~/components/ConvertHeader';
import SwapForm from '~/components/SwapForm';
import RateDisplay from '~/components/RateDisplay';
import ActionControls from '~/components/ActionControls';


const MainContent: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const [isShowAddAssets, setIsShowAddAssets] = useState(false);
  const [showFromDropDown, setShowFromDropDown] = useState(false);
  const [showToDropDown, setShowToDropDown] = useState(false);
  const [swapSide, setSwapSide] = useState<SwapSideEnum>(SwapSideEnum.SELL);
  const [priceRateDir, setPriceRateDir] = useState<ChangeStatusEnum>(ChangeStatusEnum.FROM);

  const {
    symbolSwapConfigList,
    curSymbolSwapConfig,
    setCurSymbolSwapConfig,
    loading,
    fetchData,
    getSymbolList
  } = useSwapData(isLogin, setSwapSide);

  const swapLogic = useSwapLogic(curSymbolSwapConfig, t, fetchData, swapSide, setSwapSide);

  const {
    handleConfirm,
    handleSwitchPrice,
    handleSymbolSelect,
    handleHistory,
    handleCloseConfirm,
    curPriceRateStr,
    fromSymbolList,
    toSymbolList
  } = useMemo(() => {
    const handleConfirm = () => {
      if (!isLogin) {
        goPage('login');
        return;
      }
      if (swapLogic.isConfirmDisabled || swapLogic.confirmLoading) return;
      if (swapLogic.countdownCycle >= swapLogic.MAX_COUNTDOWN_CYCLES) {
        swapLogic.resetCycleNum();
        return;
      }
      swapLogic.setIsConfirmSwap(true);
    };

    const handleSwitchPrice = () => {
      setPriceRateDir(prev => prev === ChangeStatusEnum.FROM ? ChangeStatusEnum.TO : ChangeStatusEnum.FROM);
    };

    const handleSymbolSelect = (config: ISymbolSwapConfig) => {
      setCurSymbolSwapConfig(config);
    };

    const handleHistory = () => {
      if (!isLogin) {
        goPage('login');
        return;
      }
      goPage('convertOrder');
    };

    const handleCloseConfirm = () => {
      swapLogic.setIsConfirmSwap(false);
      swapLogic.setIsShowConfirm(false);
    };

    const currentRate = (() => {
      const rateMap = {
        [SwapSideEnum.BUY]: {
          [ChangeStatusEnum.TO]: swapLogic.symbolLastPriceInfo?.buy_swap_rate,
          [ChangeStatusEnum.FROM]: swapLogic.symbolLastPriceInfo?.buy_price
        },
        [SwapSideEnum.SELL]: {
          [ChangeStatusEnum.FROM]: swapLogic.symbolLastPriceInfo?.sell_price,
          [ChangeStatusEnum.TO]: swapLogic.symbolLastPriceInfo?.sell_swap_rate
        }
      };
      return rateMap[swapLogic.swapSide]?.[priceRateDir];
    })();

    const curPriceRateStr = (() => {
      if (!curSymbolSwapConfig) return '';
      const { base_token, quote_token } = curSymbolSwapConfig;
      const [token1, token2] = priceRateDir === ChangeStatusEnum.FROM
        ? [base_token, quote_token]
        : [quote_token, base_token];
      const formattedRate = currentRate ? new BigNumber(currentRate).toFixed() : '--';
      return `1 ${token1} ≈ ${formattedRate} ${token2}`;
    })();

    const fromSymbolList = getSymbolList(swapLogic.toCoin, swapLogic.fromCoin, symbolSwapConfigList, curSymbolSwapConfig);
    const toSymbolList = getSymbolList(swapLogic.fromCoin, swapLogic.toCoin, symbolSwapConfigList, curSymbolSwapConfig);

    return {
      handleConfirm, handleSwitchPrice, handleSymbolSelect, handleHistory,
      handleCloseConfirm, curPriceRateStr, fromSymbolList, toSymbolList
    };
  }, [getSymbolList, swapLogic, symbolSwapConfigList, curSymbolSwapConfig, isLogin, setCurSymbolSwapConfig, priceRateDir]);

  return (
    <div className="max-w-[1216px] mx-auto pt-6 md:pt-[90px] px-4">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <ConvertHeader t={t} fromCoin={swapLogic.fromCoin} toCoin={swapLogic.toCoin} />
        <div className="relative w-full md:w-[536px] h-auto rounded-[20px] py-5 md:py-6 px-5 md:px-[30px] flex flex-col justify-between gap-7 border border-(--line-border-default,#EBEBEB) bg-(--bg-primary,#FFF) shadow-[0_4px_11.9px_0_rgba(0,0,0,0.10)]">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center justify-start gap-2 min-w-10">
              <div className="text-text-primary text-lg font-bold">
                {t('convert-title')}
              </div>
              <span className="px-1 py-0.5 text-text-black text-[10px] font-bold bg-text-brand-default-web rounded-sm leading-4">
                {new BigNumber(curSymbolSwapConfig?.symbol_swap_fee_rate || 0).toFixed()} {t('fees')}
              </span>
            </div>
            <HistoryIcon className="cursor-pointer hover:text-text-brand-default-web" onClick={handleHistory} />
          </div>
          <div className="relative">
            <SwapForm
              t={t}
              {...swapLogic}
              lastChange={swapLogic.lastChange}
              loading={loading}
              showToDropDown={showToDropDown}
              showFromDropDown={showFromDropDown}
              setShowFromDropDown={setShowFromDropDown}
              setShowToDropDown={setShowToDropDown}
              setIsShowAddAssets={setIsShowAddAssets}
            />
            <RateDisplay
              t={t}
              countdown={swapLogic.countdown}
              countdownCycle={swapLogic.countdownCycle}
              maxCountdownCycles={swapLogic.MAX_COUNTDOWN_CYCLES}
              curPriceRateStr={curPriceRateStr}
              resetCycleNum={swapLogic.resetCycleNum}
              handleSwitchPrice={handleSwitchPrice}
              showRate={!!curSymbolSwapConfig}
            />
          </div>
          <ActionControls
            t={t}
            isLogin={isLogin}
            isConfirmDisabled={swapLogic.isConfirmDisabled}
            confirmLoading={swapLogic.confirmLoading}
            handleConfirm={handleConfirm}
            showFromDropDown={showFromDropDown}
            fromSymbolList={fromSymbolList}
            handleSymbolSelect={handleSymbolSelect}
            setShowFromDropDown={setShowFromDropDown}
            showToDropDown={showToDropDown}
            toSymbolList={toSymbolList}
            setShowToDropDown={setShowToDropDown}
            isShowAddAssets={isShowAddAssets}
            setIsShowAddAssets={setIsShowAddAssets}
            curSymbol={curSymbolSwapConfig?.symbol || ''}
            isShowConfirm={swapLogic.isShowConfirm}
            swapQuote={swapLogic.swapQuote}
            handleComplete={swapLogic.handleComplete}
            countdown={swapLogic.countdown}
            countdownCycle={swapLogic.countdownCycle}
            resetCycleNum={swapLogic.resetCycleNum}
            handleCloseConfirm={handleCloseConfirm}
            MAX_COUNTDOWN_CYCLES={swapLogic.MAX_COUNTDOWN_CYCLES}
          />
        </div>
      </div>
      <Rules />
    </div>
  );
};

export default MainContent;
