import { useEvent } from './useEvent'
import { useDexUser } from './useDexUser'
import { getLanguage as getDefaultLanguage, useLanguage } from './useLanguage'
import { combineWithCurrentQuery } from '@/utils'
import { dynamicDomain } from '../constants/menus'
import { getI18n } from '@/utils/i18n'
import { setTradeTheme } from '../utils/theme'
import { DexHeaderPublicState, HeaderState } from '@/types/dex-header'
import { useMemo, useSyncExternalStore } from 'react'
import { createExternalStore } from '@/utils'

type DexHeaderStoreState = {
  returnPageUrl: string
}

let state: HeaderState | null = null

export const dexHeaderStore = createExternalStore<DexHeaderStoreState>({
  returnPageUrl: ''
})

function getReturnPageUrl() {
  return dexHeaderStore.getState().returnPageUrl
}

function setReturnPageUrl(next: string) {
  if (!next) return
  dexHeaderStore.setState({ returnPageUrl: next })
}

function buildAccountUrl(params: {
  lang: string
  route: 'login' | 'register'
  returnPageUrl?: string
}) {
  const loginParams = params.returnPageUrl
    ? `return_page=${window.encodeURIComponent(window.btoa(params.returnPageUrl))}`
    : ''
  const newQueries = combineWithCurrentQuery(loginParams)
  return `${dynamicDomain}/${params.lang}/account/${params.route}${
    newQueries ? '?' + newQueries : '/'
  }`
}

function getCurrentLanguageForNavigate() {
  const { getLanguage } = getI18n()
  return getLanguage() || getDefaultLanguage()
}

function navigateToAccount(route: 'login' | 'register', lang: string, returnPageUrl?: string) {
  window.location.href = buildAccountUrl({ lang, route, returnPageUrl })
}

function initState(): HeaderState {
  const { user, profileUser, loginChecked, logout, checkLogin, getUserInfo } = useDexUser()
  const { setLang } = useLanguage()
  const {
    emitLoginChecked,
    emitUserChange,
    emitCurrencyChanged,
    emitThemeChanged,
    onBeforeLanguageChange,
    onLanguageChange,
    onCurrencyChange,
    onThemeChange,
    onLogin,
    onLoginChecked: _onLoginChecked,
    onUserChange: _onUserChange,
    onLogout,
    onDexInfoChange
  } = useEvent()

  function setCurrency(currency: string) {
    localStorage.setItem('CURRENCY_CODE', currency)
    emitCurrencyChanged(currency)
  }

  function setTheme(theme: string) {
    setTradeTheme(theme)
    emitThemeChanged(theme)
  }

  const getState = (): DexHeaderPublicState => ({
    language: getCurrentLanguageForNavigate(),
    returnPageUrl: getReturnPageUrl(),
    user: user.value,
    profileUser: profileUser.value,
    loginChecked: Boolean(loginChecked.value)
  })

  const setReturnPage = (pageUrl: string) => setReturnPageUrl(pageUrl)
  const goLoginPage = () =>
    navigateToAccount('login', getCurrentLanguageForNavigate(), getReturnPageUrl())
  const goSignupPage = () =>
    navigateToAccount('register', getCurrentLanguageForNavigate(), getReturnPageUrl())

  // 兼容旧逻辑：如果“已完成 loginChecked”，订阅后立刻触发一次
  function onLoginChecked(callback: Parameters<typeof _onLoginChecked>[0]) {
    const off = _onLoginChecked(callback)
    if (loginChecked.value) {
      emitLoginChecked(user.value)
    }
    return off
  }

  function onUserChange(callback: Parameters<typeof _onUserChange>[0]) {
    const off = _onUserChange(callback)
    if (loginChecked.value) {
      emitUserChange(user.value)
    }
    return off
  }

  return {
    /**
     * 兼容旧版 betterbit-frame-pkg / global-widget：
     * 外部项目可能依赖 `loginChecked.value` / `user.value` 这种 ref 形态。
     * 新版推荐使用 `getState()` 与事件，但这里保留字段避免外部大面积改动。
     */
    user,
    profileUser,
    loginChecked,
    setLang,
    setCurrency,
    setTheme,
    logout,
    checkLogin,
    getUserInfo,
    getState,
    setReturnPage,
    goLoginPage,
    goSignupPage,
    // events
    onBeforeLanguageChange,
    onLanguageChange,
    onCurrencyChange,
    onThemeChange,
    onLogin,
    onLoginChecked,
    onUserChange,
    onLogout,
    onDexInfoChange
  }
}

/**
 * 非 React 场景（例如 connector / registry）获取 DexHeader API 的入口。
 * 这里返回的是模块级单例，因此可以在任意地方调用。
 */
export function getDexHeader() {
  if (!state) {
    state = initState()
  }
  return state
}

/**
 * React hook：仅用于组件内，返回稳定引用
 */
export function useDexHeader() {
  return useMemo(() => getDexHeader(), [])
}

export function useDexHeaderStoreSnapshot() {
  return useSyncExternalStore(
    dexHeaderStore.subscribe,
    dexHeaderStore.getState,
    dexHeaderStore.getState
  )
}

// 给 connector / 外部消费侧一个稳定的 state 类型（避免重复手写）
export type State = ReturnType<typeof getDexHeader>
