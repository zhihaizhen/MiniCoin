import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

const URL = {
  spotRecommend: `${API_HOST}/spot/public/v1/config/default_symbols`,
  spotTrendKline: `${API_HOST}/spot/public/v1/quote/market/klines`,
  futureTrendKline: `${API_HOST}/trade/public/v1/market/kline-list`,
  futureTrendKlineData: `${API_HOST}/trade/public/v1/market/kline-data`,
  preference: `${API_HOST}/user/private/v3/preference/get`, //获取合约币对bookedSymbol
  favoriteChange: `${API_HOST}/user/private/v3/preference/set`,
  exchangeRate: `${API_HOST}/asset/fiat/public/v1/exchange-rate`,
  sectionCategory: `${API_HOST}/spot/public/v1/config/trade_section_category`
};

export const getSectionCategory = () => {
  return fetch({
    url: URL.sectionCategory,
    method: 'GET'
  });
};

export const getSpotRecommend = () => {
  return fetch({
    url: URL.spotRecommend,
    method: 'GET'
  });
};

export const getExchangeRate = () => {
  return fetch({
    url: URL.exchangeRate,
    method: 'GET'
  });
};

export const getFutureTrendKline = (params) => {
  return fetch({
    url: URL.futureTrendKline,
    method: 'GET',
    params
  });
};

/**
 * 聚合 K 线：一次返回多个 symbol 的 list（无参）
 * data: [{ symbol, list: [{ startAt, open, high, low, close, volume }] }]
 */
export const getFutureTrendKlineData = () => {
  return fetch({
    url: URL.futureTrendKlineData,
    method: 'GET'
  });
};

/**
 * [
 * 1499040000000,      // Open time
 * "0.01634790",       // Open
 * "0.80000000",       // High
 * "0.01575800",       // Low
 * "0.01577100",       // Close
 * "148976.11427815",  // Volume
 * 1499644799999,      // Close time
 * "2434.19055334",    // Quote asset volume
 * 308,                // Number of trades
 * "1756.87402397",    // Taker buy base asset volume
 * "28.46694368",      // Taker buy quote asset volume
 * ]
 */
export const getSpotTrendKline = (params) => {
  return fetch({
    url: URL.spotTrendKline,
    method: 'GET',
    params
  });
};

export const getPreference = async () => {
  return fetch({
    url: URL.preference,
    method: 'POST',
    data: {
      preference_keys: ['bookSymbolSequence']
    }
  });
};

// futures  bookSymbolSequence  ;spot  spotBookSymbolSequence
export const postFavoriteChange = (data: any) => {
  return fetch({
    url: URL.favoriteChange,
    method: 'POST',
    data
  });
};
