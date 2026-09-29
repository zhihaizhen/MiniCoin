import { useState } from 'react';
import { getDynamicSymbol } from '../../api';

const useSymbolConfigList = () => {
  const [symbolConfig, setSymbolConfig] = useState([]);

  const getSymbolConfigList = async () => {
    const res = await getDynamicSymbol();
    const newLinearPerpetual = [...res?.LinearPerpetual, ...res?.StockRwaPerpetual, ...res?.MetalRwaPerpetual];

    // 根据 symbolName 去重
    const deduplicateBySymbolName = (symbols: any[]) => {
      const symbolMap = new Map();
      symbols.forEach((symbol) => {
        if (symbol?.symbolName && !symbolMap.has(symbol.symbolName)) {
          symbolMap.set(symbol.symbolName, symbol);
        }
      });
      return Array.from(symbolMap.values());
    };

    const deduplicatedLinearPerpetual = deduplicateBySymbolName(newLinearPerpetual);
    const data = [...deduplicatedLinearPerpetual, ...res?.InversePerpetual, ...res?.BlockTradePerpetual];
    setSymbolConfig(data);
  };

  return {
    symbolConfig,
    getSymbolConfigList
  };
};

export default useSymbolConfigList;
