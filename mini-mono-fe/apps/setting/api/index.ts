// @ts-nocheck
import { Env, urlInfo } from '@region-lib/env';
import { settingRequest, requestWithI18n } from '@better-bit-fe/base-utils';
const { fetch } = settingRequest;
import {
  IResOpenApiItem,
  IResOpenApiCreate,
  IResOpenApiDetail,
  IUserProfile,
  IbindTypes,
  INotificationSettingsResponse
} from '~/types';
import { encryptLong } from '@better-bit-fe/base-utils';
import type { PasskeyRegisterRequest } from '~/types/passkey';

const { API_HOST } = Env;

const URL = {
  emailCodeSend: `${API_HOST}/user/private/v3/email-code-send`,
  emailBind: `${API_HOST}/user/private/v3/bind-email`,
  // 手机号
  phoneCodeSend: `${API_HOST}/user/private/v3/code-send`,
  phoneBind: `${API_HOST}/user/private/v3/bind-mobile`,
  currentCountryCode: `${API_HOST}/user/public/v3/country-code`,
  countryList: `${API_HOST}/user/public/v3/country-list`,
  countryListFilteredByIp: `${API_HOST}/user/public/v1/country-list`, // 会过滤ip限制的国家
  get2fa: `${API_HOST}/user/private/v3/get-twofa`,
  bind2fa: `${API_HOST}/user/private/v3/bind-2fa`,
  getSignMessage: `${API_HOST}/user/public/v3/verify-message`,
  verifySignMessage: `${API_HOST}/user/private/v3/verify-signature-base64`,
  emailCodeVerify: `${API_HOST}/user/private/v3/email-code-verify`,
  unbind2fa: `${API_HOST}/user/private/v3/unbind-2fa`,
  bindTg: `${API_HOST}/user/private/v3/bind-tg`,
  unBindTg: `${API_HOST}/user/private/v3/unbind-tg`,
  profileUpdate: `${API_HOST}/user/private/v3/profile-update`,
  symbolList: `${API_HOST}/trade/public/v1/market/dynamic_symbol`,

  // api management
  createOpenApiKey: `${API_HOST}/user/private/v3/openapi/key-save`,
  openApiKeyList: `${API_HOST}/user/private/v3/openapi/keys`,
  openApiKeyDetail: `${API_HOST}/user/private/v3/openapi/key`,
  deleteOpenApiKey: `${API_HOST}/user/private/v3/openapi/key-del`,
  getOpenApiKeyBase: `${API_HOST}/user/private/v3/openapi/key-base`,

  // setting
  checkConfirm: `${API_HOST}/user/private/v3/double-confirm-save`,
  currencyConfig: `${API_HOST}/user/private/v3/currencies-config`,
  userProfile: `${API_HOST}/user/private/v3/profile`, // 获取用户信息
  exchangeRate: `${API_HOST}/asset/fiat/public/v1/exchange-rate`,
  vipLevel: `${API_HOST}/user/private/v3/preference/get`,
  supportVipLevel: `${API_HOST}/user/private/v3/config`,

  // otpBind
  multiBind: `${API_HOST}/user/private/v3/multi-validate-bind`,
  multiUnbind: `${API_HOST}/user/private/v3/multi-validate-unbind`, //解绑 手机号|邮箱|2fa
  multiCode: `${API_HOST}/user/private/v3/multi-validate-code`,
  phoneCodeVerify: `${API_HOST}/user/private/v3/mobile-code-verify`,

  getEmail: `${API_HOST}/user/private/v3/profile-sec?from=1&action=1`,
  userCertifications: `${API_HOST}/user/private/v3/user-certifications`, //  根据邮箱或手机号获取用户认证信息
  resetPwd: `${API_HOST}/user/private/v3/reset-password`, // 重置密码
  resetVertifyCode: `${API_HOST}/user/public/v3/code-send`, // 重置密码获取验证码

  // notification
  getNotificationSetting: `${API_HOST}/notification/private/v2/get-notification-setting`,
  updateNotificationSetting: `${API_HOST}/notification/private/v2/set-notification-setting`,

  // tradingview signal
  tradingViewSignal: `${API_HOST}/trade/private/v1/tradingview/webhook/config`,
  postEnableTradingViewSignal: `${API_HOST}/trade/private/v1/tradingview/webhook/enable`,
  postDisableTradingViewSignal: `${API_HOST}/trade/private/v1/tradingview/webhook/disable`,

  getUserInvite: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
  getCouponCount: `${API_HOST}/rewards/private/v1/coupon/status-count`,

  // passkey
  passkeySupportConfig: `${API_HOST}/user/public/v1/passkey/support-config`,
  passkeyList: `${API_HOST}/user/private/v1/passkey/list`,
  passkeyRegisterOptions: `${API_HOST}/user/private/v1/passkey/register/options`,
  passkeyRegister: `${API_HOST}/user/private/v3/passkey/register`,
  passkeyEdit: `${API_HOST}/user/private/v1/passkey/edit`,
  passkeyDelete: `${API_HOST}/user/private/v1/passkey/delete`,
  passkeySceneConfig: `${API_HOST}/user/private/v1/passkey/scene-config`,
  passkeyVerifyOptions: `${API_HOST}/user/private/v1/passkey/verify/options`,
  passkeyVerifyFinish: `${API_HOST}/user/private/v1/passkey/verify/finish`
};

