import { Env } from '@region-lib/env'
import { cookie } from '@region-lib/helper'

// 复用纯 DOM 工具（避免重复实现）
export { createElement } from './dom'
export { createExternalStore } from './externalStore'

// ===== 仍在使用的导出（全仓库有引用） =====

export const createFavicon = (_FaviconDark?: unknown) => {
  const link: HTMLAnchorElement | HTMLLinkElement =
    document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.rel = 'shortcut icon'
  link.href = '/favicon.ico'
  document.getElementsByTagName('head')[0].appendChild(link)
}

function getQueryVariable(variable: string): string | false {
  const query = window.location.search.substring(1)
  const queries = query.split('&')
  for (let i = 0; i < queries.length; i++) {
    const pair = queries[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return false
}

export function combineWithCurrentQuery(newQuery?: string) {
  // query: type=1
  const query = window.location.search.substring(1)
  const queries = query.split('&')
  const newQueries = query ? [...queries, newQuery] : [newQuery]
  return newQueries.join('&')
}

export const loginPushRouter = () => {
  const returnPageQuery = getQueryVariable('return_page')
  if (returnPageQuery) {
    const returnBackQuery = window.atob(window.decodeURIComponent(returnPageQuery))
    window.location.pathname = returnBackQuery
  } else {
    window.location.pathname = '/trade/usdt/BTCUSDT'
  }
}

export function checkReferralCode() {
  const inviteCodeQuery = getQueryVariable('inviteCode') || getQueryVariable('invite_code')
  const inviteCodeCookie = cookie.get('invite_code') || false
  const { COOKIE_DOMAIN } = Env
  if (inviteCodeQuery) {
    cookie.set('invite_code', inviteCodeQuery, {
      domain: COOKIE_DOMAIN,
      path: '/',
      expires: 30
    })
  }

  const invite_code = inviteCodeQuery || inviteCodeCookie
  return invite_code
}

export const langList = [
  {
    key: 'en-US',
    label: 'English'
  },
  {
    key: 'zh-CN',
    label: '简体中文'
  },
  {
    key: 'zh-TW',
    label: '繁體中文'
  },
  // {
  //   key: 'ko-KR',
  //   label: '한국어'
  // },
  {
    key: 'vi-VN',
    label: 'Tiếng Việt'
  },
  {
    key: 'id-ID',
    label: 'Bahasa Indonesia'
  },
  {
    key: 'es-ES',
    label: 'Español (España)'
  },
  {
    key: 'ru-RU',
    label: 'Русский'
  },
  {
    key: 'pt-PT',
    label: 'Português (Portugal)'
  },
  {
    key: 'fr-FR',
    label: 'Français'
  },
  {
    key: 'uk-UA',
    label: 'Українська'
  },
  {
    key: 'uz-UZ',
    label: 'Oʻzbekcha'
  },
  {
    key: 'es-LA',
    label: 'Español (Latinoamérica)'
  },
  {
    key: 'pl-PL',
    label: 'Polski'
  },
  {
    key: 'az-AZ',
    label: 'Azərbaycan'
  },
  {
    key: 'kk-KZ',
    label: 'Қазақша'
  },
  {
    key: 'si-LK',
    label: 'සිංහල'
  },
  {
    key: 'sk-SK',
    label: 'Slovenčina'
  },
  {
    key: 'sl-SI',
    label: 'Slovenščina'
  },
  {
    key: 'lo-LA',
    label: 'ລາວ'
  },
  {
    key: 'lv-LV',
    label: 'latviešu valoda'
  },
  {
    key: 'hu-HU',
    label: 'magyar nyelv'
  },
  {
    key: 'el-GR',
    label: 'Ελληνικά'
  },
  {
    key: 'cs-CZ',
    label: 'Čeština'
  },
  {
    key: 'bg-BG',
    label: 'български'
  },
  {
    key: 'sv-SE',
    label: 'svenska'
  },
  {
    key: 'da-DK',
    label: 'Dansk'
  },
  {
    key: 'ro-RO',
    label: 'Română'
  },
  {
    key: 'th-TH',
    label: 'ภาษาไทย'
  },
  {
    key: 'tr-TR',
    label: 'Türkçe'
  },
  {
    key: 'ar-SA',
    label: 'العربية'
  },
  {
    key: 'it-IT',
    label: 'Italiano'
  },
  {
    key: 'ja-JP',
    label: '日本語'
  }
]

export function getCurrentYear() {
  const date = new Date()
  const year = date.getFullYear()
  return String(year)
}

export function isApp() {
  return !!navigator.userAgent.match(/bit_app/i)
}

/**
 * 给所有 id 包含 rc-popper-container 的元素添加 header 主题类
 */
export function addThemeToPopperContainers() {
  if (typeof document === 'undefined') return

  const FORCE_DARK_HEADER_THEME_STORAGE_KEY = '@global-widget:forceDarkHeaderTheme'
  const FORCE_DARK_HEADER_THEME_EVENT = 'dexHeader:forceDarkThemeChange'
  const FORCE_DARK_HEADER_DATASET_KEY = 'dexHeaderForceDark'
  const DEFAULT_FORCE_DARK_HEADER_THEME = false

  const getQueryForceDarkHeader = (): boolean | null => {
    try {
      const params = new URLSearchParams(window.location.search)
      const v = params.get('forceDarkHeader')
      if (v === '1') return true
      if (v === '0') return false
      return null
    } catch {
      return null
    }
  }

  const getForceDarkHeaderTheme = (): boolean => {
    const fromQuery = getQueryForceDarkHeader()
    if (fromQuery !== null) return fromQuery
    try {
      const stored = window.localStorage.getItem(FORCE_DARK_HEADER_THEME_STORAGE_KEY)
      if (stored === '1') return true
      if (stored === '0') return false
      return DEFAULT_FORCE_DARK_HEADER_THEME
    } catch {
      return DEFAULT_FORCE_DARK_HEADER_THEME
    }
  }

  const applyThemeClass = () => {
    const isGlobalDark = document.documentElement.classList.contains('theme-dark')
    const forceDarkHeader = document.documentElement.dataset[FORCE_DARK_HEADER_DATASET_KEY] === '1'
    const isDark = getForceDarkHeaderTheme() || forceDarkHeader || isGlobalDark
    const themeClass = isDark ? 'header-theme-dark' : 'header-theme-light'
    const removeClass = isDark ? 'header-theme-light' : 'header-theme-dark'
    const containers = document.querySelectorAll('div[id*="rc-popper-container"]')
    containers.forEach((container) => {
      container.classList.remove(removeClass)
      container.classList.add(themeClass)
    })
  }

  applyThemeClass()

  const themeObserver = new MutationObserver(applyThemeClass)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-dex-header-force-dark']
  })

  const containerObserver = new MutationObserver(applyThemeClass)
  containerObserver.observe(document.body, { childList: true, subtree: true })

  const onThemeEvent = () => applyThemeClass()
  window.addEventListener('storage', onThemeEvent)
  window.addEventListener(FORCE_DARK_HEADER_THEME_EVENT, onThemeEvent)

  return () => {
    themeObserver.disconnect()
    containerObserver.disconnect()
    window.removeEventListener('storage', onThemeEvent)
    window.removeEventListener(FORCE_DARK_HEADER_THEME_EVENT, onThemeEvent)
  }
}
