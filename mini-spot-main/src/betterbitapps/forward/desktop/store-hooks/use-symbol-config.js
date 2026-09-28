import { useGlobalState } from '@/store';
import { consoleLog } from 'common/utils/consoleLog';

export const useCurSymbolConfig = () => {
  const [globalState] = useGlobalState();
  const { symbol, allSpotTokenConfig, walletCoin } = globalState;
  const curSymbolConfig = allSpotTokenConfig?.[walletCoin]?.[symbol] || {};
  return curSymbolConfig;
};

export const useConfigBySymbol = (symbol) => {
  const [globalState] = useGlobalState();
  const { allSpotTokenConfig, walletCoin } = globalState;
  return allSpotTokenConfig?.[walletCoin]?.[symbol] || {};
};
