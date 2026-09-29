
import { getLang } from '@better-bit-fe/base-utils';
import { isPC, isApp } from '@better-bit-fe/base-utils';


export const getAppScreenHeight = (cb) => {
  const timestamp = new Date().valueOf();
  if (isApp() &&  typeof window !== undefined ) {
    const param = {
      methodName: 'getScreenInfo',
      moduleName: '_b_bridge_SystemInfo_',
      uniqueId: `${timestamp}-getAppScreenHeight`,
      params: {}
    };
    try {
      const jsonPrams = JSON.stringify(param);
      (window as any)?.flutter_inappwebview.callHandler(
        '_b_bridge_SystemInfo_',
        jsonPrams
      );

      (window as any)._b_bridge_callback_ = cb;
    } catch (err) {
      throw new Error(err);
    }
  }
};

export const getAppToken = (cb) => {
  if (isApp() &&  typeof window !== undefined ) {
    const param = {
      methodName: 'getCookie',
      moduleName: '_b_bridge_SystemInfo_',
      uniqueId: 'getCookie', // 用于回调
      params: {
        url: window.location.origin
      }
    };
    const jsonPrams = JSON.stringify(param);
    try {
      (window as any)?.flutter_inappwebview?.callHandler(
        '_b_bridge_SystemInfo_',
        jsonPrams
      );
      (window as any)._b_bridge_callback_ = cb;
    } catch (err) {
      console.error(err);
    }
  }
};