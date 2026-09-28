import http from 'common/utils/http';
import { isMark, klineResultCompatible } from 'common/utils/symbol';
import { api2Host } from 'common/utils/routerSwitchEvent';
import { baseConfig, intervalMap } from 'common/constants/kline';

// const klineUlr = () => `${api2Host}/gateway/public/kline/linear-kline-ls`;
// const markLineUrl = () => `${api2Host}/gw-trade/public/market/mark-price-candles`;

const klineUlr = () => `${api2Host}/spot/public/v1/quote/klines`;
const klineMarkUlr = () => `${api2Host}/trade/private/v2/market/kline-list`;
const markLineUrl = () => `${api2Host}/trade/private/v1/market/mark-price-list`;

export const getKline = async ({ symbol, resolution, from, to }) => {
  if (from >= to) return { list: [], serviceTime: 0 };
  const interval = intervalMap[resolution] || resolution;
  const url = `${klineUlr()}?symbol=${
    baseConfig.exchangeId
  }.${symbol}&interval=${interval}&from=${from * 1000}&to=${to * 1000}`;
  const reProps = { sc: 20421, ec: 20422 };
  if (isMark(symbol)) {
    return { list: [], serviceTime: 0 };
  }
  const resp = await http.get(url, {
    event: reProps,
    meta: {
      showOrigin: true,
    },
  });
  const list = resp.data || [];
  const newList = list.map((item) => ({
    startAt: Math.floor(item.t / 1000),
    open: parseFloat(item.o),
    high: parseFloat(item.h),
    low: parseFloat(item.l),
    close: parseFloat(item.c),
    volume: parseFloat(item.v),
    symbol: item.s,
  }));
  if (newList.length >= 3000) {
    const nextTo = newList?.[0]?.startAt;
    return {
      list: [
        ...(await getKline({ symbol, resolution, from, to: nextTo })).list,
        ...newList,
      ],
      serviceTime: resp.time,
    };
  }
  return { list: newList, serviceTime: resp.time };
};
export const getKlineMarks = async ({ symbol, resolution, from, to }) => {
  const url = `${klineMarkUlr()}?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`;
  const reProps = { sc: 20421, ec: 20422 };
  if (isMark(symbol)) {
    // const apiSymbol = symbol.replace('.M', '');
    // // contract_type=2表示linear
    // url = `${markLineUrl()}?contract_type=2&symbol=${apiSymbol}&resolution=${resolution}&from=${from}&to=${to}`;
    // reProps = { sc: 20423, ec: 20424 };
    return { list: [], serviceTime: 0 };
  }
  const resp = await http.get(url, {
    event: reProps,
    meta: {
      showOrigin: true,
    },
  });
  const { list = [] } = resp.data;
  // const newList = klineResultCompatible(list, symbol);
  const newList = list; // 不需要走兼容
  if (newList.length >= 3000) {
    const nextTo = newList?.[0]?.startAt;
    return {
      list: [
        ...(await getKline({ symbol, resolution, from, to: nextTo })).list,
        ...newList,
      ],
      serviceTime: resp.time,
    };
  }
  return { list: newList, serviceTime: resp.time };
};

export default getKline;
