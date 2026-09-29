import { useCallback, useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import { sessionStorage } from 'by-storage';
import { klineStartTime } from 'common/packages-biz/trade-chart/Datafeed';
import { SESSION_SHOW_LOCALTIM_TIPS } from 'common/packages-biz/global-settings/localStorageSettings';
import { instrumentStream } from 'common/public-ws/streams/indexQuoteStream.stream';
import {
  markCandleStream,
  marketCandleStream,
} from 'common/public-ws/streams/kline.stream';
import {
  subscribePublicStream,
  unsubscribePublicStream,
} from 'common/public-ws/streams/public';
import { parseUrl } from '@region-lib/env';
import { formatTopicWithBroker } from 'common/utils/ws-utils';
import { types, useGlobalState } from '@/store';
import { getKline, getKlineMarks } from '@/services/kine.service';
import useUserStore from '@/store-hooks/use-user-store';
// import { RESOLUTION_MAP } from '../constant';
import { ADJUST_TIME_WITH_RESOLUTION } from 'common/packages-biz/trade-chart/constants';
import { intervalMap, baseConfig, MarketTypes } from 'common/constants/kline';

const { env } = parseUrl(); // env取值: test、testnet、prod
const isProd = env !== 'test';
const HAS_SHOW_TIPS = '1';
// let currentInterval = localStorage.getItem('resolution');

export function useGenGetBars({
  lastData,
  curStartTime,
  setShowLocalTimeTips,
}) {
  const [globalState, globalDispatch] = useGlobalState();
  const [curSymbolInfo, setcurSymbolInfo] = useState(null);
  const { loggedIn } = useUserStore();
  const isLastReq = useRef(false);
  const previousResolution = useRef(null);
  const symbolRef = useRef(null);
  const strategyGetKline = (options) => {
    const {
      symbolInfo,
      resolution,
      from,
      to,
      onHistoryCallback,
      onErrorCallback,
      firstDataRequest,
      symbol,
    } = options;
    // if (!loggedIn && !firstDataRequest) {
    //   onHistoryCallback([], { noData: true });
    //   return;
    // }
    const { ticker } = symbolInfo;
    previousResolution.current = resolution;
    symbolRef.current = symbol;
    const formatResolution = intervalMap[resolution] || resolution;
    const tickerSubId = `${ticker}_#_${formatResolution}`;
    // console.log('k线-step3-真正请求接口from,to',from,dayjs(from*1000).format('YYYY-MM-DD HH:mm:ss'),to,dayjs(to*1000).format('YYYY-MM-DD HH:mm:ss') )
    if (symbolInfo) {
      getKline({
        symbol,
        resolution,
        from,
        to,
      })
        .then((res) => {
          let { list } = res;
          if (list && list.length > 0) {
            list.forEach((item) => {
              item.time = item.startAt * 1000;
            });
            isLastReq.current = false;
          } else {
            list = [];
            isLastReq.current = true;
          }
          list = list.filter((item) => {
            return item.time > klineStartTime;
          });
          onHistoryCallback(list, {
            noData: !list.length,
            // noData: !loggedIn ? true : !list.length,
          });
          const lastItem = list.length > 0 ? list[list.length - 1] : null;
          if (firstDataRequest && lastItem) {
            const curResolution =
              intervalMap[localStorage.getItem('resolution')] ||
              localStorage.getItem('resolution');
            const curTickerSubId = `${ticker}_#_${curResolution}`;
            if (curTickerSubId === tickerSubId) {
              lastData.current[curTickerSubId] = lastItem;
              curStartTime.current[curTickerSubId] = lastItem.startAt;
            }
          }

          // res.serviceTime在接口层处理，取外层的time，在当地时间和服务器时间差距
          // 超过1分钟给弹窗
          if (res.serviceTime) {
            if (Math.abs(Date.now() / 1000 - res.serviceTime / 1000) > 60) {
              if (
                // SESSION_SHOW_LOCALTIM_TIPS为1表示已经手动关掉过弹窗
                sessionStorage.get(SESSION_SHOW_LOCALTIM_TIPS) !== HAS_SHOW_TIPS
              ) {
                setShowLocalTimeTips(true);
              }
            } else {
              setShowLocalTimeTips(false);
            }
          }
          if (window.fetchSymbolStart && ticker.indexOf('.') < 0) {
            window.fetchSymbolStart = undefined;
          }
        })
        .catch((e) => {
          globalDispatch({
            type: types.NETWORK_SHIFT,
            show: true,
            e,
          });
          onErrorCallback(e.message || e.data?.message || 'some error');
          // 防止后端数据异常时无限刷接口，影响后端服务
          if (!firstDataRequest) {
            onHistoryCallback([], {
              noData: true,
            });
          }
        });
    }
  };
  const throttledGetKline = throttle(
    (options) => {
      strategyGetKline(options);
    },
    50,
    { leading: false, trailing: true },
  );

  return useCallback(
    (
      symbolInfo,
      resolution,
      from,
      to,
      onHistoryCallback,
      onErrorCallback,
      firstDataRequest,
    ) => {
      const { ticker, symbol } = symbolInfo;
      if (from > to) return;
      const isSymbolNotChanged = symbolRef.current === symbol;
      const isResolutionNotChanged =
        previousResolution.current && resolution === previousResolution.current;
      // console.log('k线-step0 调用getBars',previousResolution.current,resolution,isLastReq.current, isResolutionNotChanged,isSymbolNotChanged);
      if (isLastReq.current && isResolutionNotChanged && isSymbolNotChanged) {
        onHistoryCallback([], { noData: true });
        return;
      }

      const formatResolution = intervalMap[resolution] || resolution;
      const tickerSubId = `${ticker}_#_${formatResolution}`;
      const formatFrom = Math.floor(from / 60) * 60; // 向下取整到分钟
      const formatTo = Math.floor(to / 60) * 60;
      setcurSymbolInfo({
        symbolInfo,
        resolution,
        from: formatFrom,
        to: formatTo,
        onHistoryCallback,
        onErrorCallback,
        firstDataRequest,
      });
      if (firstDataRequest) {
        strategyGetKline({
          symbolInfo,
          resolution,
          from: formatFrom,
          to: formatTo,
          onHistoryCallback,
          onErrorCallback,
          firstDataRequest,
          symbol: ticker,
        });
      } else {
        throttledGetKline({
          symbolInfo,
          resolution,
          from: formatFrom,
          to: formatTo,
          onHistoryCallback,
          onErrorCallback,
          firstDataRequest,
          symbol: ticker,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchSymbolStart, loggedIn],
  );
}

export function useGenSubscribeBars({
  symbol,
  curStartTime,
  priceRef,
  lastData,
  subscriber,
  candleDataCb,
  marketDataCb,
  marketTimer,
}) {
  const { loggedIn } = useUserStore();
  const [globalState, globalDispatch] = useGlobalState();
  const [realtimeData, setRealtimeData] = useState({});
  const [curMarksInfo, setcurMarks] = useState({
    marks: [],
    onDataCallback: () => {},
    drawMarks: () => {},
    clearMarks: () => {},
  });
  const curSymbolRef = useRef(symbol);
  const drawTimer = useRef(null);
  const throttled = throttle((data) => {
    const resolution = localStorage.getItem('resolution');
    const minutesInterval = intervalMap[resolution] || resolution;
    const secondInterval = Math.round(minutesInterval * 60);
    let currentBarStartTime = data.start;
    if (window.curShape) {
      const shapeArr = Object.entries(window.curShape);
      const shapeArrLen = shapeArr.length;
      const lastOneTime = shapeArr[shapeArrLen - 1][0];
      currentBarStartTime =
        data.start - ((data.start - lastOneTime) % secondInterval);
    }
    globalDispatch({
      type: types.SET_Current_StartAt,
      data: currentBarStartTime,
    });
  }, 200);
  const {
    allSpotTokenConfig,
    walletCoin,
    symbolAlias: curSymbol,
  } = globalState;
  const allSymbolConfig = allSpotTokenConfig?.[walletCoin] || {};
  const { symbolDepths } = allSymbolConfig?.[symbol] || [];
  const depthParam = symbolDepths?.[0]?.value;
  const updateDraw = (curItem) => {
    // 有当前时间的箭头 且 有当前时间的k线数据
    if (drawTimer.current) return;
    drawTimer.current = setTimeout(() => {
      drawTimer.current = null;
    }, 500);
    if (curItem?.shapeBuyId) curMarksInfo.clearMarks(curItem?.shapeBuyId);
    if (curItem?.shapeSellId) curMarksInfo.clearMarks(curItem?.shapeSellId);
    const params = {
      ...curItem,
      ...realtimeData,
      startAt: globalState.currentStartAt,
      high: Math.max(curItem?.high || -Infinity, realtimeData?.high),
      low: Math.min(curItem?.low || Infinity, realtimeData?.low),
    };
    curMarksInfo.drawMarks(params, depthParam);
  };

  useEffect(() => {
    if (window?.curShape && realtimeData) {
      const curItem = window?.curShape[globalState.currentStartAt];
      if (curItem) {
        updateDraw(curItem);
      }
    }
  }, [
    // realtimeData.high,
    // realtimeData.low,
    realtimeData,
    globalState.currentStartAt,
    globalState.currentResolution,
  ]);

  const getCurMarks = async (_curSymbolInfo) => {
    const { symbolInfo, resolution, from, to, onDataCallback } =
      _curSymbolInfo || {};

    if (!loggedIn) {
      return null;
    }
    const { ticker } = symbolInfo;
    const calcFrom = from - ADJUST_TIME_WITH_RESOLUTION[resolution]; // 适配自动切换时间选取中的时间差
    const res = await getKlineMarks({
      symbol: ticker,
      resolution: intervalMap[resolution] || resolution,
      from: calcFrom,
      to,
    });
    let { list } = res;
    if (list && list.length > 0) {
      list.forEach((item) => {
        item.time = item.startAt * 1000;
      });
    } else {
      list = [];
    }
    list = list.filter((item) => {
      return item.time > klineStartTime;
    });
    return list;
  };

  let timer = null;

  const getMarks = useCallback(
    async (
      symbolInfo,
      from,
      to,
      onDataCallback,
      resolution,
      drawMarks,
      clearMarks,
    ) => {
      await clearMarks('ALL');
      if (timer) {
        clearTimeout(timer);
        return;
      }
      if (symbol !== curSymbolRef.current) {
        curSymbolRef.current = symbol;
      }
      if (curSymbol !== symbol) return;
      timer = setTimeout(() => {
        timer = null;
      }, 500);
      let marks = [];
      try {
        marks = await getCurMarks({
          symbolInfo,
          from,
          to,
          onDataCallback,
          resolution,
        });
        marks.forEach((item) => {
          setTimeout(() => {
            drawMarks(item, depthParam);
          }, 500);
        });
      } catch (error) {
        //
      }

      setcurMarks({
        marks,
        onDataCallback,
        drawMarks,
        clearMarks,
      });
    },
    [symbol, loggedIn, globalState.currentResolution],
  );

  const subscribeBars = useCallback(
    (symbolInfo, resolution, onRealtimeCallback, subscriberUID) => {
      if (symbol !== curSymbolRef.current) {
        curSymbolRef.current = symbol;
      }
      if (curSymbol !== symbol) return;
      const { ticker } = symbolInfo;
      const formatResolution = intervalMap[resolution] || resolution;
      // const isMarkPrice = ticker.indexOf('.') === 0;
      const isMarkPrice = false;
      const tickerSubId = `${ticker}_#_${formatResolution}`;
      const streamCallback = (result) => {
        const curResolution =
          intervalMap[localStorage.getItem('resolution')] ||
          localStorage.getItem('resolution');
        const curTickerSubId = `${ticker}_#_${curResolution}`;
        if (!result || !curStartTime.current[curTickerSubId]) return;

        const len = result.length;
        for (let i = 0; i < len; i += 1) {
          let data = result[i];
          if (data.period !== curResolution) return;
          const confirm = data.confirm || len > 1;
          data = {
            ...data,
            close: parseFloat(data.close),
            high: parseFloat(data.high),
            low: parseFloat(data.low),
            open: parseFloat(data.open),
            turnover: parseFloat(data.turnover),
            volume: parseFloat(data.volume),
          };
          const { start, low, high } = data;
          if (
            !curStartTime.current[curTickerSubId] ||
            (curStartTime.current[curTickerSubId] <= start &&
              curTickerSubId === tickerSubId)
          ) {
            const price = isMarkPrice
              ? priceRef.current.markPrice
              : priceRef.current.lastPrice;
            data.time = start * 1000;
            if (!confirm && price) {
              data.close = price;
              data.low = price < low ? price : low;
              data.high = price > high ? price : high;
            }
            lastData.current[curTickerSubId] = { ...data, confirm };
            curStartTime.current[curTickerSubId] = data.start;
            onRealtimeCallback(data);
            setRealtimeData(data);
            // globalDispatch({
            //   type: types.SET_Kline_Marks,
            //   list: [{ ...data, startAt: data.start }],
            //   option: 'update',
            // });
            // 新增marks,每2s更新一下最新的价格到marks list里面，然后重新绘制最新的mark
            throttled(data);
          }
        }
      };
      if (!isMarkPrice) {
        const fullSymbol = allSymbolConfig[ticker]?.symbolAlias || ticker;
        const topic = `kline_${baseConfig.exchangeId}${fullSymbol}${intervalMap[resolution]}`;
        subscriber.current[subscriberUID] = {
          topic,
          marketType: MarketTypes.MARKET_CANDLE,
          symbol: fullSymbol,
          resolution,
        };
        subscribePublicStream({
          topic,
          marketType: MarketTypes.MARKET_CANDLE,
          symbol: fullSymbol,
          resolution,
        });
      }
      candleDataCb.current[tickerSubId] = marketCandleStream.subscribe(
        (result) => {
          if (result && result[0]?.symbol !== curSymbolRef.current) return;
          streamCallback(result);
        },
      );

      marketDataCb.current[tickerSubId] = instrumentStream.subscribe(
        (instrument) => {
          if (!lastData.current[tickerSubId]) return;
          if (marketTimer.current[tickerSubId])
            cancelAnimationFrame(marketTimer.current[tickerSubId]);
          marketTimer.current[tickerSubId] = requestAnimationFrame(() => {
            if (!lastData.current[tickerSubId]) return;
            if (instrument) {
              const { close, low, high, confirm } =
                lastData.current[tickerSubId];
              const { lastPrice, markPrice } = instrument;
              const tmpPrice = isMarkPrice
                ? Number(markPrice)
                : Number(lastPrice);
              if (!tmpPrice) return;
              if (!confirm && Math.round(Number(close)) !== tmpPrice) {
                const price = tmpPrice;
                lastData.current[tickerSubId].close = price;
                lastData.current[tickerSubId].low = price < low ? price : low;
                lastData.current[tickerSubId].high =
                  price > high ? price : high;
                onRealtimeCallback(lastData.current[tickerSubId]);
              }
            }
          });
        },
      );
    },
    // symbol变化时需要更新candle和标记价格的订阅 (update依赖后, 会把symbol去掉)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol, globalState.currentResolution],
  );
  return {
    subscribeBars,
    getMarks,
  };
}

export function useGenUnsubscribeBars({
  subscriber,
  marketDataCb,
  candleDataCb,
  curStartTime,
  lastData,
}) {
  return useCallback((subscriberUID) => {
    const { topic, marketType } = subscriber.current[subscriberUID] || {};
    unsubscribePublicStream({ topic, marketType });
    // const symbolKey = subscriberUID.replace(/_\w*/, '');
    // const symbolKey = subscriberUID.split('_')[0];
    if (marketDataCb.current[subscriberUID]) {
      marketDataCb.current[subscriberUID].unsubscribe();
      candleDataCb.current[subscriberUID].unsubscribe();
      curStartTime.current[subscriberUID] = null;
      lastData.current[subscriberUID] = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
