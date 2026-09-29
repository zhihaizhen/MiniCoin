import { TRADE_TYPE } from '../packages-biz/by-global-settings';

export const getTradeType = (symbol, futures) => {
  let tradeType = TRADE_TYPE.UNKNOWN;
  switch (true) {
    case /\d+$/.test(symbol) || futures:
      tradeType = TRADE_TYPE.FUTURE;
      break;
    case /.USDT$/.test(symbol):
      tradeType = TRADE_TYPE.LINEAR;
      break;
    case /.USD$/.test(symbol):
      tradeType = TRADE_TYPE.INVERSE;
      break;
    default:
      break;
  }
  return tradeType;
};

export const isLinear = (symbol) => getTradeType(symbol) === TRADE_TYPE.LINEAR;

export const goSymbolUrl = ({
  symbol,
  quarter,
  contractType,
  coin,
  baseCoin
}) => {
  // let url = `/trade/inverse/${symbol}`;
  // if (contractType === TRADE_TYPE.LINEAR) {
  //   url = `/trade/usdt/${symbol}`;
  //   // } else if (FUTURE_ROUTE[quarter]) {
  //   //   url = `/trade/inverse/futures/${coin}${baseCoin}_${FUTURE_ROUTE[quarter]}`;
  // }
  // if (typeof window !== 'undefined') window.location.href = url;
};

export const goSymbol = (symbolConfig) => {
  const reg = /\/trade\/inverse(\/futures)*\/(\w*)|\/trade\/usdt\/(\w*)/g;
  const match = reg.exec(window && window.location.pathname) || [];
  // 0: "/trade/futures/BTCUSD_Q" | "/trade/inverse/BTCUSD"   |  "/trade/usdt/BTCUSDT"
  // 1: "/futures"                | undefined                 |  undefined
  // 2: "BTCUSD_Q"                | "BTCUSD"                  |  undefined
  // 3:                           |                           |  "BTCUSDT"
  const [, futures, symbolInPath = '', linearSymbol] = match;
  // const curSymbol = symbolInPath || linearSymbol;
  const curSymbol = symbolInPath || linearSymbol;
  return new Promise((resolve, reject) => {
    if (curSymbol === symbolConfig.symbol) return;
    switch (
      getTradeType(curSymbol, !!futures) // 当前symbol
    ) {
      case TRADE_TYPE.INVERSE:
        if (symbolConfig.contractType === TRADE_TYPE.INVERSE) {
          resolve(symbolConfig);
        } else {
          reject();
          // goSymbolUrl(symbolConfig);
        }
        break;
      case TRADE_TYPE.LINEAR:
        if (symbolConfig.contractType === TRADE_TYPE.LINEAR) {
          resolve(symbolConfig);
        } else {
          reject();
          // goSymbolUrl(symbolConfig);
        }
        break;
      // case TRADE_TYPE.FUTURE:
      //   if (symbolConfig.contractType === TRADE_TYPE.FUTURE) {
      //     resolve(symbolConfig);
      //   } else {
      //     reject();
      //     goSymbolUrl(symbolConfig);
      //   }
      //   break;
      default: // 如看盘模式
        reject();
        // goSymbolUrl(symbolConfig);
        break;
    }
  });
};

// 判断是否Kline标记价格
export const isMark = (symbol) => symbol.indexOf('.') === 0;

// mark转换成旧格式
export const klineResultCompatible = (list, symbol) => {
  if (!isMark(symbol)) {
    return list;
  }
  const newList = [];
  list.forEach((item) => {
    let newItem = {};
    newItem = {
      startAt: item[0] / 1000, // 统一使用s，market原先就是s
      open: Number(item[1]), // 新接口返回的是string，需要转换成number
      close: Number(item[2]),
      high: Number(item[3]),
      low: Number(item[4])
    };
    newList.push(newItem);
  });
  return newList;
};
