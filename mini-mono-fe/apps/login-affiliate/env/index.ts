import { Env, urlInfo } from '@region-lib/env';

const { env } = urlInfo;

export const isBrowser = typeof window !== 'undefined';

export const isTestnet = isBrowser ? env === 'testnet' : false;
export const isProd = isBrowser ? env === 'prod' : false;
export const isDev = isBrowser ? env === 'test' : false;

export const host = Env?.HOST;

export const basePath = `${process.env.BASE_PATH}`;
export const staticPath = '/static/asset';

export const referralLinkPath = '/signUp?inviteCode=';
