import http from 'common/utils/http';
import { api2Host } from 'common/utils/routerSwitchEvent';
import {
  IPositionTradeDetailReq,
  IPlanOrderListReq,
} from 'common/types/services/position';

// 过滤掉 undefined/null，拼装 query string
const toQueryString = (params: Record<string, unknown>) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

// 当前委托
export const getCurrentEntrust = ({ account_id }: IPositionTradeDetailReq) => {
  const url = `${api2Host}/spot/private/v1/order/open_orders`;
  const query = `account_id=${account_id}&limit=100&s=getOrders&from_trade_id=0`;
  return http.get(`${url}?${query}`);
};

// 历史委托
export const getHistoryEntrust = ({ account_id }: IPositionTradeDetailReq) => {
  const url = `${api2Host}/spot/private/v1/order/history_orders`;
  const query = `account_id=${account_id}&limit=100&s=getOrders&from_trade_id=0`;
  return http.get(`${url}?${query}`);
};

// 交易明细
export const getPositionTradeDetail = ({
  account_id,
}: IPositionTradeDetailReq) => {
  const url = `${api2Host}/spot/private/v1/order/my_trades`;
  const query = `account_id=${account_id}&limit=100&s=getOrders&from_trade_id=0`;
  return http.get(`${url}?${query}`);
};

// 当前委托--计划委托家族（不传 plan_type：返回 NORMAL + PROFIT_OR_STOP 合集，
// 前端按返回项 plan_type 分流到「计划委托」「止盈止损」子 tab）
export const getCurrentPlanEntrust = (params: IPlanOrderListReq = {}) => {
  const url = `${api2Host}/spot/private/v1/plan_order/open_orders`;
  const query = toQueryString({ ...params });
  return http.get(`${url}?${query}`);
};

// 历史委托--计划委托家族（同上）
export const getHistoryPlanEntrust = (params: IPlanOrderListReq = {}) => {
  const url = `${api2Host}/spot/private/v1/plan_order/history_orders`;
  const query = toQueryString({ ...params });
  return http.get(`${url}?${query}`);
};
