import { Modal } from 'common/antdComponents';
import { toThousands } from '@unified/helpers';
import LocalTimeTips from 'common/components/LocalTimeTips';
import { TV_LOCALE_VALUE } from '../constant';
import ByTradingview from 'common/packages-biz/trade-chart';
import {
  DRAWING_TOOLS_KEY,
  TV_CHART_PROPERTIES,
} from 'common/packages-biz/global-settings/localStorageSettings';
import { FORWARD_TV_LOCAL_KEY } from 'common/packages-biz/global-settings/usdt-settings';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import useOrderbookStream from 'common/public-ws/stream-hooks/use-orderbook-stream';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store-hooks/use-user-store';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import useOrderStore from '@/store-hooks/use-order-store';
import { types, useGlobalState } from '@/store';
import { KLINE_DIALOG_WIDTH_PRIZE } from '@/constants/layout';
import ConfirmCancel from '../Dialog/ConfirmCancel';
import ConfirmClose from '../Dialog/ConfirmClose';
import {
  usePostReplaceOrder,
  useSendCancelActivityPositionOrder,
  useSendCancelConditionsPositionOrder,
  useSendCreateOrder,
} from '../Order/sendOrder';
import { useGenActiveOrderLines } from '../Widget/genActiveOrderLines';
import {
  useGenGetBars,
  useGenSubscribeBars,
  useGenUnsubscribeBars,
} from '../Widget/genBars';
import { useGenQuickOrderProps } from '../Widget/genQuickOrder';
import { useGenSymbols } from '../Widget/genSymbols';

let watchPriceChangeTimer = null;
const oneMinute = 1000 * 60;

