import { camelizeKeys, decamelizeKeys } from 'humps'
import { request, AxiosRequestConfig } from '@/utils/request'
import {
  WalletCoin,
  DepositAddress,
  ChainType,
  WithdrawAddress,
  Asset,
  Currency
} from '../types/dex'
// import { API_HOST } from '@/utils/host'
import { cookie, isMobile } from '@region-lib/helper'
import { Env } from '@region-lib/env'
import { checkReferralCode } from '@/utils'

const API_HOST = '/mapi'
const { TOKEN_KEY, COOKIE_DOMAIN } = Env

async function fetch<T>(options: AxiosRequestConfig, camelize = true) {
  try {
    const response = await request(options)
    const data: T = camelize ? (camelizeKeys(response as any) as any) : response
    return data
  } catch (e) {
    throw camelizeKeys(e)
  }
}

export function banAreaCheck() {
  return fetch<{ banned: boolean }>(
    {
      url: `${API_HOST}/user/public/v3/ban-area/check`,
      method: 'POST'
    },
    false
  )
}

export async function getUserInfo() {
  const data = await fetch(
    {
      // url: `${API_HOST}/v2/private/user/profile`
      url: `${API_HOST}/user/private/v3/profile?t=` + new Date().getTime()
    },
    false
  )
  return {
    data: camelizeKeys(data as any),
    originData: data
  }
}

export async function updateProfile(data: { language: string }) {
  return fetch<{
    language: string
  }>({
    url: `${API_HOST}/user/private/v3/profile-update`,
    method: 'POST',
    data
  })
}
export async function getVip3() {
  return fetch<{
    vip3IsOn: boolean
    feeRateMaker: string
    feeRateTaker: string
    tsExpiration: number
    tsEffective: number
  }>({
    url: `${API_HOST}/operations/reward/v1/private/vip3/get`,
    method: 'get'
  })
}

export async function existAffliate() {
  return fetch({
    url: `${API_HOST}/aff_boot/affiliate_api/private/v1/status`,
    method: 'get',
    showErrorMessage: false
  })
}

export function login(params: {
  address?: string
  message?: string
  signature?: string
  wallet_name?: string
  referral_code?: string
}) {
  let param = { ...params }
  if (!params.referral_code) {
    const invite_code = checkReferralCode()
    param = invite_code
      ? decamelizeKeys({
          ...params,
          referral_code: invite_code
        })
      : decamelizeKeys({
          ...params
        })
  }
  return fetch<{ userId: number; isNewUser: number }>({
    url: `${API_HOST}/user/public/v3/web3/eoa/login?t=` + new Date().getTime(),
    method: 'POST',
    data: param,
    headers: {
      platform: isMobile() ? 'h5' : 'pcweb'
    },
    showErrorMessage: false
  })
}
export function loginUnipass(params: any) {
  const invite_code = checkReferralCode()
  const param = invite_code
    ? decamelizeKeys({
        ...params,
        referral_code: invite_code
      })
    : decamelizeKeys({
        ...params
      })
  return fetch<{ userId: number; isNewUser: number }>({
    url: `${API_HOST}/user/public/v3/web3/login-unipass?t=` + new Date().getTime(),
    method: 'POST',
    data: decamelizeKeys({
      ...param,
      wallet_name: 'unipass'
    }),
    headers: {
      platform: isMobile() ? 'h5' : 'pcweb'
    },
    showErrorMessage: false
  })
}

export function getSignMessage(data: { address: string }) {
  return fetch<{
    address: string
    message: string
  }>({
    url: `${API_HOST}/user/public/v3/web3/eoa/login-get-message?t=` + new Date().getTime(),
    method: 'POST',
    data
  })
}

export function fetchDepositCoins() {
  return fetch<{
    deposit: WalletCoin[]
    withdraw: WalletCoin[]
  }>({
    url: `${API_HOST}/localsite/private/wallet/wallet-coin`
  })
}

export function fetchDepositAddress(coin: string) {
  return fetch<{
    addresses: DepositAddress[]
    coinCanDeposit: boolean
  }>({
    url: `${API_HOST}/localsite/private/asset/deposit/address`,
    params: { coin },
    showErrorMessage: false // 这个接口错误会有特殊文案，不必弹出
  })
}

export function fetchWithdrawChain(coin: string) {
  return fetch<{
    chainType: ChainType[]
    coin: string
    status: number
  }>({
    url: `${API_HOST}/wallet/withdraw/coin-ls`,
    params: { coin }
  })
}

export function fetchWithdrawAddress(params: { coin: string; chainType: string }) {
  return fetch<{
    data: WithdrawAddress[]
    currnetPage: number
    lastPage: number
  }>({
    url: `${API_HOST}/wallet/address/list-ls`,
    params: decamelizeKeys(params)
  })
}

export function withdraw(params: {
  DestinationTag?: string
  address: string
  chainType: string
  coin: string
  quantity: string
}) {
  return fetch({
    url: `${API_HOST}/wallet/send-new2-ls-x`,
    method: 'POST',
    data: decamelizeKeys(params)
  })
}

export async function getBalance() {
  return fetch({
    url: `${API_HOST}/dex-portal-service/dex/wallet/getBalance`
  })
}

export async function getAssets() {
  const data = await fetch<{ list: { data: Asset; isAvailable: boolean }[] }>({
    // url: `${API_HOST}/v3/private/wallet/list`
    url: `${API_HOST}/trade/private/v1/wallet/list`
  })
  return data.list
}

export async function getCurrencies() {
  return await fetch<Currency[]>({
    // url: `${API_HOST}/api/currencies`
    url: `${API_HOST}/gateway/base/api/currencies`
  })
}

export async function getCurrencyRate(code: string) {
  const data = await fetch<{ rate: number }>({
    // url: `${API_HOST}/api/exchange-rate`,
    url: `${API_HOST}/fiat/public/get-exchange-rate`,
    params: {
      name: code
    }
  })
  return Number(data?.rate)
}

export async function setCurrencyCode(code: string) {
  return fetch<Currency[]>({
    url: `${API_HOST}/user/set-currency-code`,
    method: 'POST',
    data: decamelizeKeys({
      currencyCode: code
    })
  })
}

export async function getInviteCode(address: string) {
  return fetch<string>({
    url: `${API_HOST}/bms/public/v1/dex/invitation/code`,
    params: {
      address
    }
  })
}

export async function getLanguageForUser(language: string) {
  return fetch<string>({
    url: `${API_HOST}/user/public/v3/language-info`,
    params: {
      language
    }
  })
}

export const getExchangeRate = () => {
  return fetch<{ list: { symbol: string; rate: number; fiatSymbol: string }[] }>({
    url: `${API_HOST}/asset/fiat/public/v1/exchange-rate`,
    method: 'GET'
  })
}
