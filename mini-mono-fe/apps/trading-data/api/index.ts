import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';
import type {
  GetKlineParams,
  GetIndexKlineParams,
  KlineListResponse
} from '~/types/kline';

const { API_HOST } = Env;

const URL = {
  LimitList: `${API_HOST}/trade/public/v1/position/risk-limit`,
  priceList: `${API_HOST}/trade/public/v1/market/mark-price-list`,
  // 事件合约行情：index price K 线（与 mark-price-list 字段对齐：startAt/open/high/low/close）
  indexKlineList: `${API_HOST}/trade/public/v1/market/index-kline-list`,
  // 秒级 index price（表字段 ts/price；本页表格暂用 K 线 close，预留）
  indexPriceTicker: `${API_HOST}/trade/public/v1/market/index-price-ticker`,
  fundFeeList: `${API_HOST}/trade/public/v1/market/funding-rate-history`,
  dynamicSymbol: `${API_HOST}/trade/public/v1/market/dynamic_symbol`,
  riskPollList: `${API_HOST}/trade/public/v1/market/risk-pool-list`
};

export const getRiskLimitList = (symbol) => {
  return fetch({
    url: `${URL.LimitList}?symbol=${symbol}&timeStamp=${Date.now()}`,
    method: 'GET'
  });
};

export const getPriceList = (
  params: GetKlineParams
): Promise<KlineListResponse> => {
  return fetch({
    url: `${URL.priceList}?symbol=${params?.symbol}&resolution=${params?.resolution}&from=${params.from}&to=${params.to}`,
    method: 'GET'
  });
};

/** 指数价格 K 线：GET /trade/public/v1/market/index-kline-list */
export const getIndexKlineList = (
  params: GetIndexKlineParams
): Promise<KlineListResponse> => {
  const limitQuery = params?.limit != null ? `&limit=${params.limit}` : '';
  return fetch({
    url: `${URL.indexKlineList}?symbol=${params?.symbol}&resolution=${params?.resolution}&from=${params.from}&to=${params.to}${limitQuery}`,
    method: 'GET'
  });
};

/** 指数价格秒级行情：GET /trade/public/v1/market/index-price-ticker */
export const getIndexPriceTicker = ({ symbol, from, to }) => {
  return fetch({
    url: `${URL.indexPriceTicker}?symbol=${symbol}&from=${from}&to=${to}`,
    method: 'GET'
  });
};

export const getFundFeeList = ({ symbol, from, to }) => {
  return fetch({
    url: `${
      URL.fundFeeList
    }?symbol=${symbol}&from=${from}&to=${to}&timeStamp=${Date.now()}`,
    method: 'GET'
  });
};

export const getDynamicSymbol = () => {
  return fetch({
    url: URL.dynamicSymbol,
    method: 'GET'
  });
};

export const getRiskPollList = ({ symbol }) => {
  return fetch({
    url: `${URL.riskPollList}?symbol=${symbol}`,
    method: 'GET'
  });
};