const Kline = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const [t] = useTranslation();
  const {
    orderbookData: { ask1Price, bid1Price },
  } = useOrderbookStream();
  const {
    symbol,
    symbolAlias,
    coin,
    walletCoin,
    user: {
      language,
      kline: { cancelOrderTipStatus },
      // userInfo: { userId },
    },
    offline,
    currentTheme,
    currentResolution,
  } = globalState;
  const { loggedIn } = useUserStore();
  const { currentActivityList: activityList } = useOrderStore();
  const {
    lastPriceNumber,
    markPriceNumber,
    indexPriceNumber,
    formattedLastPrice,
  } = useCurSymbolQuoteStream();
  const {
    maxQty,
    lotFraction,
    priceFraction,
    tickSizeFraction,
    priceStep,
    lotSize,
  } = useCurSymbolConfig();

  const [kShow, changekShow] = useState(true);
  const [replaceOrderConfirm, setReplaceOrderConfirm] = useState(null);
  const [replaceOrderText, setReplaceOrderText] = useState('');
  const [closePositionParams, setClosePositionParams] = useState(null);
  const [cancelOrderParams, setCancelOrderParams] = useState(null);
  const [ifHideClosePositionTip, setIfHideClosePositionTip] = useState(false);
  const [ifHideCancelOrderTip, setIfHideCancelOrderTip] = useState(false);
  const [watchPriceChangeStatus, setWatchPriceChangeStatus] = useState(false);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const [showLocalTimeTips, setShowLocalTimeTips] = useState(false); // 本地时间不对的弹窗

  const curStartTime = useRef({});
  const lastData = useRef({});
  const marketDataCb = useRef({});
  const candleDataCb = useRef({});
  const marketTimer = useRef({});
  const offlineTime = useRef(null);
  const tradingViewRef = useRef();
  const subscriber = useRef({});
  const showChartTimerRef = useRef(null);
  const offlineTimerRef = useRef(null);
  const priceRef = useRef({
    lastPrice: lastPriceNumber,
    markPrice: markPriceNumber,
    indexPrice: indexPriceNumber,
  });
  const postReplaceOrder = usePostReplaceOrder({ tradingViewRef });

  const resetOrderLines = () => {
    tradingViewRef.current.resetOrderLines();
    setReplaceOrderConfirm(null);
  };

  const confirmOrderLines = () => {
    const { params, rpPorts, side } = replaceOrderConfirm;
    postReplaceOrder(params, rpPorts)
      .then(() => {
        // pushEvent(
        //   'click',
        //   'trade_modify',
        //   `trading_pair=${symbol},order_type=${params.type},trade_type=${side}`,
        // );
      })
      .finally(() => {
        setReplaceOrderConfirm(null);
      });
  };

  const handlePriceChangeWatcher = () => {
    setWatchPriceChangeStatus((status) => !status);
  };

  const handleShowChart = () => {
    // console.log("handleShowChart");
    changekShow(false);
    if (showChartTimerRef.current) {
      clearTimeout(showChartTimerRef.current);
    }
    showChartTimerRef.current = setTimeout(() => {
      changekShow(true);
      showChartTimerRef.current = null;
    }, 0);
  };
  // kline
  const generateSymbols = useGenSymbols({
    symbolAlias,
    symbol,
    tickSizeFraction,
    priceStep,
  });
  // 转换为tradingview支持的语言字符串
  const locale = useMemo(() => {
    return TV_LOCALE_VALUE[language];
  }, [language]);

  // 取消活动单
  const sendCancelActivityPositionOrder = useSendCancelActivityPositionOrder({
    t,
    symbol: symbolAlias,
    setCancelOrderParams,
    setIfHideCancelOrderTip,
    setConfirmLoading,
  });

  // 取消条件单
  const sendCancelConditionsPositionOrder =
    useSendCancelConditionsPositionOrder({
      t,
      symbol: symbolAlias,
      setCancelOrderParams,
      setIfHideCancelOrderTip,
      setConfirmLoading,
    });

  // 创建订单
  const sendCreateOrder = useSendCreateOrder({
    symbol: symbolAlias,
    setClosePositionParams,
    setIfHideClosePositionTip,
    setConfirmLoading,
  });

  // 生成活动委托数据
  const generateActiveOrderLines = useGenActiveOrderLines({
    t,
    symbol: symbolAlias,
    language,
    priceRef,
    activityList,
    cancelOrderTipStatus,
    watchPriceChangeStatus,
    setCancelOrderParams,
    sendCancelActivityPositionOrder,
    setReplaceOrderText,
    setReplaceOrderConfirm,
    postReplaceOrder,
  });

  const { ask1, bid1, formattedAsk1, formattedBid1 } = useMemo(() => {
    let formattedAsk = formattedLastPrice;
    let formattedBid = formattedLastPrice;

    if (ask1Price) {
      formattedAsk = toThousands(ask1Price, priceFraction);
    }
    if (bid1Price) {
      formattedBid = toThousands(bid1Price, priceFraction);
    }
    return {
      ask1: ask1Price || lastPriceNumber,
      bid1: bid1Price || lastPriceNumber,
      formattedAsk1: formattedAsk,
      formattedBid1: formattedBid,
    };
  }, [
    ask1Price,
    bid1Price,
    formattedLastPrice,
    lastPriceNumber,
    priceFraction,
  ]);
  const getBars = useGenGetBars({
    lastData,
    curStartTime,
    setShowLocalTimeTips,
  });

  const { getMarks, subscribeBars } = useGenSubscribeBars({
    symbol: symbolAlias,
    curStartTime,
    priceRef,
    lastData,
    subscriber,
    candleDataCb,
    marketDataCb,
    marketTimer,
  });

  const unsubscribeBars = useGenUnsubscribeBars({
    subscriber,
    marketDataCb,
    candleDataCb,
    curStartTime,
    lastData,
  });

  const handlePushEvent = (action, category, label = '') => {
    // pushEvent(action, category, label);
  };
  const klineProps = useMemo(
    () => ({
      // userId: userId || getGuestId(),
      symbols: generateSymbols,
      symbol: symbolAlias,
      getBars,
      getMarks,
      subscribeBars,
      unsubscribeBars,
      activeOrderLines: generateActiveOrderLines,

      loggedIn,
      locale,
      needSaveChart: true,
      saveKey: FORWARD_TV_LOCAL_KEY,
      libraryPath:
        '/static/tradingview/charting_library-master/charting_library/',
      cRef: tradingViewRef,
      ifGenerateQuickOperationBtn: true,
      theme: currentTheme,
      chartPropertiesKey: TV_CHART_PROPERTIES,
      handlePushEvent,
      showLeftToolbar: true,
      leftToolbarLocalKey: DRAWING_TOOLS_KEY,
    }),
    [
      symbolAlias,
      activityList,
      lastPriceNumber,
      loggedIn,
      currentTheme,
      language,
      currentResolution,
      // userId,
    ],
  );

  const quickOrderProps = useGenQuickOrderProps({
    t,
    symbol: symbolAlias,
    coin,
    bid1,
    ask1,
    formattedAsk1,
    formattedBid1,
    lastPriceNumber,
    maxQty,
    lotFraction,
    lotSize,
  });
  // 定时监听价格变化
  useEffect(() => {
    handlePriceChangeWatcher();
    watchPriceChangeTimer = setInterval(() => {
      handlePriceChangeWatcher();
    }, oneMinute);
    return () => {
      clearInterval(watchPriceChangeTimer);
      if (showChartTimerRef.current) {
        clearTimeout(showChartTimerRef.current);
        showChartTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    priceRef.current = {
      lastPrice: lastPriceNumber,
      markPrice: markPriceNumber,
      indexPrice: indexPriceNumber,
    };
  }, [lastPriceNumber, markPriceNumber, indexPriceNumber]);

  useEffect(() => {
    handleShowChart();
  }, [language]);

  // websocket断连后处理
  useEffect(() => {
    if (offline && !offlineTime.current) {
      offlineTime.current = new Date().getTime();
    } else if (
      offlineTime.current &&
      new Date().getTime() - offlineTime.current > 5000
    ) {
      offlineTime.current = null;
      // changekShow(false); // 白屏的问题所在
      // if (offlineTimerRef.current) {
      //   clearTimeout(offlineTimerRef.current);
      // }
      changekShow(true);
      // offlineTimerRef.current = null;
      // offlineTimerRef.current = setTimeout(() => {
      //   console.log(offline, offlineTime, changekShow, offlineTimerRef, 33333);
      //   changekShow(true);
      //   offlineTimerRef.current = null;
      // }, 0);
    }
    // return () => {
    //   if (offlineTimerRef.current) {
    //     clearTimeout(offlineTimerRef.current);
    //     offlineTimerRef.current = null;
    //   }
    // };
  }, [offline]);
  return (
    <>
      <If condition={kShow}>
        <ByTradingview {...klineProps} quickOrderProps={quickOrderProps} />
        {/* 平仓的提示框 */}
        <ConfirmClose
          closePositionParams={closePositionParams}
          setClosePositionParams={setClosePositionParams}
          ifHideClosePositionTip={ifHideClosePositionTip}
          setIfHideClosePositionTip={setIfHideClosePositionTip}
          confirmLoading={confirmLoading}
          setConfirmLoading={setConfirmLoading}
          sendCreateOrder={sendCreateOrder}
        />

        {/* 取消委托的提示框 */}
        <ConfirmCancel
          cancelOrderParams={cancelOrderParams}
          ifHideCancelOrderTip={ifHideCancelOrderTip}
          setIfHideCancelOrderTip={setIfHideCancelOrderTip}
          confirmLoading={confirmLoading}
          setConfirmLoading={setConfirmLoading}
          setCancelOrderParams={setCancelOrderParams}
          sendCancelActivityPositionOrder={sendCancelActivityPositionOrder}
          sendCancelConditionsPositionOrder={sendCancelConditionsPositionOrder}
        />

        <Modal
          width={KLINE_DIALOG_WIDTH_PRIZE}
          head={t('orHintTit')}
          open={!!replaceOrderConfirm}
          confirmText={t('confirm')}
          cancelText={t('cancel')}
          onClose={resetOrderLines}
          onConfirm={confirmOrderLines}
          onCancel={resetOrderLines}
        >
          {replaceOrderText}
        </Modal>

        <LocalTimeTips
          showTips={showLocalTimeTips}
          setShowTips={setShowLocalTimeTips}
        />
      </If>
    </>
  );
};

export default Kline;
