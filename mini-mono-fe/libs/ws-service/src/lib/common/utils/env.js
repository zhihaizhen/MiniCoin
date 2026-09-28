import { urlInfo } from '@region-lib/env';
import { getLang } from './storageData';

console.log('urlInfo.env', urlInfo.env);
let hostname = '';
try {
  hostname = window ? window?.location?.hostname : '';
} catch (error) {
  console.log(error);
}

export const isProd = /^[^.]+\.[^.]+\.[^.]+$/.test(hostname);
export const isTestnet = /[^.]+\.testnet\./.test(hostname);
export const isTest = !isTestnet && !isProd;
export const isDev = isTest;

// 翻译系统
// export const TMS_HOST = isTest
//   ? 'https://tms.ffe390afd658c19dcbf707e0597b846d.de'
//   : '';
// export const TMS_PATH = isTest
//   ? '/download/{{projectId}}/{{ns}}/{{lng}}/'
//   : '/translations/{{lng}}/{{ns}}.json';
export const TMS_HOST = '';
export const TMS_PATH = '/static/locale/{{lng}}/{{ns}}.json';
export const TMS_FULL_PATH = `${TMS_HOST}${TMS_PATH}`;

export const loginUrl = () => `/${getLang()}/login`;
export const registerUrl = () => `/${getLang()}/register`;

export const isDex = process.env.MARVEL_APP_PLATFORM === 'dex';
