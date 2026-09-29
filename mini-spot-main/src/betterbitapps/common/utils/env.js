import { urlInfo } from '@region-lib/env';
import { getLang } from './storageData';

console.log('urlInfo.env', urlInfo.env);
const { hostname } = window.location;
export const isProd = /^[^.]+\.[^.]+\.[^.]+$/.test(hostname);
export const isTestnet = /[^.]+\.testnet\./.test(hostname);
export const isTest = !isTestnet && !isProd;
export const isDev = isTest;


export const TMS_HOST = '';
export const TMS_PATH = '/static/locale/{{lng}}/{{ns}}.json';
export const TMS_FULL_PATH = `${TMS_HOST}${TMS_PATH}`;

export const isDex = process.env.MARVEL_APP_PLATFORM === 'dex';
