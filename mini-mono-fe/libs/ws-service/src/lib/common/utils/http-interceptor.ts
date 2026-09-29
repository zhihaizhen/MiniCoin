import { getToken, setToken } from '../utils/storageData';
//
import { types } from '../../store';
import store from '../../store/store';
import { message } from 'antd';
import { isString } from '@unified/helpers';
import { copyTradeErrorCode } from './code';

const EVENT_LIMIT_TIME = 30000;
const APP_NAME = process.env.MARVEL_APP_NAME;

// For create order trace router
const traceIdTrackingMap = {};
export const addTraceIdWatching = (traceId, clearTimer) => {
  traceIdTrackingMap[traceId] = {
    start: performance.now(),
    timer: clearTimer
  };
};
export const getTraceIdStart = (traceId) => traceIdTrackingMap[traceId];
export const deleteTraceIdTracking = (traceId) => {
  // const tracingObj = traceIdTrackingMap[traceId];
  // if (tracingObj) {
  //   clearTimeout(tracingObj.timer);
  //   Reflect.deleteProperty(traceIdTrackingMap, traceId);
  // }
};

const createInterceptor = (http) => {
  /**
   * handle un-handled rejection
   *
   * request's response handle order:
   *  response -> response interceptors
   *      -> raw request
   *          |--(success)--> end;
   *          |--(error)-->
   *              |--(is catched)--> request catch function
   *              |--(un-catched)---> throw out.
   *                | root: window unhandledrejuection
   *
   * unhandledrejection only handle `PromiseRejectEvent`.
   */
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const { reason: wrappedResp } = event;
      //
      if (isString(wrappedResp)) {
        message.error(wrappedResp);
        return;
      }
      if (!wrappedResp) return;
      if (!wrappedResp.data && wrappedResp?.status) {
        if (+wrappedResp.status === 403) {
          message.error(`ztsl_error_code:${wrappedResp?.status}`);
          return;
        }
        // 404 ?
        message.error(wrappedResp?.status);
        return;
      }
      if (!wrappedResp.data && !wrappedResp?.code) {
        // 老的api 接口，比如 profile
        message.error(wrappedResp?.status ?? wrappedResp);
        return;
      }
      if (wrappedResp.data && !wrappedResp.data.code) {
        message.error(wrappedResp?.status ?? wrappedResp);
        return;
      }

      const { config = {} } = wrappedResp;
      const data = wrappedResp?.data ?? wrappedResp;
      const errorCodeTranslation = `ztsl_error_code:${data.code}`;
      if (String(data.code) === errorCodeTranslation) {
        const defaultMsg = 'ztsl_error_code:default';
        const msg = defaultMsg === 'default' ? data.message : defaultMsg;
        message.error(`${data?.code ?? 9000000}: ${msg}`);
      } else {
        message.error(errorCodeTranslation);
      }
    });
  }
  /**
   * Request Interceptor 1.
   * Configure all used interceptors here
   */
  http.interceptors.request.use((opts) => {
    const token = getToken();
    if (token) {
      opts.headers.auth_token = token;
    }
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
      const { token } = data;

      const headerToken = headers?.token;

      const code = data.code != null ? data.code : data.retCode;

      if (typeof token !== 'undefined' && token !== null) {
        setToken(token);
      } else if (headerToken) {
        setToken(headerToken);
      }

      if (code === 0) {
        return Promise.resolve(meta?.showOrigin ? data : data.data);
      }

      if (code === 26200007 || code === 26200011) {
        // console.log('Code Error', code);
        setToken('');
        store.dispatch({ type: types.CLEAN_USER_INFO });
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
