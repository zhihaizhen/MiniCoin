import createRequest, {
  apiInterceptors,
  reportInterceptors
} from '@unified/request';

const request = createRequest()
  .useRequest(reportInterceptors.request)
  .useResponse(reportInterceptors.response, reportInterceptors.error)
  .useRequest(apiInterceptors.request)
  .useResponse(apiInterceptors.response, apiInterceptors.error);

export const fetch = request; // 临时兼容一些项目的引用方式

export { request };

export function hasScript(url) {
  const scriptsArr = Array.from(document.getElementsByTagName('script'));
  let has = false;
  for (let i = 0, len = scriptsArr.length; i < len; i += 1) {
    has =
      scriptsArr[i].src.replace('http:', 'https:') ===
      url.replace('http:', 'https:');
    if (has) {
      break;
    }
  }
  return has;
}
