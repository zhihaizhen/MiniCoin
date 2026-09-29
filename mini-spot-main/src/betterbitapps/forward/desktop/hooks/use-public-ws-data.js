import { PublicWsTopics, WS_TYPE, baseConfig } from 'common/constants/kline';
import { clearIndexQuoteTopic } from 'common/public-ws/streams/indexQuoteStream.stream';
import {
  subscribePublicStream,
  unsubscribePublicStream,
} from 'common/public-ws/streams/public';
import { formatTopicWithBroker } from 'common/utils/ws-utils';
import { useEffect, useRef } from 'react';
import { types, useGlobalState } from '@/store';

const usePublicWsData = () => {
  const [state, globalDispatch] = useGlobalState();
  const {
    symbol,
    symbolAlias,
    symbolFullName,
    obDepthInfo,
    visibility,
    allSpotTokenConfig,
    walletCoin,
    kineDepthVisible,
  } = state;
  const symbolRef = useRef(null);
  const obDepthRef = useRef(null);
  const kineDepthRef = useRef(null);
  const visibilityRef = useRef(visibility);

  //  修改symbol，需要重新订当前币对，最新成交，orderbook,深度图
  useEffect(() => {
    // console.log('修改symbol-step0,所有topic需要重新订阅');
    if (symbolRef.current !== symbol) {
      clearIndexQuoteTopic();
      symbolRef.current = symbol;
    }

    const obj_singleSymbolQuote = {
      topic: WS_TYPE.SINGLE_SYMBOL_QUOTE,
      symbol: `${baseConfig.exchangeId}.${symbolAlias}`,
    };

    const obj_recentlyTrade = {
      topic: WS_TYPE.RECENTLY_TRADE,
      symbol: `${baseConfig.exchangeId}.${symbolAlias}`,
    };

    const obj_orderBook = {
      topic: WS_TYPE.ORDER_BOOK,
      symbol: `${baseConfig.exchangeId}.${symbolAlias}`,
      obDepthInfo,
    };

    subscribePublicStream(obj_singleSymbolQuote);
    subscribePublicStream(obj_recentlyTrade);
    subscribePublicStream(obj_orderBook);
    return () => {
      unsubscribePublicStream(obj_singleSymbolQuote);
      unsubscribePublicStream(obj_recentlyTrade);
      unsubscribePublicStream(obj_orderBook);
      // 切symbol后清理行情instrument的数据.
      globalDispatch({
        type: types.CLEAN_INSTRUMENT_BY_SYMBOL,
        symbol: symbolAlias,
      });
    };
  }, [symbolFullName]);

  // 修改步长和symbol,  需要重新订阅orderbook
  useEffect(() => {
    if (obDepthRef.current !== obDepthInfo) {
      obDepthRef.current = obDepthInfo;
    }

    const obj = {
      topic: WS_TYPE.ORDER_BOOK,
      symbol: `${baseConfig.exchangeId}.${symbolAlias}`,
      obDepthInfo,
    };
    subscribePublicStream(obj);
    return () => {
      unsubscribePublicStream(obj);
    };
  }, [obDepthInfo, symbolFullName]);

  // 订阅深度图
  useEffect(() => {
    const obj = {
      topic: WS_TYPE.DEPTH,
      symbol: `${baseConfig.exchangeId}.${symbolAlias}`,
    };
    // TODO
    subscribePublicStream(obj);

    // if (kineDepthVisible) {
    //   subscribePublicStream(obj);
    // } else {
    //   unsubscribePublicStream(obj);
    // }
    return () => {
      unsubscribePublicStream(obj);
    };
  }, [symbolFullName, kineDepthVisible]);

  // 订阅所有币对行情
  useEffect(() => {
    // subscribePublicStream({
    //   topic: WS_TYPE.ALL_SYMBOL_QUOTE,
    // });
    subscribePublicStream({
      topic: WS_TYPE.ALL_SYMBOL_QUOTE_NEW,
    });
    return () => {
      // unsubscribePublicStream({
      //   topic: WS_TYPE.ALL_SYMBOL_QUOTE,
      // });
      unsubscribePublicStream({
        topic: WS_TYPE.ALL_SYMBOL_QUOTE_NEW,
      });
    };
  }, []);

  useEffect(() => {
    if (visibilityRef.current !== visibility) {
      const orderBookSymbol = `${baseConfig.exchangeId}.${symbolAlias}`;
      if (visibility) {
        // 取消单个币对行情订阅
        unsubscribePublicStream({
          topic: WS_TYPE.SINGLE_SYMBOL_QUOTE,
          symbol: symbolAlias,
        });

        // 订阅orderbook 和最新成交
        subscribePublicStream({
          topic: WS_TYPE.ORDER_BOOK,
          symbol: orderBookSymbol,
          obDepthInfo,
        });
        subscribePublicStream({
          topic: WS_TYPE.RECENTLY_TRADE,
          symbol: formatTopicWithBroker(symbol),
        });
      } else {
        // 取消订阅orderbook 和最新成交， 订阅instrument行情即可
        unsubscribePublicStream({
          topic: WS_TYPE.ORDER_BOOK,
          symbol: orderBookSymbol,
        });
        unsubscribePublicStream({
          topic: WS_TYPE.RECENTLY_TRADE,
          symbol: formatTopicWithBroker(symbol),
        });

        subscribePublicStream({
          topic: WS_TYPE.SINGLE_SYMBOL_QUOTE,
          symbol: symbolAlias,
        });
      }
    }
    visibilityRef.current = visibility;
  }, [visibility]);
};

export default usePublicWsData;
