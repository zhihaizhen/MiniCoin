// @ts-nocheck
import { Env, urlInfo } from '@region-lib/env';
import { loginRequest } from '@better-bit-fe/base-utils';
const { fetch } = loginRequest;
import { EmailCodeType } from '~/constants';
import { encryptLong, isMobile } from '@better-bit-fe/base-utils';
import type {
  PasskeyLoginOptionsRequest,
  PasskeyLoginOptionsResponse,
  PasskeyLoginRequest,
  PasskeyLoginResponse
} from '~/types/passkey';

const { API_HOST } = Env;

const URL = {
  // 新增三个接口 用于密码登录后的验证 2024-08-05
  passwordAuth: `${API_HOST}/user/public/v3/password-auth`,
  emailCodeSendByUserId: `${API_HOST}/user/public/v3/email-code-send`,
  phoneCodeSendByUserId: `${API_HOST}/user/public/v3/code-send`,

  passwordAuthCodeSend: `${API_HOST}/user/public/v3/password-auth-code-send`,
  passwordAuthLogin: `${API_HOST}/user/public/v3/password-auth-login`,

  emailCodeSend: `${API_HOST}/user/public/v3/email-code-send`,
  bindEmailCodeSend: `${API_HOST}/user/private/v3/email-code-send`,
  emailBind: `${API_HOST}/user/private/v3/bind-email`,
  loginTg: `${API_HOST}/user/public/v3/login-tg`,
  emailLogin: `${API_HOST}/user/public/v3/login-email`,
  botId: `${API_HOST}/user/public/v3/tg-map`,
  profileUpdate: `${API_HOST}/user/private/v3/profile-update`,
  getAffiliateUrl: `${API_HOST}/aff_boot/affiliate_api/private/v1/status`,

  getDomainWhiteList: `${API_HOST}/user/public/v3/trust-domain`,
  currentCountryCode: `${API_HOST}/user/public/v3/country-code`,
  countryList: `${API_HOST}/user/public/v3/country-list`,
  countryListFilteredByIp: `${API_HOST}/user/public/v1/country-list`, // 会过滤ip限制的国家
  phoneCodeSend: `${API_HOST}/user/public/v3/code-send`,
  loginMobile: `${API_HOST}/user/public/v3/login-mobile`,
  registerMobile: `${API_HOST}/user/public/v3/register-mobile`,
  registerEmail: `${API_HOST}/user/public/v3/register-email`,
  oauthLogin: `${API_HOST}/user/public/v3/login-oauth2`, // oauth登录
  oauthBind: `${API_HOST}/user/private/v3/bind-oauth2`, // oauth绑定, 绑定现有账号
  bindInviteCode: `${API_HOST}/user/private/v3/bind-referral-code`, // Bind Invite Code
  unbind2fa: `${API_HOST}/user/public/v3/unbind-2fa`, // 解绑2FA

  getBannerDetail: `${API_HOST}/commom-public/index/public/v1/get-banner-detail`, //注册页 根据邀请码获取代理商banner图

  // 以下接口需要加密传输
  userCertifications: `${API_HOST}/user/public/v3/user-certifications`, //  根据邮箱或手机号获取用户认证信息
  resetPwd: `${API_HOST}/user/public/v3/reset-password`, // 重置密码
  resetVertifyCode: `${API_HOST}/user/public/v3/code-send`, // 重置密码获取验证码
  resetVertifyCodeMulti: `${API_HOST}/user/public/v3/multi-code-send`, // 通过邮箱获取手机号的验证码
  withPwdRegister: `${API_HOST}/user/public/v3/register`, // 密码注册
  withPwdLogin: `${API_HOST}/user/public/v3/login`, // 密码注册
  noPwdLogin: `${API_HOST}/user/public/v3/nopass-login`, // 免密登录

  //二维码登录
  loginQrCode: `${API_HOST}/user/public/v3/login-qrcode`,
  loginQrCodeCheck: `${API_HOST}/user/public/v3/login-qrcode-check`,

  banAreaCheck: `${API_HOST}/user/public/v1/ban-area/check`,
  logoutWeb2: `${API_HOST}/user/private/v3/logout-web2`,
  authorize: `${API_HOST}/user/public/v1/oauth2/authorize`,
  authorizeConfirm: `${API_HOST}/user/private/v1/oauth2/authorize-confirm`,

  // Passkey 登录相关接口
  passkeyLoginOptions: `${API_HOST}/user/public/v1/passkey/login/options`,
  passkeyLogin: `${API_HOST}/user/public/v1/passkey/login`
};

