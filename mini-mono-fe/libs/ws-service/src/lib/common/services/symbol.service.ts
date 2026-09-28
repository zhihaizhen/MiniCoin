import http from '../utils/http';
import { api2Host } from '../utils/routerSwitchEvent';

export const getSymbolTags = () => {
  // const url = `${api2Host}/gateway/public/get-tags`;
  const url = `${api2Host}/bms/public/v1/top/notice/notice-ls`;
  return http.get(url);
};
