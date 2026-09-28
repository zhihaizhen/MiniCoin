import { message } from 'antd';
import { isString } from '@unified/helpers';
import { useFmInJS } from '@better-bit-fe/base-hooks';

const EVENT_LIMIT_TIME = 30000;

// For create order trace router
const traceIdTrackingMap = {};
export const addTraceIdWatching = (traceId, clearTimer) => {
  traceIdTrackingMap[traceId] = {
    start: performance.now(),
    timer: clearTimer
  };
};
export const getTraceIdStart = (traceId) => traceIdTrackingMap[traceId];
export const deleteTraceIdTracking = (traceId) => {};

const createInterceptor = (http) => {
  const t = useFmInJS();
  window.addEventListener('unhandledrejection', (event) => {
    const { reason: wrappedResp } = event;
    if (isString(wrappedResp)) {
      message.error(wrappedResp);
      return;
    }
    if (!wrappedResp) return;
    if (!wrappedResp.data && wrappedResp?.status) {
      if (+wrappedResp.status === 403) {
        message.error(t(wrappedResp?.status));
        return;
      }
      // 404 ?
      message.error(wrappedResp?.status);
      return;
    }
    if (!wrappedResp.data && !wrappedResp?.code) {
      message.error(wrappedResp?.status ?? wrappedResp);
      return;
    }
    if (wrappedResp.data && !wrappedResp.data.code) {
      message.error(wrappedResp?.status ?? wrappedResp);
      return;
    }

    const { config = {} } = wrappedResp;
    const data = wrappedResp?.data ?? wrappedResp;
    const errorCodeTranslation = t(data.code);
    if (String(data.code) === errorCodeTranslation) {
      const defaultMsg = t('default');
      const msg = defaultMsg === 'default' ? data.message : defaultMsg;
      message.error(`${data?.code ?? 9000000}: ${msg}`);
    } else {
      message.error(errorCodeTranslation);
    }
  });
  /**
   * Request Interceptor 1.
   * Configure all used interceptors here
   */
  http.interceptors.request.use((opts) => {
    if (opts.event) {
      opts.event.start = performance.now();
    }
    opts.requestStart = performance.now();

    if (opts.body) {
      if (opts.method.toLowerCase() === 'get') {
        opts.params = opts.body;
      } else {
        opts.data = opts.body;
      }
    }
    // For custom trace id data collection
    const pusherTraceId = opts.headers['X-Client-Tag'];
    if (pusherTraceId) {
      const clearTimer = setTimeout(() => {
        deleteTraceIdTracking(pusherTraceId);
      }, 60000); // delete Id after 1min timeout
      addTraceIdWatching(pusherTraceId, clearTimer);
    }

    return opts;
  });

  /**
   * Response Interceptor last (2).
   * Simplify the response data
   */
  http.interceptors.response.use(
    (wrappedResp) => {
      if (!wrappedResp || !wrappedResp.data)
        return Promise.reject({
          message: 'Non Response!',
          status: wrappedResp?.status
        });

      const {
        data,
        headers,
        config: { event, meta }
      } = wrappedResp;

      const code = data.code != null ? data.code : data.retCode;
      if (code === 0) {
        return Promise.resolve(meta?.showOrigin ? data : data.data);
      }
      if (code === 26200007 || code === 26200011) {
        // TODO 清除用户数据
        return Promise.reject(data);
      }
      return Promise.reject(wrappedResp);
    },
    (err) => {
      const opts = err?.config || {};
      if (err instanceof Error) {
        //
      } else if (opts.event && err.code) {
        const span = performance.now() - opts.event.start;
        if (span < EVENT_LIMIT_TIME) {
          //
        }
      }
    }
  );
};

export default createInterceptor;
