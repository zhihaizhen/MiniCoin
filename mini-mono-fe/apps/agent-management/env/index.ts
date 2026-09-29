import { Env, urlInfo } from '@region-lib/env';

const { env } = urlInfo;

export const isBrowser = typeof window !== 'undefined';

export const isTestnet = isBrowser ? env === 'testnet' : false;
export const isProd = isBrowser ? env === 'prod' : false;
export const isDev = isBrowser ? env === 'test' : false;

export const basePath = `${process.env.BASE_PATH}`;
export const host = Env?.HOST;

export const referralLinkHost = isBrowser
  ? isProd
    ? 'https://www.easicoin.io'
    : isTestnet
    ? ''
    : host
  : '';

export const referralLinkPath = '/signUp?inviteCode=';
