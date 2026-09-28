import http from 'common/utils/http';
import { api2Host } from 'common/utils/routerSwitchEvent';
import { setBodyToUrlParam } from 'common/utils/url';
import { types } from '@/store';


// 获取币种列表
export const getSpotSymbolList = () =>
  http.get(`${api2Host}/spot/public/v1/config/quote_tokens`);

