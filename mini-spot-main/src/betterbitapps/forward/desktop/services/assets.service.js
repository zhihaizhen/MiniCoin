import http from 'common/utils/http';
import { api2Host } from 'common/utils/routerSwitchEvent';
import { setBodyToUrlParam } from 'common/utils/url';
import { types } from '@/store';


// 我的资产列表
export const getWalletList = () =>
  http.get(`${api2Host}/spot/private/v1/asset/get`);


// 获取所有币种的汇率
export const allFiatRate = () =>
  http.get(`${api2Host}/asset/fiat/public/v1/exchange-rate`);


export const getTransferList = () => {
  return http.get(
    `${api2Host}/cht-asset-withdraw/config/private/v1/token/transfer/list`,
  );
};


// 获取资产
export const getTransferConfig = (globalDispatch) => {
  getTransferList().then((res) => {
    if (!res) {
      return;
    }
    const list = res?.spot?.transfer_out_list;
    const options = list.map((it) => {
      return {
        label: it,
        value: it,
      };
    });
    globalDispatch({
      type: types.SET_ASSET_OPTION_LIST,
      data: options,
    });
  });
};


export const getCoinList = (params) =>
  http.get(
    setBodyToUrlParam(`${api2Host}/cht-asset-withdraw/private/v1/coin/list`),
  );

export const transfer = (params) =>
  http.post(`${api2Host}/asset/fund/private/v1/wallet/transfer`, params);

// fetch funding account assets
export const getFundingAssets = (params) =>
  http.get(`${api2Host}/asset/fund/private/v1/wallet/get-wallet-assets`);
