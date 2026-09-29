import http from 'common/utils/http';
import { api2Host } from 'common/utils/routerSwitchEvent';
import { baseConfig } from 'common/constants/kline';

const recentTradeUrl = () => `${api2Host}/spot/public/v1/quote/trades`;

/**
 * 最近成交：
 * symbolAlias变化时会先调用这个http方法拉取，
 * 然后再用 WebSocket 的增量推送去追加最新成交
 */
export const getRecentTrades = async ({ symbol }) => {
  const url = `${recentTradeUrl()}?symbol=${baseConfig.exchangeId}.${symbol}`;
  const list = await http.get(url);
  return list || [];
};

export default getRecentTrades;
