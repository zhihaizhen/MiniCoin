import { useGlobalSymbolConfig } from '../common/hooks/use-global-symbol-config';
import { useGlobalState } from '../store';

export const useSymbolConfig = () => {
  const [globalState] = useGlobalState();
  const { symbol } = globalState;
  const globalSymbolConfig = useGlobalSymbolConfig(symbol);
  return {
    ...globalSymbolConfig,
    curSymbolConfig: globalSymbolConfig.symbolConfig
  };
};

export const useSymbolInfo = (symbol) => {
  const allSymbolConfig = useGlobalSymbolConfig();
  return allSymbolConfig[symbol];
};
