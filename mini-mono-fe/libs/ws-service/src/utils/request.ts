import createRequest, {
  apiInterceptors,
  reportInterceptors
} from '@unified/request';
import { getGlobalLocaleMsg } from '@better-bit-fe/base-utils';

const request = createRequest()
  .useRequest(reportInterceptors.request)
  .useResponse(reportInterceptors.response, reportInterceptors.error)
  .useRequest(apiInterceptors.request)
  .useResponse(apiInterceptors.response, apiInterceptors.error);

request.useResponse(null, (err) => {
  const code = err.code;
  const config = err.config;
  const tmsMsg = getGlobalLocaleMsg();
  const i18nMsg = tmsMsg[code];
  // 对现货接口做单独处理
  if (err.code !== 0 && err?.response?.status === 200) {
    return Promise.resolve(err.response.data);
  }
  if (err.network_error) {
    // 跨域、403等网络错误
    err.message = tmsMsg['network'];
  } else if (i18nMsg) {
    // 匹配到TMS的Code
    err.message = code + ':' + i18nMsg;
  }

  // else {
  //   // 匹配不到TMS的Code
  //   err.message = code + ':' + t('default');
  // }
  /*
  const i18nMsg = t(`ztsl_error_code:${code}`)

  // 将message转换为tms配置的错误文案
  if (err.network_error) {
    // 跨域、403等网络错误
    err.message = t(`ztsl_error_code:network`)
  } else if (String(code) !== i18nMsg) {
    // 匹配到TMS的Code
    err.message = code + ':' + i18nMsg
  } else {
    // 匹配不到TMS的Code
    err.message = code + ':' + t('ztsl_error_code:default')
  }
  */
  if (config.showErrorMessage && !isUnLogin(code)) {
    // message.error(err.message);
  }

  return Promise.reject(err);
});

export function isUnLogin(code: number) {
  return code === 26200007 || code === 26200011;
}

export const fetch = request; // 临时兼容一些项目的引用方式

export { request };
