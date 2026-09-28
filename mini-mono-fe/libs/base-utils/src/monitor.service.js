import { http } from './http';
import { parseUrl } from './url';

const { env } = parseUrl();

export const sendReportData = (params) => {
  if (env === 'test') {
    return null;
  }
  const data = {
    ...params
  };

  console.log('调用接口上报数据', data);
  return http.post('', data, {
    withCredentials: false
  });
};
