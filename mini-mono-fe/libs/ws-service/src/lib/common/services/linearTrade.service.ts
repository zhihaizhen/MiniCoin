import http from '../utils/http';
// import { v3CommonLinearPrivateApiPrefix } from '../constants/service';
import { ITradeListReq } from '../types/services/trade';
import { api2Host } from '../utils/routerSwitchEvent';

// const v3PrivatetTradeApiPrefix = `${v3CommonLinearPrivateApiPrefix}/trade`;

export const getTradeList = ({ symbol, execTypes }: ITradeListReq) => {
  const url = `${api2Host}/trade/private/v1/contract/order-fills`;
  return http.get(
    `${url}?symbol=${symbol}&execTypes=${execTypes}&timeStamp=${Date.now()}`
  );
};

export const getTempCoinList = () => {
  const url = `${api2Host}/dashboard/ticker/24hr`;
  return http.get(url);
};
