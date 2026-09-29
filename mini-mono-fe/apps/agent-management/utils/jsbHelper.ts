// @ts-nocheck

import { isApp, isPC } from '@better-bit-fe/base-utils';

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

export const getAppToken = (cb) => {
  if (!isPC()) {
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
      window.flutter_inappwebview?.callHandler(
        '_b_bridge_SystemInfo_',
        jsonPrams
      );
      window._b_bridge_callback_ = cb;
    } catch (err) {
      console.error(err);
    }
  }
};
