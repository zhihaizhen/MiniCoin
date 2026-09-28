import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

const HOST = API_HOST;

const URL = {
  prewidaddress: `${HOST}/asset-deposit/fiat/private/pre-wid-address-parms`,
  symbolList: `${HOST}/cht-asset-deposit/fiat-deposit/fiats/get_pay_config`, //买币列表
  createOrder: `${HOST}/cht-asset-deposit/fiat-deposit/fiats/create_order`, //创建订单
  fiatDetail: `${HOST}/cht-asset-deposit/fiat-deposit/fiats/prices_mapping` //获取价格
};

export const getPrewidAddress = (params) => {
  return fetch({
    url: `${URL.prewidaddress}?type=${params.type}`,
    method: 'GET',
    headers: {
      uRkey: params.uRkey
    }
  });
};

export const getSymbolList = (params) => {
  return fetch({
    url: URL.symbolList,
    method: 'GET',
    params
  });
};
export const createOrder = (data) => {
  return fetch({
    url: URL.createOrder,
    method: 'POST',
    data
  });
};

export const getFiatDetail = (params) => {
  return fetch({
    url: URL.fiatDetail,
    method: 'GET',
    params
  });
};
