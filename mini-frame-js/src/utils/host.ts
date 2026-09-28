import { Env, urlInfo } from '@region-lib/env'
const { env } = urlInfo
export const HOST = Env?.MAIN_HOST || ''
export const API_HOST = Env?.API_HOST || ''
export const langReg = /([a-z]{2}-[A-Z]{2})/
export const isTest =
  window?.location?.host?.includes('dev') ||
  window?.location?.host?.includes('test-') ||
  window?.location?.host?.includes('localhost') ||
  window?.location?.host?.includes('test.')

export const isTestnet = window?.location?.host?.includes('testnet')
export const isProd = env === 'prod'
export const isDev =
  window?.location?.host?.includes('dev') || window?.location?.host?.includes('localhost')
export const isNoLocaleDomain =
  window?.location?.pathname.startsWith('/trade/') ||
  window?.location?.pathname.startsWith('/spot/exchange')
export const isFixedLocaleDomain =
  window?.location?.pathname.match(/^\/[a-z]{2}-[A-Z]{2}\/trade\/.*/) ||
  window?.location?.pathname.match(/^\/[a-z]{2}-[A-Z]{2}\/spot\/exchange\/.*/)

export const isLocalDomain = window?.location?.pathname?.match(langReg)
