import { useState } from 'react';
import { getSpotQuote, getSpotDynamicSymbol } from '../../api';

const useSpotQuoteToken = () => {
  // const [quoteTokenConfig, setQuoteTokenConfig] = useState([]); // 行情
  const [spotDySymbolConfig, setSpotDynamicSymbolConfig] = useState([]); // 接口原始返回的
  const [uniqueAllTokens, setUniqueAllTokens] = useState([]); // 数据整合之后的


  // const getSpotQuoteToken = async () => {
  //   const res = await getSpotQuote();
  //   setQuoteTokenConfig(res);
  // };

  const getSpotDySymbolConfig = async () => {
    const res = await getSpotDynamicSymbol();
    formatData(res);
    setSpotDynamicSymbolConfig(res);
  };

  const formatData = (quoteToken) => {
    const data = quoteToken || [];
    let allTokens = [];
    const _uniqueAllTokens = [];
    const tokensObj = {};
    Array.isArray(data) && data.forEach((item, index) => {
      const belongSymbols = item.quoteTokenSymbols.map((it) => {
        it.tokenId = item.tokenId;
        return it;
      });
      allTokens = allTokens.concat(belongSymbols);
    });
    allTokens.forEach((item) => {
      if (!tokensObj[item.symbolId]) {
        tokensObj[item.symbolId] = true;
        _uniqueAllTokens.push(item);
      }
    });
    setUniqueAllTokens(_uniqueAllTokens);
    return _uniqueAllTokens;
  };

  return {
    // quoteTokenConfig,
    // getSpotQuoteToken,
    spotDySymbolConfig,
    getSpotDySymbolConfig,
    uniqueAllTokens
  };
};

export default useSpotQuoteToken;
