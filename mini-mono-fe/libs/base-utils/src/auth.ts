import Cookie from 'js-cookie';
import { isApp } from './browser';
import { isProduction, isTestnet, pipelineEnv, isDev } from './config';

export const authTokenName = isProduction
  ? 'b_t_c_k'
  : isTestnet
  ? 'b_t_c_k_testnet'
  : `b_t_c_k_${pipelineEnv}`;

export function setCookies(token: string) {
  const hostname = process.browser ? window.location.hostname : '';
  const cookieDomain = isDev
    ? 'localhost'
    : hostname.replace(/^www|m|testnet/, '');
  console.log('lib utils setCookie:', authTokenName, token, cookieDomain);
  Cookie.set(authTokenName, token, {
    expires: 7,
    path: '/',
    domain: cookieDomain
  });
}

/**
 * 获取用户存储在cookie内的token信息
 * @returns
 */
export function getUserToken(): string | undefined {
  // Clean wrong cookie in app
  if (isApp()) {
    Cookie.remove(authTokenName, {
      path: '/',
      domain: `.${window.location.host}`
    });
    Cookie.remove(authTokenName, {
      path: '/',
      domain: `${window.location.host}`
    });
  }
  return Cookie.get(authTokenName);
}

export const guidName = '_by_l_g_d';
export const guidNameNew = '_mf_guid';

export function getGuid(): string | undefined {
  return Cookie.get(guidName) || Cookie.get(guidNameNew);
}
