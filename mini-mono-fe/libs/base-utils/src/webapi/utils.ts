/* eslint-disable @typescript-eslint/no-explicit-any */
import { getGuid } from '../guid';
import { getUserToken } from '../auth';
import { CustomAxiosRequestConfig, WebReq } from './index';

export const getHeaders = (config: CustomAxiosRequestConfig) => {
  return {
    UserToken: getUserToken(),
    guid: getGuid(),
    'Content-Type': config.contentType || 'application/json'
  };
};

/**
 * blob数据转为json
 * @param {Blob} data
 */
export const blobToString = (data: Blob) => {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onloadend = function (evt: any) {
      let result;
      try {
        // 如果出错的场合下，后端会返回正常的字符串
        result = JSON.parse(evt.target.result);
      } catch (err) {
        // 如果非出错场合，则直接blob
        result = evt.target.result;
      } finally {
        resolve(result);
      }
    };
    fr.readAsText(data);
  });
};

/**
 * 解析路由参数responseType
 *
 */
const reg = /:[a-z|A-Z]+/g;
export function parseParams(url: string): Array<string> {
  const ps = url.match(reg);
  if (!ps) {
    return [];
  }
  return ps.map((k) => k.replace(/:/, ''));
}

/**
 * 按照url和params生成相应的url
 * @param url
 * @param params
 */
export function genUrl(url: string, params: WebReq['params']) {
  if (!params) {
    return url;
  }

  const ps = parseParams(url);
  ps.forEach((k) => {
    const reg = new RegExp(`:${k}`);
    url = url.replace(reg, params[k]);
  });

  const path: Array<string> = [];
  for (const key of Object.keys(params)) {
    if (!ps.find((k) => k === key)) {
      path.push(`${key}=${params[key]}`);
    }
  }

  return url + (path.length > 0 ? `?${path.join('&')}` : '');
}

/**
 * create a standard request error object with optional info like error code
 * @param message error message
 * @param code error code
 * @returns the standard request error object
 */
export class RequestError extends Error {
  code: number;
  originalResponse: Record<string, any>;
  url: string;
  constructor(
    message: string,
    code: number,
    originalResponse?: Record<string, any>,
    url?: string
  ) {
    super(message);
    this.code = code;
    this.originalResponse = originalResponse;
    this.url = url;
  }
}
