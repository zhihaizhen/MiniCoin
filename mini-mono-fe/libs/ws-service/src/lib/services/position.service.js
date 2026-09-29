import http from '../common/utils/http';
// import { api2Host } from 'common/utils/routerSwitchEvent';

// const privateApiHost = () => `${api2Host}/private`;
// const privateApiHostV3 = () => `${api2Host}/v3/private`;
const api2Host = '/mapi';
const privateApiHostV3 = () => `${api2Host}/v3/private`;

// 获取持仓列表
// /v3/private/position/list
// /linear/position/list
// export { getPositionList } from '../common/components/LinearPositions/services/position.service';
// export { getPositionList as getInversePositionList } from '../common/components/ReversePositions/services/position.sevice';

export const getPositionList = (params) => {
  let url = `${privateApiHostV3()}/linear/position/list`;
  if (params?.symbol) {
    url = `${privateApiHostV3()}/linear/position/list?symbol=${params.symbol}`;
  }
  return http.get(url);
};
// 取消全部委托 -- to be delete
// export const cancelAllPositionOrder = (params, type) => {
//   const url =
//     type === 'conditions'
//       ? `${privateApiHost()}/linear/stop-order/cancel-all-normal`
//       : `${privateApiHost()}/linear/order/cancel-all`;
//   return http.post(url, params, {
//     event: {
//       sc: type === 'conditions' ? 20245 : 20243,
//       ec: type === 'conditions' ? 20246 : 20244,
//     },
//   });
// };

// 我的资产列表
export const getWalletList = () =>
  http.get(`${api2Host}/trade/private/v1/wallet/list`);

// 风险限额列表 deprecated
// export const getRiskLimit = (symbol) =>
//   http.get(`${privateApiHost()}/trade/private/v1/position/linear-risk-limit?symbol=${symbol}`);

// 获取汇率
export const exchangeRate = (currencyCode) =>
  http.get(`${api2Host}/fiat/public/get-exchange-rate-ls?name=${currencyCode}`);
