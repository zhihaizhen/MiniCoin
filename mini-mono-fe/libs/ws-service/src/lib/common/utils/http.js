import createFetchInstance, { reportInterceptors } from '@unified/request';

import createInterceptor from './http-interceptor';

const defaultRequestOptions = {
  withCredentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    platform: 'pcweb',
  },
};

// console.log('defaultRequestOptions', defaultRequestOptions);

const i18nRequestOptions = {};
const loggerHttpOpts = {
  headers: { 'Content-Type': 'application/json' },
};

/**
 * Http request instance
 */
const http = createFetchInstance(defaultRequestOptions)
  .useRequest(reportInterceptors.request, { tracing:null })
  .useResponse(reportInterceptors.response, reportInterceptors.error, {
    tracing:null,
  });

export const i18nHttpInstance = createFetchInstance(i18nRequestOptions);
export const loggerHttpInstance = createFetchInstance(loggerHttpOpts);

createInterceptor(http);

export default http;
