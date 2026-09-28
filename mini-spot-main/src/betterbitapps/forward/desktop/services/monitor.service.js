import http from 'common/utils/http';
import { parseUrl } from '@region-lib/env';
import { api2Host } from 'common/utils/routerSwitchEvent';
import { getKline, getKlineMarks } from '@/services/kine.service';
import { consoleLog } from 'common/utils/consoleLog';
import { types } from '@/store';

const { env } = parseUrl();
const uid = localStorage.getItem('REPORT_ID');

const commonData = {
  uid,
  env,
  url: window.location.href, // 页面URL
};

export const sendReportData = (params) => {
  return null;
  // if (env === 'test') {
  //   return null;
  // }
  // const data = {
  //   ...params,
  //   ...commonData,
  // };

  // consoleLog('调用接口上报数据', data);
  // return http.post('https://vector.easicoin.io/', data, {
  //   withCredentials: false,
  // });
};
