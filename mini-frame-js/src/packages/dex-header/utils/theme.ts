import { getForceDarkHeaderTheme } from '../PcMenu/constants'

const FORCE_DARK_HEADER_DATASET_KEY = 'dexHeaderForceDark'
const BASE_THEME_CSS_PREFIX = '/static/common/base/css/'
const BASE_THEME_INDEX = `${BASE_THEME_CSS_PREFIX}index.css`
const THEME_LIGHT_FILE = 'theme.light.css'
const THEME_DARK_FILE = 'theme.dark.css'

export function getHeaderThemeClassName(): 'header-theme-dark' | 'header-theme-light' {
  if (typeof document === 'undefined') {
    return getForceDarkHeaderTheme() ? 'header-theme-dark' : 'header-theme-light'
  }

  const isGlobalDark = document.documentElement.classList.contains('theme-dark')
  const forceDarkHeader = document.documentElement.dataset[FORCE_DARK_HEADER_DATASET_KEY] === '1'
  const forceDarkTheme = getForceDarkHeaderTheme()
  return forceDarkTheme || forceDarkHeader || isGlobalDark
    ? 'header-theme-dark'
    : 'header-theme-light'
}

/**
 * 确保宿主未主动引入时，自动挂载公共主题变量 CSS（index.css 内含 theme.light/dark）
 */
export function ensureBaseThemeCssInjected() {
  if (typeof document === 'undefined') return
  const exists = document.querySelector(
    [
      `link[rel="stylesheet"][href*="${BASE_THEME_CSS_PREFIX}"]`,
      `link[rel="stylesheet"][href*="${THEME_LIGHT_FILE}"]`,
      `link[rel="stylesheet"][href*="${THEME_DARK_FILE}"]`,
      'link#dex-header-base-theme-css'
    ].join(',')
  ) as HTMLLinkElement | null
  if (exists) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = BASE_THEME_INDEX
  link.id = 'dex-header-base-theme-css'
  document.head.appendChild(link)
}

export { FORCE_DARK_HEADER_DATASET_KEY }

export const TRADE_THEME_KEY = 'TRADE_THEME'

export const TRADE_THEMES = {
  DARK: 'theme-dark',
  LIGHT: 'theme-light',
}

export function setTradeTheme(theme: string) {
  localStorage.setItem(TRADE_THEME_KEY, theme)
}

export function getTradeTheme(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TRADE_THEME_KEY)
}

