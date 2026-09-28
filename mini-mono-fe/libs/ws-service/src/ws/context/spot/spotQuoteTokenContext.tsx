import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

import { initSpotTickersWs } from 'libs/ws-service';
import useSpotQuoteToken from '../../hooks/useSpotQuoteToken';

interface IContext {
  // quoteTokenConfig: any[];
  uniqueAllTokens: any[];
  spotDySymbolConfig: any[];
}
// 创造context
const QuoteTokenContext = createContext<IContext>({
  // quoteTokenConfig: [],
  uniqueAllTokens: [],
  spotDySymbolConfig: []
});

// useTickersWs: 使用新的tickers单topic直连方式（不经过by-ws/webworker），默认走旧的slowBroker/by-ws方式
const SpotQuoteTokenProvider = ({ children, useTickersWs = false }) => {
  const {
    // quoteTokenConfig,
    // getSpotQuoteToken,
    getSpotDySymbolConfig,
    spotDySymbolConfig,
    uniqueAllTokens
  } = useSpotQuoteToken();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await getSpotDySymbolConfig();
    // await getSpotQuoteToken();
    initSpotTickersWs();
  };

  return (
    <QuoteTokenContext.Provider
      value={{
        // quoteTokenConfig,
        uniqueAllTokens,
        spotDySymbolConfig
      }}
    >
      {children}
    </QuoteTokenContext.Provider>
  );
};

// 创建hook
const useSpotQuoteTokenConfig = () => {
  return useContext(QuoteTokenContext);
};

export { QuoteTokenContext, SpotQuoteTokenProvider, useSpotQuoteTokenConfig };
