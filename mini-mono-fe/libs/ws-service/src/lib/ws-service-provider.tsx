import React, { useEffect, useState } from 'react';
import './services/ws.private';
import { GlobalStateProvider } from './store';

// import { collector, storeChannelInfo } from '@region-lib/data-pool';
import SymbolConfig from '@region-lib/symbol-fetch';
// import { addGtmListener } from '@region/by-gtm';
// import './common/assets/css/index.css';
// import PopupDownload from './common/components/PopupDownload/index';
// import './common/components/LinearPositions/utils/i18n';
import {
  APP_STATUS,
  SYMBOLS,
  TRADE_TYPE
} from './common/packages-biz/by-global-settings';
// import { InitWorker } from './common/public-ws/streams/public';
// import './utils/i18n';
import {
  getSymbol,
  setDefaultRouter,
  setEasyRouter
} from './utils/easy-router';
import InitWs from './InitWs';

const symbolConfig =
  typeof window !== 'undefined' ? SymbolConfig.getInstance() : {};
if (typeof window !== 'undefined') {
  window.fetchSymbolStart = Date.now();
}

/* eslint-disable-next-line */
export interface WsServiceProps {
  children: any;
}

export function WsServiceProvider(props: WsServiceProps) {
  const [appStatus, setAppStatus] = useState({
    status: APP_STATUS.PENDING,
    initState: {}
  });
  // InitWorker();
  // 获取所有symbol，包里面调用了/market/dynamic_symbol接口
  useEffect(() => {
    symbolConfig
      .fetchSymbolList()
      .then((result) => {
        const { allSymbolConfig, allSymbolList } = result;
        // setDefaultRouter(allSymbolConfig);
        const symbol = getSymbol(allSymbolConfig);
        const { symbolName, coin, baseCoin } = allSymbolConfig[symbol];
        setAppStatus({
          status: APP_STATUS.READY,
          initState: {
            symbol,
            symbolName,
            similarSymbol: symbol,
            coin,
            baseCoin,
            symbols: { totalSymbolList: allSymbolList }
          }
        });
      })
      .catch(() => {
        setAppStatus({
          status: APP_STATUS.READY,
          initState: {
            symbol: SYMBOLS.BTCUSDT.symbol,
            symbolName: SYMBOLS.BTCUSDT.symbolName,
            similarSymbol: SYMBOLS.BTCUSDT.symbol,
            coin: SYMBOLS.BTCUSDT.coin,
            baseCoin: SYMBOLS.BTCUSDT.baseCoin,
            symbols: {
              totalSymbolList: {
                [TRADE_TYPE.INVERSE]: [],
                [TRADE_TYPE.LINEAR]: [SYMBOLS.BTCUSDT, SYMBOLS.ETHUSDT]
              }
            }
          }
        });
        // setEasyRouter(SYMBOLS.BTCUSDT);
      });
  }, []);

  return (
    <GlobalStateProvider initState={appStatus.initState}>
      <InitWs appStatus={appStatus}>{props.children}</InitWs>
    </GlobalStateProvider>
  );
}

export default WsServiceProvider;