export const getAuthorize = (params) => {
  return fetch({
    url: URL.authorize,
    method: 'GET',
    params
  });
};

export const postAuthorizeConfirm = (data: { request_id: string }) => {
  return fetch({
    url: URL.authorizeConfirm,
    method: 'POST',
    data
  });
};

export const logout = () => {
  return fetch({
    url: URL.logoutWeb2 + '?t=' + new Date().getTime(),
    data: {
      platform: isMobile() ? 'h5' : 'pcweb'
    },
    method: 'POST',
    showErrorMessage: false
  });
};

export const postBindInviteCode = (data: {
  invite_code?: string; // 推荐码
}) => {
  return fetch({
    url: URL.bindInviteCode,
    method: 'POST',
    data
  });
};
export const getBannerDetail = (code) => {
  return fetch({
    url: `${URL.getBannerDetail}?code=${code}`,
    method: 'GET',
    showErrorMessage: false
  });
};
export const postOauthLogin = (data: {
  type: 'google' | 'apple' | string; // 第三方登录类型
  access_code: string; // authorization code
  id_token?: string; // Apple ID 特有的 id_token
  referral_code?: string; // 推荐码
}) => {
  return fetch({
    url: URL.oauthLogin,
    method: 'POST',
    data
  });
};

// 绑定现有账号
export const postBindAccount = (data: {
  type: 'email' | 'phone'; // 登录类型，email 或 phone
  password: string; // 密码，加密串
  email?: string; // 邮箱登录必填
  // 以下是手机号登录使用字段
  country_code?: string;
  area_code?: string;
  mobile?: string;
}) => {
  const encryptedData = encryptLong(JSON.stringify(data));
  return fetch({
    url: URL.oauthBind,
    method: 'POST',
    data: encryptedData
  });
};

export const postPwdAuth = (data: {
  type: 'email' | 'phone'; //注册类型，email 或 phone
  password: string; //密码，加密串
  email?: string; //邮箱注册必填
  //以下是手机号登陆使用字段
  country_code?: string;
  area_code?: string;
  mobile?: string;
}) => {
  const encryptedData = encryptLong(JSON.stringify(data));
  return fetch({
    url: URL.passwordAuth,
    method: 'POST',
    data: encryptedData
  });
};

export const postPwdAuthCodeSend = (data: {
  type: 'email' | 'phone'; //注册类型，email 或 phone
  email?: string; //邮箱注册必填
  //以下是手机号登陆使用字段
  country_code?: string;
  area_code?: string;
  mobile?: string;
  geetest_challenge: string;
  geetest_validate: string;
  geetest_seccode: string;
  captcha_type: 'geetest';
}) => {
  data.captcha_type = 'geetest';
  const encryptedData = encryptLong(JSON.stringify(data));
  return fetch({
    url: URL.passwordAuthCodeSend,
    method: 'POST',
    data: encryptedData
  });
};

export const postPwdAuthLogin = (
  data: {
    type: 'email' | 'phone'; //注册类型，email 或 phone
    code: string; // 第二步验证 code string
    email?: string; // 邮箱注册必填
    //以下是手机号登陆使用字段
    country_code?: string;
    area_code?: string;
    mobile?: string;
  },
  headers?: Record<string, string>
) => {
  const encryptedData = encryptLong(JSON.stringify(data));
  return fetch({
    url: URL.passwordAuthLogin,
    method: 'POST',
    data: encryptedData,
    ...(headers && { headers })
  });
};

export const postWithPwdLogin = async (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.withPwdLogin,
    method: 'POST',
    data
  });
};

export const postWithPwdRegister = (
  params,
  headers?: Record<string, string>
) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.withPwdRegister,
    method: 'POST',
    data,
    ...(headers && { headers })
  });
};

export const postNoPwdLogin = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.noPwdLogin,
    method: 'POST',
    data
  });
};

export const postResetVertifyCode = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.resetVertifyCode,
    method: 'POST',
    data
  });
};

export const postResetVertifyCodeMulti = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.resetVertifyCodeMulti,
    method: 'POST',
    data
  });
};

export const postResetPwd = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.resetPwd,
    method: 'POST',
    data
  });
};

export const postUserCertifications = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.userCertifications,
    method: 'POST',
    data
  });
};

export const getAffiliateUrl = (data) => {
  return fetch({
    url: URL.getAffiliateUrl,
    method: 'GET',
    data,
    showErrorMessage: false
  });
};

