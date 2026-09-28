import { useSyncExternalStore } from 'react'
import { Env } from '@region-lib/env'
import { storage, cookie } from '@region-lib/helper'
import * as dexApi from '@/api/dex'
import * as userApi from '@/api/user'
import { request, isUnLogin } from '@/utils/request'
import { isTest, isNoLocaleDomain, isLocalDomain } from '@/utils/host'
import { useEvent } from './useEvent'
import { useLanguage } from './useLanguage'
import { STORAGE_ADDRESS, STORAGE_KEY, GA_UID, ISNEWUSER, AIRDROPTIPS } from '../constants'
import { langList, isApp } from '@/utils'
import { EventEmitter } from '@/utils/event'

interface UserStorage {
  address: string
  walletName: string
}

type DexUserStoreState = {
  user: any
  profileUser: any
  loginChecked: boolean
}

let dexUserGlobalState: DexUserStoreState = {
  user: undefined,
  profileUser: undefined,
  loginChecked: false
}

const dexUserEmitter = new EventEmitter()

export const dexUserStore = {
  getState: () => dexUserGlobalState,
  setState: (partial: Partial<DexUserStoreState>) => {
    // 单次遍历：只有检测到变化才 clone 并写入，避免无变化更新导致的多余 render
    let nextState: DexUserStoreState = dexUserGlobalState
    for (const k in partial) {
      if (!Object.prototype.hasOwnProperty.call(partial, k)) continue
      const key = k as keyof DexUserStoreState
      const nextVal = partial[key] as DexUserStoreState[typeof key]
      if (Object.is(nextState[key], nextVal)) continue
      if (nextState === dexUserGlobalState) {
        nextState = { ...dexUserGlobalState }
      }
      ;(nextState as DexUserStoreState)[key] = nextVal
    }
    if (nextState === dexUserGlobalState) return
    dexUserGlobalState = nextState
    dexUserEmitter.emit('change')
  },
  subscribe: (listener: () => void) => {
    dexUserEmitter.on('change', listener)
    return () => dexUserEmitter.off('change', listener)
  }
}

function createStoreRef<K extends keyof DexUserStoreState>(key: K) {
  return {
    get value(): DexUserStoreState[K] {
      return dexUserStore.getState()[key]
    },
    set value(next: DexUserStoreState[K]) {
      if (Object.is(dexUserStore.getState()[key], next)) return
      dexUserStore.setState({ [key]: next } as Pick<DexUserStoreState, K>)
    }
  }
}

let state: ReturnType<typeof initState>

const { TOKEN_KEY } = Env

function initState() {
  // const captcha = useCaptcha()
  const { emitLoginChecked, emitLogout, emitUserChange, emitDexInfo } = useEvent()
  const { setLang, getLanguage } = useLanguage()

  const user = createStoreRef('user')
  /**
   * profile接口返回的不经过驼峰转换的user
   * 兼容交易页等项目
   */
  const profileUser = createStoreRef('profileUser')
  const loginChecked = createStoreRef('loginChecked')

  async function getUserInfo() {
    try {
      const res = await dexApi.getUserInfo()
      const { data, originData } = res
      user.value = data
      profileUser.value = originData
      return res
    } catch (error) {
      user.value = false
      profileUser.value = false
    }
  }

  async function checkUrlLang() {
    const curCookieLang = cookie.get('language')
    const curLang = getLanguage()
    const langIndexCookie = langList.findIndex((item) => item.key === curCookieLang)
    const langIndexCurrent = langList.findIndex((item) => item.key === curLang)
    if (langIndexCurrent === -1 && langIndexCookie !== -1 && isNoLocaleDomain) {
      setTimeout(() => {
        setLang(curCookieLang)
      }, 0)
      return
    }
    // for spot trading page and feature page, if lang is not in langList, set to en-US
    if (langIndexCurrent === -1 && langIndexCookie === -1 && isNoLocaleDomain) {
      setTimeout(() => {
        setLang('en-US')
      }, 0)
      return
    }
    if (curLang && curLang !== curCookieLang) {
      if (isNoLocaleDomain) {
        setLang(curLang)
        return
      }
    }
    if (!isNoLocaleDomain && isLocalDomain && !location.pathname?.includes(curLang) && !isApp()) {
      setTimeout(() => {
        setLang(curLang)
      }, 0)
    }
  }

  async function checkLogin() {
    const pass = () => {
      loginChecked.value = true
      handleLoginExpired()
      emitLoginChecked(user.value, profileUser.value)
      emitUserChange(user.value, profileUser.value)
      return true
    }

    const unpass = () => {
      loginChecked.value = false
      clearStorage()
      clearCookie()
      emitLoginChecked()
      emitUserChange()
      return false
    }

    try {
      await getUserInfo()
    } catch {
      return unpass()
    }

    const userStorage = storage.get(STORAGE_ADDRESS) as UserStorage | null

    // token / userStorage 都不存在
    if (!user.value && !userStorage) {
      return unpass()
    }

    if (user.value) return pass()

    return pass()
  }

  async function logout(
    params = {
      triggerEmitLogout: true
    }
  ) {
    const { triggerEmitLogout } = params
    if (user.value?.walletName === 'unipass') {
      //这里不async处理防止unipass钱包没有登出成功
      userApi.logout()
    } else {
      try {
        await userApi.logoutWeb2()
      } catch (error) {
        location.reload()
      }
    }
    clearStorage()
    clearCookie()
    user.value = null
    if (triggerEmitLogout) {
      setTimeout(() => {
        emitLogout()
        emitUserChange()
      }, 300)
    }
  }

  /**
   * 监听接口返回，登录失效则触发logout
   */
  function handleLoginExpired() {
    request.useResponse(null, (e) => {
      if (!loginChecked.value || !user.value) return
      if (isUnLogin(e.code)) {
        logout()
      }
      return Promise.reject(e)
    })
  }

  function clearStorage() {
    storage.remove(STORAGE_ADDRESS)
    storage.remove(STORAGE_KEY)
    storage.remove(GA_UID)
    storage.remove(ISNEWUSER)
    storage.remove(AIRDROPTIPS)
    emitDexInfo(null)
  }

  function clearCookie() {
    if (isTest) {
      cookie.remove(TOKEN_KEY)
    }
  }
  return {
    user,
    profileUser,
    logout,
    checkLogin,
    loginChecked,
    getUserInfo,
    checkUrlLang
  }
}

export function useDexUser() {
  if (!state) {
    state = initState()
  }
  return state
}

export function useDexUserSnapshot() {
  return useSyncExternalStore(dexUserStore.subscribe, dexUserStore.getState, dexUserStore.getState)
}

export function useDexUserState() {
  const snapshot = useDexUserSnapshot()
  const { logout, checkLogin, getUserInfo, checkUrlLang } = useDexUser()

  return {
    ...snapshot,
    logout,
    checkLogin,
    getUserInfo,
    checkUrlLang
  }
}