export const getTradingViewSignalConfig = () => {
  return fetch({
    url: URL.tradingViewSignal,
    method: 'GET'
  });
};

export const postEnableTradingViewSignal = () => {
  return fetch({
    url: URL.postEnableTradingViewSignal,
    method: 'POST'
  });
};

export const postDisableTradingViewSignal = () => {
  return fetch({
    url: URL.postDisableTradingViewSignal,
    method: 'POST'
  });
};

export const fetchEmail = () => {
  return fetch({
    url: URL.getEmail,
    method: 'GET'
  });
};

export const postResetVertifyCode = async (params) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.resetVertifyCode,
    method: 'POST',
    data
  });
};

export const postResetPwd = async (params) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.resetPwd,
    method: 'POST',
    data
  });
};

export const postUserCertifications = async (params = {}) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.userCertifications,
    method: 'POST',
    data
  });
};

export const postMobileCodeVerify = (data: {
  country_code: string;
  area_code: string;
  mobile: string;
  mobile_code: string;
  code_type: 'bind_opt_scenes';
}) => {
  return fetch({
    url: URL.phoneCodeVerify,
    method: 'POST',
    data
  });
};

export const postMultiBind = async (params: IbindTypes) => {
  const data = await encryptLong(JSON.stringify(params));
  return requestWithI18n.fetch({
    url: URL.multiBind,
    method: 'POST',
    data
  });
};

export const postMultiUnbind = async (params: IbindTypes) => {
  const data = await encryptLong(JSON.stringify(params));
  return requestWithI18n.fetch({
    url: URL.multiUnbind,
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

export const postFetchSymbolList = (data) => {
  return fetch({
    url: URL.symbolList,
    method: 'GET',
    data
  });
};

export const postPhoneCodeSend = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.phoneCodeSend,
    method: 'POST',
    data
  });
};

export const postBindPhone = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.phoneBind,
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

export const postBindEmail = (params) => {
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.emailBind,
    method: 'POST',
    data
  });
};

export const postGet2fa = (data: {
  type: 1 | 2; //1-email, 2-wallet Sign
}) => {
  return fetch({
    url: URL.get2fa,
    method: 'POST',
    data
  });
};

export const postBind2fa = (data: {
  code: string;
  secret: string;
  code_type?: 'bind_opt_scenes';
}) => {
  return fetch({
    url: URL.bind2fa,
    method: 'POST',
    data
  });
};

export const postGetSignMessage = (data: { address: string }) => {
  return fetch({
    url: URL.getSignMessage,
    method: 'POST',
    data
  });
};

