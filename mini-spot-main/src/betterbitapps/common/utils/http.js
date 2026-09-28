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

if (window.location.href.includes('user_id_type')) {
  const value = window.location.href.split('user_id_type=')[1];
  defaultRequestOptions.headers.user_id_type = value;
}

if (window.location.href.includes('user_id')) {
  const value = window.location.href.split('user_id=')[1];
  defaultRequestOptions.headers.random_user_id = value;
}

// console.log('defaultRequestOptions', defaultRequestOptions);

const i18nRequestOptions = {};
const loggerHttpOpts = {
  headers: { 'Content-Type': 'application/json' },
};

/**
 * Http request instance
 */
const http = createFetchInstance(defaultRequestOptions)
  .useRequest(reportInterceptors.request, { tracing: null })
  .useResponse(reportInterceptors.response, reportInterceptors.error, {
    tracing: null,
  });

export const i18nHttpInstance = createFetchInstance(i18nRequestOptions);
export const loggerHttpInstance = createFetchInstance(loggerHttpOpts);

createInterceptor(http);

export default http;
