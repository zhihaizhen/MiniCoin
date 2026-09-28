import http from '../utils/http';
import { api2Host } from '../utils/routerSwitchEvent';

export const getLpSymbolInfo = () => {
  const url = `${api2Host}/trade/private/v1/position/lp-list-all`;
  return http.get(url);
};
export const getLpPool = (token: string) => {
  const url = `${api2Host}/lp-service/public/v1/lp/supply?token=${token}`;
  return http.get(url);
};

export const getLpPrice = (token: string) => {
  const url = `${api2Host}/lp-service/public/v1/trade/price?symbol=${token}`;
  return http.get(url);
};
