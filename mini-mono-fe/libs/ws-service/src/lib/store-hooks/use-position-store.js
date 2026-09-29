import { getRealTimePosition } from './utils';
import { useGlobalState } from '../store';
import {
  ORDER_ACTION,
  POSITION_MODE,
  TP_SL_MODE
} from '../common/packages-biz/by-global-settings/usdt-settings';

const EMPTY_OBJECT = {};

const usePositionStore = () => {
  const [state] = useGlobalState();
  const { poz, longPoz, shortPoz, positionList } = getRealTimePosition(state);
  // 双仓时isIsolated, mode两个仓位一样, riskId取各自仓位中的
  const { isIsolated, riskId, mode } = poz ?? {};

  const findPozBySymbol = (symbol, side) =>
    positionList.find((poz) => poz.symbol === symbol && poz.side === side);

  const tpSlMode =
    poz?.tpSlMode === 'UNKNOWN' ? TP_SL_MODE.FULL : poz?.tpSlMode;

  const pozMode = isIsolated ? POSITION_MODE.ISOLATE : POSITION_MODE.CROSS;
  const isTpSlPartialMode = tpSlMode === TP_SL_MODE.PARTIAL;

  // 止盈止损
  const tpslList = state?.position?.tpslList?.data ?? { Buy: [], Sell: [] };

  const buyTpslListBySymbol = (symbol) =>
    tpslList?.Sell?.filter((item) => item.symbol === symbol); // 仓位跟止盈止损的方向相反
  const sellTpslListBySymbol = (symbol) =>
    tpslList?.Buy?.filter((item) => item.symbol === symbol); // 仓位跟止盈止损的方向相反

  const getIsIsolatedBySymbol = (symbol) => {
    const { isIsolated, tpSlMode } =
      findPozBySymbol(symbol, ORDER_ACTION.BUY) ??
      findPozBySymbol(symbol, ORDER_ACTION.SELL) ??
      {};
    const isTpSlPartialMode = tpSlMode === TP_SL_MODE.PARTIAL;
    return {
      tpSlMode,
      isIsolated,
      isTpSlPartialMode
    };
  };

  return {
    poz: poz ?? EMPTY_OBJECT, // reverse
    positionList,
    riskId,
    mode,
    buyTpslListBySymbol, // reverse
    sellTpslListBySymbol, // reverse
    isIsolated,
    pozMode,
    longPoz: longPoz ?? EMPTY_OBJECT,
    shortPoz: shortPoz ?? EMPTY_OBJECT,
    tpSlMode,
    isTpSlPartialMode,
    getIsIsolatedBySymbol,
    findPozBySymbol,
    longPozBySymbol: (symbol) => findPozBySymbol(symbol, ORDER_ACTION.BUY),
    shortPozBySymbol: (symbol) => findPozBySymbol(symbol, ORDER_ACTION.SELL)
  };
};

export default usePositionStore;
