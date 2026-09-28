import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { getSymbolLastPrice, getSymbolSwapPreview } from '~/api';
import { ChangeStatusEnum, SwapSideEnum } from '~/enums';
import { ISymbolLastPrice, ISymbolSwapConfig, ISymbolSwapQuoteInfo } from '~/interface';

// 倒计时刷新6次后，停止刷新，需要手动触发
const MAX_COUNTDOWN_CYCLES = 6;
/**
 * 金额输入转换、验证、交易侧切换以及价格定时刷新定时器等核心业务逻辑。
 * @param curSymbolSwapConfig
 * @param t
 * @param fetchData
 * @param swapSide
 * @param setSwapSide
 */
export const useSwapLogic = (
  curSymbolSwapConfig: ISymbolSwapConfig | undefined,
  t: (key: string, options?: any) => string,
  fetchData: () => Promise<void>,
  swapSide: SwapSideEnum,
  setSwapSide: (side: SwapSideEnum) => void
) => {
  // --- Amount & Side State ---
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [lastChange, setLastChange] = useState<ChangeStatusEnum>(ChangeStatusEnum.FROM);

  // --- Rate & Timer State ---
  const [symbolLastPriceInfo, setSymbolLastPriceInfo] = useState<ISymbolLastPrice>();
  const [countdown, setCountdown] = useState<number>(8);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [swapQuote, setSwapQuote] = useState<ISymbolSwapQuoteInfo | undefined>();
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isConfirmSwap, setIsConfirmSwap] = useState(false);

  const countdownTimerRef = useRef<number | null>(null);
  const countdownCycleRef = useRef(0);
  const [isBuy, setIsBuy] = useState<boolean>(true);


  useEffect(() => {
    setIsBuy(swapSide === SwapSideEnum.BUY);
  }, [swapSide]);

  // --- Derived Configs ---
  const fromConfig = useMemo(() => {
    if (!curSymbolSwapConfig) return {} as any;
    if (isBuy) {
      return {
        token: curSymbolSwapConfig.quote_token,
        balance: curSymbolSwapConfig.quote_token_balance,
        minSwap: curSymbolSwapConfig.quote_token_min_swap_quantity,
        maxSwap: curSymbolSwapConfig.quote_token_max_swap_quantity,
        precision: Number(curSymbolSwapConfig.quote_precision)
      };
    }
    return {
      token: curSymbolSwapConfig.base_token,
      balance: curSymbolSwapConfig.base_token_balance,
      minSwap: curSymbolSwapConfig.base_token_min_swap_quantity,
      maxSwap: curSymbolSwapConfig.base_token_max_swap_quantity,
      precision: Number(curSymbolSwapConfig.base_precision)
    };
  }, [curSymbolSwapConfig, isBuy]);

  const toConfig = useMemo(() => {
    if (!curSymbolSwapConfig) return {} as any;
    if (isBuy) {
      return {
        token: curSymbolSwapConfig.base_token,
        balance: curSymbolSwapConfig.base_token_balance,
        minSwap: curSymbolSwapConfig.base_token_min_swap_quantity,
        maxSwap: curSymbolSwapConfig.base_token_max_swap_quantity,
        precision: Number(curSymbolSwapConfig.base_precision)
      };
    }
    return {
      token: curSymbolSwapConfig.quote_token,
      balance: curSymbolSwapConfig.quote_token_balance,
      minSwap: curSymbolSwapConfig.quote_token_min_swap_quantity,
      maxSwap: curSymbolSwapConfig.quote_token_max_swap_quantity,
      precision: Number(curSymbolSwapConfig.quote_precision)
    };
  }, [curSymbolSwapConfig, isBuy]);

  const fromCoin = fromConfig.token || '';
  const toCoin = toConfig.token || '';
  const balance = fromConfig.balance || '0';
  const fromPrecision = fromConfig.precision || 0;
  const toPrecision = toConfig.precision || 0;

  // --- Conversion Logic ---
  const { curPrice, curRate } = useMemo(() => {
    if (isBuy) {
      return {
        curPrice: symbolLastPriceInfo?.buy_price || 1,
        curRate: symbolLastPriceInfo?.buy_swap_rate || 1,
      }
    }else {
      return {
        curPrice: symbolLastPriceInfo?.sell_price || 1,
        curRate: symbolLastPriceInfo?.sell_swap_rate || 1,
      }
    }
    // return new BigNumber(
    //   (isBuy
    //     ? symbolLastPriceInfo?.buy_swap_rate
    //     : symbolLastPriceInfo?.sell_swap_rate) || 1
    // );
  }, [isBuy, symbolLastPriceInfo]);

  const convertFromAmountToAmount = useCallback(
    (amount: string): BigNumber | '' => {
      if (amount === '') return '';
      const bnAmount = new BigNumber(isNaN(Number(amount)) ? 0 : (amount || 0));
      return isBuy ? bnAmount.times(curRate) : bnAmount.times(curPrice);
    },
    [isBuy, curPrice, curRate]
  );

  const convertToAmountToFromAmount = useCallback(
    (amount: string): BigNumber | '' => {
      if (amount === '') return '';
      const bnAmount = new BigNumber(isNaN(Number(amount)) ? 0 : (amount || 0));
      return isBuy ? bnAmount.times(curPrice) : bnAmount.times(curRate);
    },
    [isBuy, curPrice, curRate]
  );

  // --- Effects ---
  useEffect(() => {
    setTimeout(() => {
      setFromAmount('');
      setToAmount('');
    }, 300);
  }, [curSymbolSwapConfig]);

  useEffect(() => {
    if (!symbolLastPriceInfo || !fromAmount) return;
    if (lastChange === ChangeStatusEnum.FROM) {
      // @ts-ignore
      const convertedAmount = fromAmount !== '' ? convertFromAmountToAmount(fromAmount).decimalPlaces(toPrecision, BigNumber.ROUND_DOWN).toString() : '';
      if (convertedAmount !== toAmount) setToAmount(convertedAmount);
    } else if (lastChange === ChangeStatusEnum.TO && toAmount) {
      // @ts-ignore
      const convertedAmount = toAmount !== '' ? convertToAmountToFromAmount(toAmount).decimalPlaces(fromPrecision, BigNumber.ROUND_DOWN).toString() : '';
      // 确认框打开后，不从获得计算消耗，服务端仅支持从消耗计算获得
      if (convertedAmount !== fromAmount && !isConfirmSwap) setFromAmount(convertedAmount);
    }
  }, [symbolLastPriceInfo, fromAmount, toAmount, lastChange, toPrecision, fromPrecision, convertFromAmountToAmount, convertToAmountToFromAmount, isConfirmSwap]);

  // --- Rate Timer Logic ---
  const resetCycleNum = useCallback(() => {
    countdownCycleRef.current = 0;
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const stopCountdown = () => {
      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
    const controller = new AbortController();
    const initRateTimer = async () => {
      try {
        const curSymbol = curSymbolSwapConfig?.symbol;
        if (!curSymbol) {
          stopCountdown();
          setCountdown(0);
          return;
        }
        stopCountdown();
        setConfirmLoading(true);

        let res = null;
        if (isConfirmSwap && fromAmount && swapSide && curSymbol) {
          res = await getSymbolSwapPreview({ symbol: curSymbol, side: swapSide, quantity: fromAmount }, controller.signal);
          setSwapQuote(res);
          setIsShowConfirm(true);
        }else {
          res = await getSymbolLastPrice({ symbol: curSymbol }, controller.signal);
        }

        setConfirmLoading(false);
        if (controller.signal.aborted) return;
        setSymbolLastPriceInfo({ ...res, symbol: curSymbol });
        setCountdown(8);
        countdownTimerRef.current = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              stopCountdown();
              countdownCycleRef.current += 1;
              if (countdownCycleRef.current < MAX_COUNTDOWN_CYCLES && !controller.signal.aborted) {
                void initRateTimer();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };
    void initRateTimer();
    return () => {
      controller.abort();
      stopCountdown();
    };
  }, [curSymbolSwapConfig?.symbol, !!fromAmount, isConfirmSwap, !!swapSide, refreshTrigger]);

  // --- Handlers ---
  const validateAmount = useCallback(
    (amount: string, min: string, max: string, checkBalance = false, balanceValue = '0') => {
      if (amount === '' || isNaN(Number(amount))) return '';
      const value = new BigNumber(amount);
      const minNum = new BigNumber(min || 0);
      const maxNum = new BigNumber(max || 0);
      if (value.isLessThan(minNum) || value.isGreaterThan(maxNum)) return `${t('amount-limit')}${min}-${max}`;
      if (checkBalance && value.isGreaterThan(new BigNumber(balanceValue))) return t('insufficient-balance');
      return '';
    },
    [t]
  );

  const handleAmountInput = useCallback(
    (inputValue: string, inputPrecision: number, outputPrecision: number, setCurrentAmount: (val: string) => void, setOtherAmount: (val: string) => void, convertFn: (val: string) => BigNumber | '', changeStatus: ChangeStatusEnum) => {
      const isValidNumber = /^-?\d*(\.\d*)?$/.test(inputValue);
      if (!isValidNumber && inputValue !== '' && inputValue !== '-') return;
      if (inputValue.includes('.')) {
        const decimalPart = inputValue.split('.')[1] || '';
        if (decimalPart.length > inputPrecision) return;
      }
      setCurrentAmount(inputValue);
      // @ts-ignore
      const convertedAmount = inputValue === '' || isNaN(Number(inputValue))? '' : convertFn(inputValue).decimalPlaces(outputPrecision, BigNumber.ROUND_DOWN).toString();
      setOtherAmount(convertedAmount === '' ? '' : convertedAmount);
      setLastChange(changeStatus);
    },
    []
  );

  const handleFromValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    handleAmountInput(e.target.value, fromPrecision, toPrecision, setFromAmount, setToAmount, convertFromAmountToAmount, ChangeStatusEnum.FROM);
    if (e.target.value && countdownCycleRef.current >= MAX_COUNTDOWN_CYCLES) {
      resetCycleNum();
    }
  }, [handleAmountInput, fromPrecision, toPrecision, convertFromAmountToAmount, resetCycleNum]);

  const handleToValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    handleAmountInput(e.target.value, toPrecision, fromPrecision, setToAmount, setFromAmount, convertToAmountToFromAmount, ChangeStatusEnum.TO);
    if (e.target.value && countdownCycleRef.current >= MAX_COUNTDOWN_CYCLES) {
      resetCycleNum();
    }
  }, [handleAmountInput, toPrecision, fromPrecision, convertToAmountToFromAmount, resetCycleNum]);

  const handleTransfer = useCallback(() => {
    const newSide = isBuy ? SwapSideEnum.SELL : SwapSideEnum.BUY;
    setSwapSide(newSide);
    setLastChange(lastChange === ChangeStatusEnum.FROM ? ChangeStatusEnum.TO : ChangeStatusEnum.FROM);
    if (fromAmount === '') return;
    const newPrice = new BigNumber(newSide === SwapSideEnum.BUY ? (symbolLastPriceInfo?.buy_price || '1') : (symbolLastPriceInfo?.sell_price || '1'));
    if (lastChange === ChangeStatusEnum.FROM) {
      const temp = fromAmount;
      const tempBN = new BigNumber(temp);
      const newFromAmount = newSide === SwapSideEnum.BUY ? tempBN.times(newPrice).decimalPlaces(fromPrecision, BigNumber.ROUND_DOWN) : tempBN.div(newPrice).decimalPlaces(fromPrecision, BigNumber.ROUND_DOWN);
      setFromAmount(newFromAmount.toString());
      setToAmount(temp);
    } else {
      const temp = toAmount;
      const tempBN = new BigNumber(temp);
      const newToAmount = newSide === SwapSideEnum.BUY ? tempBN.div(newPrice).decimalPlaces(toPrecision, BigNumber.ROUND_DOWN) : tempBN.times(newPrice).decimalPlaces(toPrecision, BigNumber.ROUND_DOWN);
      setToAmount(newToAmount.toString());
      setFromAmount(temp);
    }
  }, [isBuy, symbolLastPriceInfo, lastChange, fromAmount, toAmount, fromPrecision, toPrecision]);

  const handleMaxBalance = useCallback(() => {
    const maxVal = BigNumber.min(new BigNumber(balance || 0), new BigNumber(fromConfig.maxSwap || Infinity));
    handleFromValue({ target: { value: maxVal.isNaN() ? '0' : maxVal.decimalPlaces(fromPrecision, BigNumber.ROUND_DOWN).toString() } } as ChangeEvent<HTMLInputElement>);
  }, [balance, fromConfig.maxSwap, fromPrecision, handleFromValue]);

  const handleComplete = useCallback(() => {
    setFromAmount('');
    setToAmount('');
    setLastChange(ChangeStatusEnum.FROM);
    void fetchData();
  }, [fetchData]);

  const fromValidStr = useMemo(() => validateAmount(fromAmount, fromConfig.minSwap || '0', fromConfig.maxSwap || '0', true, balance), [fromAmount, fromConfig, balance, validateAmount]);
  const toValidStr = useMemo(() => '', []);
  const isConfirmDisabled = useMemo(() => Boolean(!fromAmount || !toAmount || fromValidStr || toValidStr), [fromAmount, toAmount, fromValidStr, toValidStr]);

  const fromPlaceHolder = `${fromConfig.minSwap || ''} - ${fromConfig.maxSwap || ''}`;
  const toPlaceHolder = `${toConfig.minSwap || ''} - ${toConfig.maxSwap || ''}`;

  return useMemo(() => ({
    fromAmount, setFromAmount, toAmount, setToAmount, swapSide, setSwapSide,
    fromCoin, toCoin, balance, fromValidStr, toValidStr, fromPlaceHolder, toPlaceHolder,
    handleFromValue, handleToValue, handleTransfer, handleMaxBalance,
    symbolLastPriceInfo, countdown, countdownCycle: countdownCycleRef.current,
    confirmLoading, swapQuote, isShowConfirm, setIsShowConfirm,
    isConfirmSwap, setIsConfirmSwap, resetCycleNum, handleComplete,
    isConfirmDisabled,lastChange, MAX_COUNTDOWN_CYCLES
  }), [
    fromAmount, toAmount, swapSide, fromCoin, toCoin, balance, fromValidStr, toValidStr,
    fromPlaceHolder, toPlaceHolder, handleFromValue, handleToValue, handleTransfer,
    handleMaxBalance, symbolLastPriceInfo, countdown, confirmLoading, swapQuote,
    isShowConfirm, isConfirmSwap, resetCycleNum, handleComplete,
    isConfirmDisabled,lastChange
  ]);
};