export const postVerifySignMessage = (data: {
  type: 1 | 2;
  wallet_name: string;
  wallet_address: string;
  message: string;
  signature: string;
}) => {
  return fetch({
    url: URL.verifySignMessage,
    method: 'POST',
    data
  });
};
export const postEmailCodeVerify = (data: {
  email_type: number;
  email_code: string;
}) => {
  return fetch({
    url: URL.emailCodeVerify,
    method: 'POST',
    data
  });
};
export const postUnbind2fa = (data: {
  email_code?: string;
  mobile_code?: string;
  code: string;
}) => {
  return fetch({
    url: URL.unbind2fa,
    method: 'POST',
    data
  });
};
export const postBindTg = (data: {
  hash?: string;
  auth_date?: number;
  id?: number;
  first_name?: string;
  last_name?: number;
  username?: number;
  photo_url?: number;
}) => {
  return fetch({
    url: URL.bindTg,
    method: 'POST',
    data
  });
};
export const postUnBindTg = (data) => {
  return fetch({
    url: URL.unBindTg,
    method: 'POST',
    data
  });
};
export const postProfileUpdate = (data: {
  nick_name?: string;
  address?: string;
  avatar?: string;
}) => {
  return fetch({
    url: URL.profileUpdate,
    method: 'POST',
    data
  });
};

// api management

export const postCreateOpenApiKey = (data: {
  name: string; // API 名称
  permission_type: 'rw' | 'r'; // rw: 读写权限, r: 只读权限
  futures_order?: boolean; // 合约订单权限
  futures_position?: boolean; // 合约持仓权限
  spot_trade?: boolean; // 现货交易权限
  asset_transfer?: boolean; // 资产划转权限
  ips: Array<string>; // IP 白名单，['*'] 表示不限制
  email_code?: string; // 邮箱验证码
  mobile_code?: string; // 短信验证码
  '2fa_code'?: string; // 2FA 验证码
}) => {
  return requestWithI18n.fetch<IResOpenApiCreate>({
    url: URL.createOpenApiKey,
    method: 'POST',
    data
  });
};

export const getOpenApiKeyList = () => {
  return requestWithI18n.fetch<IResOpenApiItem[]>({
    url: URL.openApiKeyList,
    method: 'GET'
  });
};

export const postDelOpenApiKey = (data: {
  id: number;
  email_code?: string;
  mobile_code?: string;
  '2fa_code'?: string;
}) => {
  return requestWithI18n.fetch({
    url: URL.deleteOpenApiKey,
    method: 'POST',
    data
  });
};

export const getOpenApiKeyDetail = (data: {
  id: number;
  email_code: string; // 必须参数
  mobile_code?: string;
  '2fa_code'?: string;
}) => {
  return requestWithI18n.fetch<IResOpenApiDetail>({
    url: URL.openApiKeyDetail,
    method: 'POST',
    data
  });
};

export const checkConfirm = (data: string[]) => {
  return fetch({
    url: URL.checkConfirm,
    method: 'POST',
    data: { confirms: data }
  });
};

export const currencyConfig = (param: string) => {
  return fetch({
    url: URL.currencyConfig,
    method: 'POST',
    data: { currency_code: param }
  });
};

export const getUserProfile = () => {
  return fetch<IUserProfile>({
    url: `${URL.userProfile}?t=${Date.now()}`,
    method: 'GET'
  });
};

export const toUpdateUserPreferences = (params) => {
  return fetch({
    url: `${API_HOST}/user/private/v3/preference/set`,
    method: 'POST',
    data: {
      upsert_keys: { ...params }
    }
  });
};

export const toGetUserPreferences = (params) => {
  return fetch({
    url: `${API_HOST}/user/private/v3/preference/get`,
    method: 'POST',
    data: {
      preference_keys: params
    }
  });
};

export const setWalletSetting = (data) => {
  return fetch({
    url: `${API_HOST}/asset/fund/private/v1/wallet/deposit-wallet-new-set`,
    method: 'POST',
    data: { ...data }
  });
};

