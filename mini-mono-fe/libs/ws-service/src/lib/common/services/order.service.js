import { reverseModel } from '../model';
import http from '../utils/http';
import { isLinear } from '../utils/symbol';
import { traceParent } from '../utils/tranceParent';
import { api2Host } from '../utils/routerSwitchEvent';

const v3PrivateApiHost = `${api2Host}/v3/private`;
const v3CommonLinearPrivateHost = `${api2Host}/v3/linear/private`;

const getUrl = (symbol) =>
  isLinear(symbol) ? v3CommonLinearPrivateHost : v3PrivateApiHost;

// 聚合活动委托 条件委托 获取orderList  activity | history | normal-conditions
export const getOrderList = (params) => {
  return http.get(`${api2Host}/trade/private/v1/contract/order-all-list`, {
    body: { ...params, timeStamp: Date.now() }
  });
};

// cancel 取消委托
export const cancelOrder = (params, rpProps) => {
  const url = `${api2Host}/trade/private/v1/contract/cancel`;
  return http.post(url, params, {
    event: rpProps,
    headers: { 'X-Client-Tag': traceParent() }
  });
};

// cancel-totally
export const cancelAllOrder = (params, event) => {
  const url = `${api2Host}/trade/private/v1/contract/cancel-totally`;
  return http.post(url, params, {
    event,
    headers: { 'X-Client-Tag': traceParent() }
  });
};

// 修改委托
export const replaceOrder = (params, rpProps) => {
  const url = `${api2Host}/trade/private/v1/contract/order-amend`;
  return http.post(url, reverseModel.replacePost(params), {
    event: rpProps,
    headers: { 'X-Client-Tag': traceParent() }
  });
};
