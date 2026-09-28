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