export const postTgLogin = (data) => {
  return fetch({
    url: URL.loginTg,
    method: 'POST',
    data
  });
};

export const postEmailCodeSend = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.emailCodeSend,
    method: 'POST',
    data
  });
};

export const postEmailCodeSendByUserId = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.emailCodeSendByUserId,
    method: 'POST',
    data
  });
};

export const postBindEmailCodeSend = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.bindEmailCodeSend,
    method: 'POST',
    data
  });
};

export const postBindEmail = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.emailBind,
    method: 'POST',
    data
  });
};

export const postLoginEmail = (data: {
  email: string;
  email_code: string;
  referral_code?: string;
  expire?: number;
}) => {
  return fetch({
    url: URL.emailLogin,
    method: 'POST',
    data
  });
};

export const getBotId = (params) => {
  return fetch({
    url: URL.botId,
    method: 'GET',
    params
  });
};

export const postProfileUpdate = (data: {
  nick_name?: string;
  address?: string;
}) => {
  return fetch({
    url: URL.profileUpdate,
    method: 'POST',
    data
  });
};

export const getDomainWhiteList = () => {
  return fetch({
    url: URL.getDomainWhiteList,
    method: 'GET'
  });
};

export const postLoginMobile = (data: {
  country_code: string;
  area_code: string;
  mobile: string;
  code: string;
  referral_code?: string;
  expire?: number;
}) => {
  return fetch({
    url: URL.loginMobile,
    method: 'POST',
    data
  });
};
export const postCodeSend = (params: {
  captcha_type: string;
  geetest_challenge: string;
  geetest_validate: string;
  geetest_seccode: string;
  email?: string;
  mobile: string;
  code_type: 'login_mobile' | 'login_email' | 'unbind_2fa';
  area_code: string;
}) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.phoneCodeSend,
    method: 'POST',
    data
  });
};

export const postCodeSendByUserId = (params: {
  captcha_type: string;
  geetest_challenge: string;
  geetest_validate: string;
  geetest_seccode: string;
  email?: string;
  mobile: string;
  code_type: 'login_mobile' | 'login_email' | 'unbind_2fa';
  area_code: string;
  user_id: string;
}) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.phoneCodeSendByUserId,
    method: 'POST',
    data
  });
};

export const getCountryList = (params?) => {
  return fetch({
    url: URL.countryList,
    method: 'GET',
    params
  });
};

export const getCountryListFilteredByIp = (params?) => {
  return fetch({
    url: URL.countryListFilteredByIp,
    method: 'GET',
    params
  });
};

export const getCurrentCountryCode = (params?) => {
  return fetch({
    url: URL.currentCountryCode,
    method: 'GET',
    params
  });
};
export const postRegisterEmail = (data: {
  email: string;
  email_code: string;
  referral_code: string;
  expire?: number; // jwt 有效时间，默认 min，仅测试用
}) => {
  return fetch({
    url: URL.registerEmail,
    method: 'POST',
    data
  });
};
export const postRegisterMobile = (data: {
  country_code: string;
  area_code: string;
  mobile: string;
  code: string;
  referral_code?: string;
  expire?: number;
}) => {
  return fetch({
    url: URL.registerMobile,
    method: 'POST',
    data
  });
};

export const postUnbind2fa = (data: {
  user_id: string;
  email_code?: string;
  mobile_code?: string;
}) => {
  return fetch({
    url: URL.unbind2fa,
    method: 'POST',
    data
  });
};

export const getLoginQrCode = () => {
  return fetch({
    url: URL.loginQrCode,
    method: 'GET'
  });
};

export const postLoginQrCodeCheck = (data: { qrcode: string }) => {
  return fetch({
    url: URL.loginQrCodeCheck,
    method: 'POST',
    data,
    showErrorMessage: false
  });
};

export const getBanAreaCheck = () => {
  return fetch({
    url: URL.banAreaCheck,
    method: 'GET',
    showErrorMessage: false
  });
};

export const postPasskeyLoginOptions = (
  params: PasskeyLoginOptionsRequest
): Promise<PasskeyLoginOptionsResponse> => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyLoginOptions,
    method: 'POST',
    data
  });
};

export const postPasskeyLogin = (
  params: PasskeyLoginRequest
): Promise<PasskeyLoginResponse> => {
  console.log('params', params);
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyLogin,
    method: 'POST',
    data
  });
};
