import { Env } from '@region-lib/env';
import { request, createRequestInstance } from '@better-bit-fe/base-utils';
import { SwapSideEnum } from '~/enums';

const myRequestInstance = createRequestInstance({
  showErrorMessage: false,
  noErrorMsgCodes: [-999999],
  enableLangHeader: false,
  enableI18nError: false
});

const noErrorRequest = myRequestInstance.request

const { API_HOST } = Env;

/**
 * 获取现货资产列表
 */
export const getSpotAssetList = () => {
  return request({
    url: `${API_HOST}/spot/private/v1/asset/get`,
    method: 'get',
    showErrorMessage: false
  });
};
/**
 * 币对闪兑配置列表查询
 */
export const getSymbolSwapConfigList = () => {
  return request({
    url: `${API_HOST}/spot-swap/public/v1/symbol/symbol-swap-config-list`,
    method: 'get'
  });
};

/**
 * 币对实时价格查询接口
 */
export const getSymbolLastPrice = (params, signal) => {
  return noErrorRequest({
    url: `${API_HOST}/spot-swap/public/v1/symbol/get-symbol-last-price`,
    method: 'GET',
    params,
    signal
  });
};

/**
 * 币对预兑换接口
 */
export const getSymbolSwapPreview = (data: {
  /** 币对，大写，如 ETH_USDT */
  symbol: string;
  /** 交易方向：buy 买入 / sell 卖出 */
  side: SwapSideEnum;
  /** 交易数量，字符串类型，最多 8 位精度 */
  quantity: string;
},signal) => {
  return noErrorRequest({
    url: `${API_HOST}/spot-swap/private/v1/symbol-swap/symbol-swap-preview`,
    method: 'post',
    data,
    signal
  });
};

/**
 * 用户私有接口，币对兑换接口
 */
export const getSymbolSwap = (data) => {
  return request({
    url: `${API_HOST}/spot-swap/private/v1/symbol-swap/swap`,
    method: 'post',
    data,
    showErrorMessage: false
  });
};


export const getSpotMarket = () => {
  return request({
    url: `${API_HOST}/spot/public/v1/quote/market/ticker/24hr?realtimeInterval=24h`,
    method: 'get'
  });
};

export const getExchangeRate = () => {
  return request({
    url: `${API_HOST}/asset/fiat/public/v1/exchange-rate`,
    method: 'get'
  });
};

