import { PublicWsTopics } from '@region-lib/public-ws';
import { OB_LEVEL_MAP } from '../common/packages-biz/by-global-settings/usdt-settings';
import { clearIndexQuoteTopic } from '../common/public-ws/streams/indexQuoteStream.stream';
// import {
//   subscribePublicStream,
//   unsubscribePublicStream
// } from '../common/public-ws/streams/public';
import { InitWorker } from '../common/public-ws/streams/public';
import { formatTopicWithBroker } from '../common/utils/ws-utils';
import { useEffect, useRef } from 'react';
import { types, useGlobalState } from '../store';

const useMarketDataWs = () => {
  const [state, globalDispatch] = useGlobalState();
  const { symbol, obLevel, visibility } = state;
  const symbolRef = useRef(null);
  const obLevelRef = useRef(null);
  const visibilityRef = useRef(visibility);
  const { subscribePublicStream, unsubscribePublicStream } = InitWorker();
  const ORDERBOOK_TYPE = {
    BOOK_20: 'books-20.',
    BOOK_25: 'books-25.',
    BOOK_80: 'books-80.',
    BOOK_200: 'books-200.',
    RECENTLY_TRADE: 'trades-100.',
    INSTRUMENT_INFO: 'tickers-100.'
  };
  useEffect(() => {
    // globalDispatch({
    //   type: types.SET_SYMBOL_AND_COIN,
    //   symbolConfig
    // })
    return () => {
      // 切symbol后重置行情推送里的ob的level
      globalDispatch({
        type: types.SET_ORDER_BOOK_LEVEL,
        level: OB_LEVEL_MAP.DEFAULT
      });
      // 切symbol后清理行情instrument的数据.
      globalDispatch({
        type: types.CLEAN_INSTRUMENT_BY_SYMBOL,
        symbol
      });
    };
  }, [symbol]);

  useEffect(() => {
    if (symbolRef.current !== symbol) {
      clearIndexQuoteTopic();
      symbolRef.current = symbol;
    }
    // 先将topic 换成orderbook的
    const topic = obLevel === OB_LEVEL_MAP.MAX ? 'books-200.' : 'books-25.';
    const recently_trade_topic = ORDERBOOK_TYPE.RECENTLY_TRADE;
    const instrument_INFO_topic = ORDERBOOK_TYPE.INSTRUMENT_INFO;

    // const topic =
    //   obLevel === OB_LEVEL_MAP.MAX
    //     ? PublicWsTopics.IndexQuote200_H
    //     : PublicWsTopics.IndexQuote20_H;
    if (symbolRef.current) {
      subscribePublicStream({ topic, symbol: formatTopicWithBroker(symbol) });
      subscribePublicStream({
        topic: recently_trade_topic,
        symbol: formatTopicWithBroker(symbol)
      });
      subscribePublicStream({
        topic: instrument_INFO_topic,
        symbol: formatTopicWithBroker(symbol)
      });

      // 底部的 100ms和1000ms的topic切换还在使用.
      obLevelRef.current = obLevel;
    }

    return () => {
      if (symbolRef.current) {
        unsubscribePublicStream({
          topic,
          symbol: formatTopicWithBroker(symbol)
        });
        unsubscribePublicStream({
          topic: recently_trade_topic,
          symbol: formatTopicWithBroker(symbol)
        });
        unsubscribePublicStream({
          topic: instrument_INFO_topic,
          symbol: formatTopicWithBroker(symbol)
        });
      }
    };
  }, [symbol, obLevel]);

  useEffect(() => {
    // console.log('订阅-MarketDataWs-公共行情数据');
    // 全symbol 推送
    subscribePublicStream({
      topic: PublicWsTopics.InstrumentInfoAll
      // symbol: formatTopicWithBroker(symbol),
    });

    return () => {
      // console.log('取消订阅-MarketDataWs-公共行情数据');
      unsubscribePublicStream({
        topic: PublicWsTopics.InstrumentInfoAll
        // symbol: formatTopicWithBroker(symbol),
      });
    };
  }, []);

  useEffect(() => {
    if (visibilityRef.current !== visibility) {
      const topic =
        obLevel === OB_LEVEL_MAP.MAX
          ? ORDERBOOK_TYPE.BOOK_200
          : ORDERBOOK_TYPE.BOOK_25;
      const recently_trade_topic = ORDERBOOK_TYPE.RECENTLY_TRADE;
      // const topic =
      //   obLevelRef.current === OB_LEVEL_MAP.MAX
      //     ? PublicWsTopics.IndexQuote200_H
      //     : PublicWsTopics.IndexQuote20_H;
      if (visibility) {
        // 订阅indexQuote，取消单独intsrument订阅
        unsubscribePublicStream({
          symbol: formatTopicWithBroker(symbol),
          topic: PublicWsTopics.InstrumentInfo_M
        });

        subscribePublicStream({ topic, symbol: formatTopicWithBroker(symbol) });
        subscribePublicStream({
          topic: recently_trade_topic,
          symbol: formatTopicWithBroker(symbol)
        });
      } else {
        // 订阅instrument行情即可
        unsubscribePublicStream({
          topic,
          symbol: formatTopicWithBroker(symbolRef.current)
        });
        unsubscribePublicStream({
          topic: recently_trade_topic,
          symbol: formatTopicWithBroker(symbolRef.current)
        });

        subscribePublicStream({
          symbol: formatTopicWithBroker(symbol),
          topic: PublicWsTopics.InstrumentInfo_M
        });
      }
    }
    visibilityRef.current = visibility;
  }, [visibility]);
};

export default useMarketDataWs;
