import { EventEmitter } from '@/utils/event'
import { Asset } from '@/types/dex'

export type State = ReturnType<typeof initState>

let state: State

function initState() {
  const event = new EventEmitter()

  // 统一封装订阅：返回取消订阅函数，避免组件卸载后泄漏
  const on = (eventName: string, callback: (...args: any[]) => void) => {
    event.on(eventName, callback)
    return () => event.off(eventName, callback)
  }

  const LANGUAGE_CHANGE = 'languageChange'
  const LANGUAGE_BEFORE_CHANGE = 'beforeLanguageChange'
  const LOGIN_CHECKED = 'loginChecked'
  const LOGOUT = 'logout'
  const LOGIN = 'login'
  const USER_CHANGE = 'userChange'
  const LANG_CHECKED = 'langChecked'
  const DEX_INFO = 'dexInfo'
  const CURRENCY_CHANGE = 'currencyChange'
  const THEME_CHANGE = 'themeChange'
  const HEADER_RIGHT_POPOVER_OPEN = 'headerRightPopoverOpen'
  const NAV_MENU_OPEN = 'navMenuOpen'

  const onLogin = (callback: (user: any, profileUser: any) => void) => on(LOGIN, callback)
  const onLogout = (callback: () => void) => on(LOGOUT, callback)
  const onLoginChecked = (callback: (user?: any, profileUser?: any) => void) =>
    on(LOGIN_CHECKED, callback)
  const onUserChange = (callback: (user?: any, profileUser?: any) => void) =>
    on(USER_CHANGE, callback)
  const onLanguageChange = (callback: (lang: string) => void) => on(LANGUAGE_CHANGE, callback)
  const onBeforeLanguageChange = (callback: (lang: string) => void) =>
    on(LANGUAGE_BEFORE_CHANGE, callback)
  const onLangChecked = (callback: (visible: boolean) => void) => on(LANG_CHECKED, callback)
  const onDexInfoChange = (callback: (dexInfo: any) => void) => on(DEX_INFO, callback)
  const onCurrencyChange = (callback: (currency: string) => void) => on(CURRENCY_CHANGE, callback)
  const onThemeChange = (callback: (theme: string) => void) => on(THEME_CHANGE, callback)
  const onHeaderRightPopoverOpen = (callback: (openingId: string) => void) =>
    on(HEADER_RIGHT_POPOVER_OPEN, callback)
  const onNavMenuOpen = (callback: (openingId: string) => void) => on(NAV_MENU_OPEN, callback)

  const emitLogin = (user, profileUser) => event.emit(LOGIN, user, profileUser)
  const emitLogout = () => event.emit(LOGOUT)
  const emitLoginChecked = (user?, profileUser?) => event.emit(LOGIN_CHECKED, user, profileUser)
  const emitUserChange = (user?, profileUser?) => event.emit(USER_CHANGE, user, profileUser)
  const emitLanguageChanged = (lang: string) => event.emit(LANGUAGE_CHANGE, lang)
  const emitBeforeLanguageChange = (lang: string) => event.emit(LANGUAGE_BEFORE_CHANGE, lang)
  const emitLangChecked = (visible: boolean) => event.emit(LANG_CHECKED, visible)
  const emitDexInfo = (currentVal?) => event.emit(DEX_INFO, currentVal)
  const emitCurrencyChanged = (currency: string) => event.emit(CURRENCY_CHANGE, currency)
  const emitThemeChanged = (theme: string) => event.emit(THEME_CHANGE, theme)
  const emitHeaderRightPopoverOpen = (openingId: string) =>
    event.emit(HEADER_RIGHT_POPOVER_OPEN, openingId)
  const emitNavMenuOpen = (openingId: string) => event.emit(NAV_MENU_OPEN, openingId)

  return {
    onLogin,
    onLogout,
    onLoginChecked,
    onUserChange,
    onLanguageChange,
    onBeforeLanguageChange,
    onCurrencyChange,
    onThemeChange,
    onLangChecked,
    onDexInfoChange,
    onHeaderRightPopoverOpen,
    onNavMenuOpen,
    emitLogin,
    emitLogout,
    emitLoginChecked,
    emitUserChange,
    emitLanguageChanged,
    emitBeforeLanguageChange,
    emitCurrencyChanged,
    emitThemeChanged,
    emitLangChecked,
    emitDexInfo,
    emitHeaderRightPopoverOpen,
    emitNavMenuOpen
  }
}

export function useEvent() {
  if (!state) {
    state = initState()
  }
  return state
}
