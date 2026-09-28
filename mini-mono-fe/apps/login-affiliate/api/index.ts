// @ts-nocheck
import { Env, urlInfo } from '@region-lib/env';
import { loginAffiliateRequest } from '@better-bit-fe/base-utils';
const { fetch } = loginAffiliateRequest;
import { EmailCodeType } from '~/constants';
import jsrsasign from 'jsrsasign';

const { API_HOST } = Env;
const { env } = urlInfo;

const envConfig = require(`~/env/publickey.js`);
const key = envConfig[`publicKeyPEM-${env}`];

const URL = {
  emailBind: `${API_HOST}/user/private/v3/bind-email`,
  loginTg: `${API_HOST}/user/public/v3/login-tg`,
  emailLogin: `${API_HOST}/user/public/v3/login-email`,
  botId: `${API_HOST}/user/public/v3/tg-map`,
  profileUpdate: `${API_HOST}/user/private/v3/profile-update`,
  getAffiliateUrl: `${API_HOST}/aff_boot/affiliate_api/private/v3/status`,
  getDomainWhiteList: `${API_HOST}/user/public/v3/trust-domain`,
  currentCountryCode: `${API_HOST}/user/public/v3/country-code`,
  countryList: `${API_HOST}/user/public/v3/country-list`,
  loginMobile: `${API_HOST}/user/public/v3/login-mobile`,
  registerMobile: `${API_HOST}/user/public/v3/register-mobile`,
  registerEmail: `${API_HOST}/user/public/v3/register-email`,
  withPwdLogin: `${API_HOST}/user/public/v3/login` // 密码登录，需要加密传输
};

const encryptLong = (string) => {
  const pub = jsrsasign.KEYUTIL.getKey(key);
  const k = jsrsasign.KJUR.crypto.Cipher;
  try {
    const len = string.length;
    var encryptedRes = ''; // 结果
    const bytes = new Array(); // 存储每一次截取的位置,因为RSA每次加密117bytes
    bytes.push(0);
    var byteNo = 0;
    let sixteenCode; // 字符串转为十六进制的code
    var temp = 0;
    for (var i = 0; i < len; i++) {
      sixteenCode = string.charCodeAt(i);
      if (sixteenCode >= 0x010000 && sixteenCode <= 0x10ffff) {
        byteNo += 4;
      } else if (sixteenCode >= 0x000800 && sixteenCode <= 0x00ffff) {
        byteNo += 3;
      } else if (sixteenCode >= 0x000080 && sixteenCode <= 0x0007ff) {
        byteNo += 2;
      } else {
        byteNo += 1;
      }
      if (byteNo % 117 >= 114 || byteNo % 117 == 0) {
        if (byteNo - temp >= 114) {
          bytes.push(i);
          temp = byteNo;
        }
      }
    }
    // console.log('最后的字节数', bytes, '总的字符串', string);
    //2.截取字符串并分段加密
    if (bytes.length > 1) {
      for (var i = 0; i < bytes.length - 1; i++) {
        var str; // 每一次加密的字符串
        if (i == 0) {
          str = string.substring(0, bytes[i + 1] + 1);
        } else {
          str = string.substring(bytes[i] + 1, bytes[i + 1] + 1);
        }
        var t1 = k.encrypt(str, pub, 'RSAOAEP256');
        encryptedRes += t1;
      }
      // 最后一段加密
      if (bytes[bytes.length - 1] != string.length - 1) {
        var lastStr = string.substring(bytes[bytes.length - 1] + 1);
        encryptedRes += k.encrypt(lastStr, pub, 'RSAOAEP256');
      }
      const base64Str = jsrsasign.hextob64(encryptedRes);
      return {
        data: base64Str
      };
    }
    const enc = jsrsasign.KJUR.crypto.Cipher.encrypt(string, pub, 'RSAOAEP256');
    const base64Str = jsrsasign.hextob64(enc);
    return {
      data: base64Str
    };
  } catch (ex) {
    return false;
  }
};

export const postWithPwdLogin = async (params) => {
  console.log('传参', params);
  const data = encryptLong(JSON.stringify(params));
  return fetch({
    url: URL.withPwdLogin,
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
  code_type?: string;
}) => {
  return fetch({
    url: URL.emailLogin,
    method: 'POST',
    data: { ...data, code_type: 'login_affiliate', site_type: 'agent' }
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
    data: { ...data, code_type: 'login_affiliate', site_type: 'agent' }
  });
};

export const getCountryList = (params?) => {
  return fetch({
    url: URL.countryList,
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
