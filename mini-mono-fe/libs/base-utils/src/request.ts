/**
 * 公共 Request 模块
 *
 * 统一管理所有子项目的 HTTP 请求配置和错误处理
 * 使用说明详见 README.md#公共-request-模块使用说明
 *
 */

import createRequest, {
  apiInterceptors,
  reportInterceptors
} from '@unified/request';
import { message } from 'antd';
import { getLang, getGlobalLocaleMsg } from './index';

/**
 * 请求配置接口
 */
export interface RequestConfig {
  /** 是否显示错误消息，默认 true */
  showErrorMessage?: boolean;
  /** 不显示错误消息的错误码数组，默认 [] */
  noErrorMsgCodes?: number[];
  /** 是否启用语言头，默认 false */
  enableLangHeader?: boolean;
  /** 是否启用 i18n 错误处理，默认 false */
  enableI18nError?: boolean;
}

/**
 * 请求实例接口
 */
export interface RequestInstance {
  /** 请求方法 */
  request: any;
  /** 兼容性导出，与 request 相同 */
  fetch: any;
  /** 判断是否为未登录错误码的函数 */
  isUnLogin: (code: number) => boolean;
}

/**
 * 创建请求实例
 *
 * 根据配置创建具有特定功能的请求实例，支持语言头、i18n错误处理、
 * 错误码过滤等功能。
 *
 * @param config 配置选项
 * @returns 配置好的请求实例
 *
 * @example
 * ```typescript
 * // 创建带语言头和i18n的请求实例
 * const customRequest = createRequestInstance({
 *   enableLangHeader: true,
 *   enableI18nError: true,
 *   noErrorMsgCodes: [20007009, 20005001]
 * });
 *
 * // 使用实例
 * const { request, fetch } = customRequest;
 * ```
 */
export function createRequestInstance(
  config: RequestConfig = {}
): RequestInstance {
  const {
    showErrorMessage = true,
    noErrorMsgCodes = [],
    enableLangHeader = false,
    enableI18nError = false
  } = config;

  const request = createRequest()
    .useRequest((reqConfig) => {
      // 添加语言头
      if (enableLangHeader) {
        const lang = getLang();
        reqConfig.headers.Lang = lang;
      }
      return reqConfig;
    })
    .useRequest(reportInterceptors.request)
    .useResponse(reportInterceptors.response, reportInterceptors.error)
    .useRequest(apiInterceptors.request)
    .useResponse(apiInterceptors.response, apiInterceptors.error);

  // 错误处理拦截器
  request.useResponse(null, (err) => {
    const code = err.code;
    const reqConfig = err.config || {}; // 确保 reqConfig 存在

    // i18n错误处理
    if (enableI18nError) {
      const tmsMsg = getGlobalLocaleMsg();
      const i18nMsg = tmsMsg[code];

      if (err.network_error) {
        // 跨域、403等网络错误
        err.message = tmsMsg['network'] || '网络错误';
      } else if (i18nMsg) {
        // 匹配到TMS的Code
        err.message = `${code}:${i18nMsg}`;
      }
    }

    // 显示错误消息
    // 请求级别配置(reqConfig.showErrorMessage)优先于实例级别配置(showErrorMessage)
    const shouldShowError =
      reqConfig.showErrorMessage !== undefined
        ? reqConfig.showErrorMessage
        : showErrorMessage;

    if (
      shouldShowError &&
      !isUnLogin(code) &&
      !noErrorMsgCodes.includes(code) &&
      !err.network_error
    ) {
      message.error(err.message);
    }

    return Promise.reject(err);
  });

  return {
    request,
    fetch: request, // 兼容性导出
    isUnLogin
  };
}

/**
 * 判断是否为未登录错误码
 *
 * 检查给定的错误码是否为未登录相关的错误码
 *
 * @param code 错误码
 * @returns 是否为未登录错误
 *
 */
export function isUnLogin(code: number): boolean {
  return code === 26200007 || code === 26200011;
}

// ==================== 预配置的请求实例 ====================

/**
 * 默认请求实例
 *
 * 基础配置，无特殊错误码过滤，无语言头，无i18n错误处理
 * 适用于：home-page, fiat, voucher-landing, reward-landing, invites
 */
const defaultRequestInstance = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [],
  enableLangHeader: false,
  enableI18nError: false
});

export const request = defaultRequestInstance.request;
export const fetch = defaultRequestInstance.fetch;

/**
 * 带语言头的请求实例
 *
 * 自动添加 Lang 请求头，其他配置与默认实例相同
 */
export const requestWithLang = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [],
  enableLangHeader: true,
  enableI18nError: false
});

/**
 * 带i18n错误处理的请求实例
 *
 * 自动添加 Lang 请求头，启用 i18n 错误消息处理
 */
export const requestWithI18n = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [],
  enableLangHeader: true,
  enableI18nError: true
});

/**
 * 登录相关请求实例
 *
 * 语言头 + i18n + 过滤登录相关错误码
 * 适用于：user-login, partner-program, rewards-hub
 *
 */
export const loginRequest = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [20007009, 20007004, 20005001, 20000103, 20007010, 20005011],
  enableLangHeader: true,
  enableI18nError: true
});

/**
 * 设置相关请求实例
 *
 * 语言头 + i18n + 过滤设置相关错误码
 * 适用于：setting
 *
 * 错误码说明：
 * - 20007009: 重置密码验证码错误（邮箱）
 * - 20007004: 重置密码验证码错误（手机）
 * - 20005001: 重置密码验证码错误（GA）
 */
export const settingRequest = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [],
  enableLangHeader: true,
  enableI18nError: true
});

/**
 * loginAffiliate相关请求实例
 *
 * 无语言头 + i18n + 过滤登录联盟相关错误码
 * 适用于：login-affiliate
 *
 */
export const loginAffiliateRequest = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [20007009, 20007004, 20005001, 20000103, 20007010],
  enableLangHeader: false,
  enableI18nError: true
});

export default {
  createRequestInstance,
  isUnLogin,
  request,
  fetch,
  requestWithLang,
  requestWithI18n,
  loginRequest,
  settingRequest,
  loginAffiliateRequest
};