export const getWalletSetting = () => {
  return fetch({
    url: `${API_HOST}/asset/fund/private/v1/wallet/deposit-wallet-new-query`,
    method: 'GET'
  });
};

export const getExchangeRate = () => {
  return fetch({
    url: URL.exchangeRate,
    method: 'GET'
  });
};

export const getSupportVipLevel = () => {
  return fetch({
    url: URL.supportVipLevel,
    method: 'GET'
  });
};

// kyc资料上传
export const uploadKycFile = (data) => {
  return fetch({
    url: `${API_HOST}/user/private/v3/upload-kyc-file`,
    method: 'POST',
    data: { ...data }
  });
};

//提交kyc信息
export const submitKycInfo = (data) => {
  return fetch({
    url: `${API_HOST}/user/private/v3/kyc-apply`,
    method: 'POST',
    data: { ...data }
  });
};
export const getKycImg = (data) => {
  return fetch({
    url: `${API_HOST}/user/private/v3/kyc-file-data`,
    method: 'POST',
    data: { ...data }
  });
};
export const getKycInfo = (data) => {
  return fetch({
    url: `${API_HOST}/user/private/v3/kyc-info`,
    method: 'GET',
    data: { ...data }
  });
};

export const getOpenApiKeyBase = (params: { id: number }) => {
  return requestWithI18n.fetch({
    url: URL.getOpenApiKeyBase,
    method: 'GET',
    params
  });
};

export const getVerifyQueue = (params: { scene: string }) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/user/private/v4/2fa/verify`,
    method: 'GET',
    params
  });
};

export const getNotificationSettings = () => {
  return fetch<INotificationSettingsResponse>({
    url: URL.getNotificationSetting,
    method: 'GET'
  });
};

export const updateNotificationSetting = (data: {
  notification_type: string;
  notification_switch: boolean;
}) => {
  return fetch({
    url: URL.updateNotificationSetting,
    method: 'POST',
    data
  });
};

export const getUserInviteInfo = () => {
  return fetch({
    url: URL.getUserInvite,
    method: 'GET'
  });
};

export const getCouponCount = () => {
  return fetch({
    url: URL.getCouponCount,
    method: 'GET'
  });
};

// ─── Passkey ───

export const getPasskeySupportConfig = () => {
  return fetch({
    url: URL.passkeySupportConfig,
    method: 'GET'
  });
};

export const getPasskeyList = () => {
  return fetch({
    url: URL.passkeyList,
    method: 'GET'
  });
};

export const postPasskeyRegisterOptions = async (params) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyRegisterOptions,
    method: 'POST',
    data
  });
};

export const postPasskeyRegister = async (params: PasskeyRegisterRequest) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyRegister,
    method: 'POST',
    data
  });
};

export const postPasskeyEdit = (params: { passkey_id: number; name: string }) => {
  return fetch({
    url: URL.passkeyEdit,
    method: 'POST',
    data: params
  });
};

export const postPasskeyDelete = async (params: {
  passkey_id: number;
  email_code?: string;
  mobile_code?: string;
  twofa_code?: string;
}) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyDelete,
    method: 'POST',
    data
  });
};

const PASSKEY_VERIFY_TIMEOUT_MS = 15000;

export const getPasskeySceneConfig = (scene: string) => {
  return fetch({
    url: URL.passkeySceneConfig,
    method: 'GET',
    params: { scene }
  });
};

export const postPasskeyVerifyOptions = async (params: {
  scene: string;
  amount?: string;
  currency?: string;
}) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyVerifyOptions,
    method: 'POST',
    data,
    timeout: PASSKEY_VERIFY_TIMEOUT_MS
  });
};

export const postPasskeyVerifyFinish = async (params: {
  scene: string;
  challenge_id: string;
  credential_id: string;
  client_data_json: string;
  authenticator_data: string;
  signature: string;
}) => {
  const data = await encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.passkeyVerifyFinish,
    method: 'POST',
    data,
    timeout: PASSKEY_VERIFY_TIMEOUT_MS
  });
};
