import { Env } from '@region-lib/env';
import { fetch } from '../utils/request';

const { API_HOST, WS_HOST } = Env;

const URL = {
  //futures
  dynamicSymbol: `${API_HOST}/trade/public/v1/market/dynamic_symbol`,

  //spot
  quote_tokens: `${API_HOST}/spot/public/v1/config/quote_tokens`, // 现货分类接口，比如tokenName=usdt，返回所有usdt币对
  // spotMarket: `${API_HOST}/api/quote/v1/broker/tickers`, // 币对24小时行情http，弃用
  spotConfig: `${API_HOST}/spot/public/v1/quote/market/tickers`, // 现货配置的行情数据，可废弃

  // 收藏接口
  preference: `${API_HOST}/user/private/v3/preference/get`, //获取合约币对bookedSymbol
  favoriteChange: `${API_HOST}/user/private/v3/preference/set`
};
export const wsUrl = {
  publicFeatures: `${WS_HOST}/realtime_public?v=9`,
  publicSport: `${WS_HOST}/ws/quote/v1`
};

export const getDynamicSymbol = async () => {
  return fetch({
    url: URL.dynamicSymbol,
    method: 'GET'
  });
};
export const getSpotDynamicSymbol = async () => {
  return fetch({
    url: URL.quote_tokens,
    method: 'GET'
  });
};

export const getSpotQuote = async () => {
  return fetch({
    url: URL.spotConfig,
    method: 'GET'
  });
};

// 收藏
export const getPreference = async () => {
  return fetch({
    url: URL.preference,
    method: 'POST',
    data: {
      preference_keys: ['bookSymbolSequence']
    }
  });
};

export const postFavoriteChange = (data: any) => {
  return fetch({
    url: URL.favoriteChange,
    method: 'POST',
    data
  });
};
