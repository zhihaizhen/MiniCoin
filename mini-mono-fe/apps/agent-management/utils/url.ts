//  @ts-nocheck
import { isApp, isPC } from '@better-bit-fe/base-utils';
import { getLang } from '@better-bit-fe/base-utils/';

export const setBodyToUrlParam = (url, body = {}) => {
  try {
    let queryParam = '';
    if (Object.keys(body)?.length > 0) {
      Object.keys(body).forEach((key) => {
        if (body[key]) {
          queryParam += `${key}=${body[key]}&`;
        }
      });
      return `${url}?${queryParam.slice(0, -1)}`;
    }
    return url;
  } catch (e) {
    console.warn(url, body, e);
    return url;
  }
};

/**
 * Set the url params
 * @param param
 * @return void
 *
 *
 * from: ?tab=2&num=343
 * to: setUrlQueryVariable('id', 231) -> ?tab=2&num=343&id=231 ; setUrlQueryVariable('tab', 99) -> ?tab=99&num=343 ;
 */
export const setUrlQueryVariable = (key, value) => {
  try {
    const query = window?.location?.search?.substring(1);
    const vars = query?.split('&');
    let keyExist = false;
    for (let i = 0; i < vars?.length; i += 1) {
      const pair = vars[i]?.split('=');
      if (pair[0] === key) {
        keyExist = true;
        vars[i] = `${key}=${value}`;
        break;
      }
    }

    if (!keyExist) {
      vars?.push(`${key}=${value}`);
    }

    if (window?.history?.pushState) {
      const newUrl = `${window?.location?.origin}${
        window?.location?.pathname
      }?${vars
        ?.filter((i) => !!i)
        ?.join('&')
        .replace(/^&+/, '')}`;
      window?.history?.pushState({ path: newUrl }, '', newUrl);
    }
  } catch (e) {
    console.error('Push Param Query:', e);
  }
  return;
};

export const keepUrlQueryParams = (newPath: string): string => {
  const lang = getLang();
  const paramsStr = window?.location?.search;
  const hashStr = window?.location?.hash;
  return `/${lang}${newPath}${paramsStr}${hashStr}`;
};

export const getQueryParams = (key: string) => {
  const queryString = window?.location?.search;
  const urlParams = new URLSearchParams(queryString);

  return urlParams.get(key);
};

/* WEB打开新Tab，APP-H5，跳转外部浏览器 */
export const jumpToUrl = (url: string) => {
  let newUrl = url;
  // 跳转到邀请页面不处理header，hideAppBar=1隐藏app原生header
  if (url.indexOf('/newInvitefriends') > 0) {
    newUrl = url.split('?')[0];
  }

  // alert(`jumpToUrl error: ${newUrl}`);
  if (!isPC()) {
    try {
      const param = {
        methodName: 'push',
        moduleName: '_b_bridge_Router_',
        uniqueId: 'nextPage', // 用于回调
        params: {
          path: 'https://www.easicoin.io/web',
          url: `${location.origin}${newUrl}`
        }
      };
      const cb = (data) => {
        console.log('gotoPageInAPP callback', data);
      };
      const jsonPrams = JSON.stringify(param);
      window.flutter_inappwebview.callHandler('_b_bridge_Router_', jsonPrams);
      window._b_bridge_callback_ = cb;
    } catch (e) {
      throw new Error(`jumpToUrl error: ${JSON.stringify(e)}`);
      // console.log(`jumpToUrl error: ${JSON.stringify(e)}`);
    }
  } else {
    window.location.href = `${location.origin}${newUrl}`;
  }
};

// app后退
export const goPrePageInAPP = () => {
  if (!isPC()) {
    const param = {
      methodName: 'pop',
      moduleName: '_b_bridge_Router_',
      uniqueId: 'goPrePage',
      params: {}
    };
    const cb = (data) => {
      console.log('goPrePageInAPP callback', data);
    };
    try {
      const jsonPrams = JSON.stringify(param);
      window.flutter_inappwebview.callHandler('_b_bridge_Router_', jsonPrams);
      window._b_bridge_callback_ = cb;
      return;
    } catch (err) {
      throw new Error(err);
      return;
    }
  } else {
    window.location.href = document.referrer; //TODO
  }
};

export const getAppScreenHeight = (cb) => {
  const timestamp = new Date().valueOf();
  if (isApp()) {
    const param = {
      methodName: 'getScreenInfo',
      moduleName: '_b_bridge_SystemInfo_',
      uniqueId: `${timestamp}-getAppScreenHeight`,
      params: {}
    };
    try {
      const jsonPrams = JSON.stringify(param);
      window.flutter_inappwebview.callHandler(
        '_b_bridge_SystemInfo_',
        jsonPrams
      );
      window._b_bridge_callback_ = cb;
    } catch (err) {
      throw new Error(err);
    }
  }
};
