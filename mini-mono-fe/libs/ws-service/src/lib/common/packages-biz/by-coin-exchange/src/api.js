/* eslint-disable max-len */
// import { Env } from '@region-lib/env';

// const { API_HOST } = Env;

import { api2Host as API_HOST } from '../../../utils/routerSwitchEvent';
// wallet/balance
const walletBalanceApi = `${API_HOST}/trade/private/v1/wallet/list`;
const exchangeLimitApi = `${API_HOST}/exchange/settings`;
const askPriceApi = `${API_HOST}/exchange/preOrder`;
const doExchangeApi = `${API_HOST}/exchange/exchangeOrder`;

export const getWalletBalance = (http) => http.get(walletBalanceApi);

export const getAssetsExchangeLimit = (http, c) =>
  http.get(exchangeLimitApi, { params: { coin: c } });

export const getAssetsExchangeSetting = (http, from_coin, to_coin) =>
  http.get(`${exchangeLimitApi}?from_coin=${from_coin}&to_coin=${to_coin}`);

export const getExchangeAskPrice = (http, p = {}) => {
  p.exchange_source = '1';
  return http.post(askPriceApi, p);
};

export const doExchange = (http, p = {}) => {
  p.exchange_source = '1';
  return http.post(doExchangeApi, p);
};
