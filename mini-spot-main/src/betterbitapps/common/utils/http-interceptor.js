import { getToken, setToken } from 'common/utils/storageData';
import { sendReportData } from '@/services/monitor.service';
import { message, notify } from 'common/antdComponents';
import { isString } from '@unified/helpers';
import i18n from 'common/utils/i18n';
import store from '@/store/store';
import { consoleLog } from 'common/utils/consoleLog';
import { types } from '@/store';

const EVENT_LIMIT_TIME = 30000;
const APP_NAME = process.env.MARVEL_APP_NAME;

// For create order trace router
const traceIdTrackingMap = {};
export const addTraceIdWatching = (traceId, clearTimer) => {
  traceIdTrackingMap[traceId] = {
    start: performance.now(),
    timer: clearTimer,
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

  // 当 Promise 被 reject 且没有被 catch 处理的时候，就会抛出 Promise异常
  window.addEventListener('unhandledrejection', (event) => {
    const { reason: wrappedResp } = event;
    consoleLog('2222-unhandledrejection', event, wrappedResp);
    if (!wrappedResp) return;

    // 接口通了，但code不为0
    if (wrappedResp?.request) {
      // sendReportData({
      //   type: 'error',
      //   errorType: 'promiseError',
      //   message: wrappedResp?.data?.message,
      //   // requestData: data,
      //   responseData: wrappedResp?.data?.data,
      //   interfaceUrl: wrappedResp?.request?.responseURL,
      //   responseCode: wrappedResp?.data?.code,
      // });
    } else {
      // 其他未被catch的promise error
      let message = '';
      let line = 0;
      let column = 0;
      let file = '';
      let stack = '';
      if (typeof wrappedResp === 'string') {
        message = wrappedResp;
      } else if (typeof wrappedResp === 'object') {
        message = wrappedResp.message;
        if (wrappedResp.stack) {
          const matchResult = wrappedResp.stack.match(/at\s+(.+):(\d+):(\d+)/);
          if (matchResult) {
            [, file, line, column] = matchResult;
          }
          stack = wrappedResp.stack;
        }
      }
      // sendReportData({
      //   type: 'error',
      //   errorType: 'promiseError',
      //   message, // 标签名
      //   filename: file,
      //   position: `${line}:${column}`, // 行列
      //   stack,
      //   selector: '',
      // });
    }

    if (isString(wrappedResp)) {
      message.error(wrappedResp);
      return;
    }

    if (!wrappedResp.data && wrappedResp?.status) {
      if (+wrappedResp.status === 403) {
        message.error(i18n.t(`ztsl_error_code:${wrappedResp?.status}`));
        return;
      }
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
    const errorCodeTranslation = i18n.t(`ztsl_error_code:${data.code}`);
    if (String(data.code) === errorCodeTranslation) {
      const defaultMsg = i18n.t('ztsl_error_code:default');
      const msg = defaultMsg === 'default' ? data.message : defaultMsg;
      // 把错误直接打出来
      try {
        const originMsg = JSON.stringify(wrappedResp);
        const newMsg = data?.message || originMsg;
        message.error(`${data?.code ?? 9000000}: ${newMsg}`);
      } catch (err) {
        const newMsg = data?.message || wrappedResp;
        message.error(`${data?.code ?? 9000000}: ${newMsg}`);
      }
    } else {
      message.error(errorCodeTranslation);
    }
  });

  http.interceptors.request.use((opts) => {
    const networkType = window.navigator.onLine;
    if (!networkType) {
      // 注意：没有网络时直接 reject。不能 return null —— axios 会用 null 去 dispatchRequest，
      // 导致下游 .then 误判为成功
      const offlineError = new Error('Network offline');
      offlineError.isNetworkError = true;
      return Promise.reject(offlineError);
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

  http.interceptors.response.use(
    (wrappedResp) => {
      // 上报接口
      if (wrappedResp?.config?.url.includes('vector')) {
        return null;
      }

      if (!wrappedResp || !wrappedResp.data) {
        return Promise.reject({
          message: 'Non Response!',
          status: wrappedResp?.status,
        });
      }
      const {
        data,
        headers,
        config: { event, meta },
      } = wrappedResp;
      const code = data.code != null ? data.code : data.retCode;
      // 接口正常通了
      if (code === 0 || code === 200) {
        return Promise.resolve(meta?.showOrigin ? data : data.data);
      }

      if (code === 26200007 || code === 26200011) {
        store.dispatch({ type: types.CLEAN_USER_INFO });
      }
      return Promise.reject(wrappedResp);
    },
    (err) => {
      // xhr error
      consoleLog('http.interceptors.response.err', err, err instanceof Error);
      // 断网错误必须优先重新抛出，避免下面「无 config.url」的上报逃逸分支把它当成普通错误
      // 提前 return undefined 吞掉，导致被误判为 resolve(undefined) 成功
      if (err && err.isNetworkError) {
        return Promise.reject(err);
      }
      if (err && err instanceof Error) {
        const { message, config, code } = err;
        const { url, data } = config || {};
        // 避免上报接口的错误导致循环上报
        if (!url || (url && url.includes('vector'))) {
          return undefined;
        }
        const errorData = {
          type: 'error',
          errorType: 'xhr', // 比如跨域,接口404，没有网络
          message,
          requestData: data,
          interfaceUrl: url,
          code, // 比如ERR_NETWORK
        };
        // sendReportData(errorData);
      }
      // 其余错误维持原有行为（上报后静默 resolve），把影响面限制在断网场景。
      return undefined;
    },
  );
};

export default createInterceptor;
