import { camelizeKeys, decamelizeKeys } from 'humps'
import { request, AxiosRequestConfig } from '@/utils/request'
import { Permission } from '@/types/user'
import { API_HOST } from '@/utils/host'
import { isMobile } from '@region-lib/helper'

// const { API_HOST } = Env

async function fetch<T>(options: AxiosRequestConfig, camelize = true) {
  try {
    const response = await request(options)
    const data: T = camelize ? (camelizeKeys(response as any) as any) : response
    return data
  } catch (e) {
    throw camelizeKeys(e)
  }
}

// export function fetchPermissions() {
//   return fetch<Permission>({
//     url: `${API_HOST}/register/permission_v2`
//   })
// }
// /user/public/v3/logout-web2

export function logoutWeb2() {
  return fetch({
    url: `${API_HOST}/user/private/v3/logout-web2?t=` + new Date().getTime(),
    data: decamelizeKeys({
      platform: isMobile() ? 'h5' : 'pcweb'
    }),
    method: 'POST',
    showErrorMessage: false
  })
}

export function logout() {
  return fetch({
    url: `${API_HOST}/user/private/v3/web3/logout-unipass?t=` + new Date().getTime(),
    data: decamelizeKeys({
      platform: isMobile() ? 'h5' : 'pcweb'
    }),
    method: 'POST',
    showErrorMessage: false
  })
}
export function logoutEOA() {
  return fetch({
    url: `${API_HOST}/user/private/v3/web3/eoa/logout?t=` + new Date().getTime(),
    data: decamelizeKeys({
      platform: isMobile() ? 'h5' : 'pcweb'
    }),
    method: 'POST',
    showErrorMessage: false
  })
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

export async function getAffiliateCommissionReturn() {
  return
  const _data = await fetch<{
    is_show: 0 | 1
    is_affiliate: 0 | 1
    is_tip: 0 | 1
  }>({
    url: `${API_HOST}/api/affiliate_api/private/user/rebate/auth?t=` + new Date().getTime()
  })
  return decamelizeKeys(_data as any)
}

export async function getUserConfig() {
  const data = await fetch(
    {
      url: `${API_HOST}/user/private/v3/config`
    },
    false
  )
  return data
}

export async function getPreferenceConfig(data: { preference_keys: string[] }) {
  const res: any = await fetch({
    url: `${API_HOST}/user/private/v3/preference/get`,
    method: 'POST',
    data
  })
  return res
}
