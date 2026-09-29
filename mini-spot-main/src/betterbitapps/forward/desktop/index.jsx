import React, { Suspense, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import '@/services/ws.private';
import { GlobalStateProvider, types } from '@/store';
import {  Model } from 'common/model';
import 'common/assets/css/index.less';
import 'common/utils/i18n';
import {
  APP_STATUS,
  SYMBOLS,
} from 'common/packages-biz/global-settings';
import 'common/public-ws/streams/public';
import { Sentry } from 'common/utils/sentry';
import { handleDownloadUrl } from 'common/utils/url';
import { filterObject, isMobile } from 'common/utils/utils';
import { getSpotSymbolList } from '@/services/symbol.service';
import App from './App';
import LoadingPage from './LoadingPage';
// import * as serviceWorker from './serviceWorker';
import {
  setEasyRouter,
  getSymbolInfoOnUrl,
  getDefaultSymbolConfig,
} from './utils/easy-router';

console.log('-----VersionInfo-----', {
  BRANCH: process.env.MARVEL_APP_BRANCH,
  COMMITHASH: process.env.MARVEL_APP_COMMITHASH,
  VERSION: process.env.MARVEL_APP_VERSION,
});
// storeChannelInfo(process.env.BUILD_ENV);

window.fetchSymbolStart = Date.now();

const SuspenseApp = () => {
  const [appStatus, setAppStatus] = useState({
    status: APP_STATUS.PENDING,
    initState: {},
  });

  useEffect(() => {
    // 手机浏览器打开
    if (isMobile()) {
      handleDownloadUrl()
    }
  });

  // 重要
  const initAllSpotSymbol = async () => {
    const data = await getSpotSymbolList();
    // console.log('allSpotTokenConfig data', data);
    const allSpotTokenConfig = {};
    const allSpotTokenList = {}
    data.forEach((item, i) => {
      const list = item.quoteTokenSymbols;
      const eachTokenSymbolConfig = {};
      const eachTokenList = [];
      list.forEach((info, index) => {
        const itemSymbolInfo = Model.symbol(info); // 进行数据转换
        eachTokenSymbolConfig[info.baseTokenName] = itemSymbolInfo;
        eachTokenList.push(itemSymbolInfo);
      });
      allSpotTokenList[item.tokenName] = eachTokenList;
      allSpotTokenConfig[item.tokenName] = eachTokenSymbolConfig; 
    });
    try {
      const { symbol, symbolConfig } = getSymbolInfoOnUrl(allSpotTokenConfig) || {};
      let config = symbolConfig;   // 有symbol，初始化路由
      if (!symbol) {
        config = getDefaultSymbolConfig(allSpotTokenConfig);  // 不存在该币种，则去默认的路由
      }
      setAppStatus({
        status: APP_STATUS.READY,
        initState: {
          ...config,
          allSpotTokenConfig,
          allSpotTokenList,
        }
      });
      setEasyRouter(config);
      // console.log('initState config', config);
    } catch (err) {
      console.log('initAllSpotSymbol error', err);
      const defaultSymbol = SYMBOLS.BTCUSDT;
      setAppStatus({
        status: APP_STATUS.READY,
        initState: {
          ...defaultSymbol,
          allSpotTokenConfig,
          allSpotTokenList
        },
      });
      setEasyRouter(defaultSymbol);
    }
  };

  useEffect(() => {
    initAllSpotSymbol();
  }, []);

  return (
    <Choose>
      <When condition={appStatus.status === APP_STATUS.READY}>
        <GlobalStateProvider initState={appStatus.initState}>
          <App />
        </GlobalStateProvider>
      </When>
      <Otherwise>{/* <LoadingPage /> */}</Otherwise>
    </Choose>
  );
};
ReactDOM.render(
  <Suspense fallback={<LoadingPage />}>
    <SuspenseApp />
  </Suspense>,
  document.getElementById('root'),
);
