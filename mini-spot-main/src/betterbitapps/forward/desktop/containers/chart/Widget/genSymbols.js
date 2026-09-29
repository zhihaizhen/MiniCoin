import { useMemo } from 'react';

export function useGenSymbols({
  symbolAlias,
  symbol,
  tickSizeFraction,
  priceStep,
}) {
  return useMemo(() => {
    const exchange = process.env.MARVEL_APP_TITLE;
    const symbols = {};
    // [symbol, `.${symbolAlias}`].forEach((name) => {
    // [symbol].forEach((name) => {
    [symbolAlias].forEach((name) => {
      symbols[name] = {
        ticker: name,
        symbol: name,
        name: symbolAlias,
        description: symbolAlias,
        type: 'futures',
        session: '24x7',
        timezone: 'Etc/UTC',
        minmov: priceStep, // 最小波动
        pricescale: 1 * `1e${tickSizeFraction || 0}`, // 价格精度
        has_intraday: true, // 是否提供日内分钟数据
        has_weekly_and_monthly: true,
        exchange, // 展示的交易所名字
      };
    });
    return symbols;
  }, [symbol, tickSizeFraction, priceStep, symbolAlias]);
}
