/** 下拉菜单打开延迟（毫秒） */
export const DROPDOWN_OPEN_DELAY_MS = 0

/** 下拉菜单关闭延迟（毫秒） */
export const DROPDOWN_CLOSE_DELAY_MS = 120

/** 下拉菜单层级 */
export const DROPDOWN_Z_INDEX = 3000

/** 子面板与主面板间距 */
export const SUB_PANEL_GAP = 0

/**
 * 开发调试开关：强制保持【合约交易】下拉框打开
 * 设置为 true 时，下拉框将始终保持打开状态，方便调试样式
 * 生产环境请设置为 false
 */
export const DEBUG_KEEP_DROPDOWN_OPEN = false

/**
 * 开发调试开关：强制保持【活动】下拉打开
 * 设置为 true 时，活动下拉将始终保持打开（会与全局互斥逻辑冲突，建议仅用于开发调试）
 */
export const DEBUG_KEEP_ACTIVITIES_OPEN = false

/**
 * 开发调试开关：强制保持【更多】下拉打开
 * 当前“更多”复用原 `futures-data` 下拉逻辑；设置为 true 时将始终保持打开
 *（会与全局互斥逻辑冲突，建议仅用于开发调试）
 */
export const DEBUG_KEEP_MORE_OPEN = false

/**
 * 调试模式：默认激活的子菜单
 * 当 DEBUG_KEEP_DROPDOWN_OPEN 为 true 时，自动打开此子菜单
 * 可选值: 'linearPerpetualList' | 'inversePerpetual' | 'deliveryContract' 等
 */
export const DEBUG_DEFAULT_ACTIVE_KEY = 'linearPerpetualList'

/**
 * 调试模式：强制保持个人中心下拉框打开
 * 设置为 true 时，个人中心下拉框将始终保持打开状态
 */
export const DEBUG_KEEP_ACCOUNT_CENTER_OPEN = false

/**
 * 调试模式：强制保持下载二维码下拉框打开
 * 设置为 true 时，下载二维码下拉框将始终保持打开状态
 */
export const DEBUG_KEEP_DOWNLOAD_TOOLTIP_OPEN = false

/**
 * 调试模式：强制保持订单下拉框打开
 * 设置为 true 时，订单下拉框将始终保持打开状态
 */
export const DEBUG_KEEP_ORDER_DROPDOWN_OPEN = false

/**
 * 调试模式：强制保持资产下拉框打开
 * 设置为 true 时，资产下拉框将始终保持打开状态
 */
export const DEBUG_KEEP_ASSETS_DROPDOWN_OPEN = false

/**
 * 强制黑色主题开关（运行时）
 * - 生效环境：dev/test/prod 全部生效（只要页面加载了 global-widget）
 * - 默认值：由 FORCE_DARK_HEADER_THEME 控制
 * - 配置来源（优先级从高到低）：
 *   1) URL query：forceDarkHeader=1/0
 *   2) localStorage：@global-widget:forceDarkHeaderTheme = '1' | '0'
 *
 * 你可以通过 setForceDarkHeaderTheme(true/false) 在运行时切换（会触发事件）
 */
export const FORCE_DARK_HEADER_THEME = true
export const FORCE_DARK_HEADER_THEME_STORAGE_KEY = '@global-widget:forceDarkHeaderTheme'
export const FORCE_DARK_HEADER_THEME_EVENT = 'dexHeader:forceDarkThemeChange'

function getQueryForceDarkHeader(): boolean | null {
  try {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const v = params.get('forceDarkHeader')
    if (v === '1') return true
    if (v === '0') return false
    return null
  } catch {
    return null
  }
}

export function getForceDarkHeaderTheme(): boolean {
  const fromQuery = getQueryForceDarkHeader()
  if (fromQuery !== null) return fromQuery

  try {
    if (typeof window === 'undefined') return FORCE_DARK_HEADER_THEME
    const stored = window.localStorage.getItem(FORCE_DARK_HEADER_THEME_STORAGE_KEY)
    if (stored === '1') return true
    if (stored === '0') return false
    // 未配置时：回落到代码开关
    return FORCE_DARK_HEADER_THEME
  } catch {
    // 无法访问 localStorage 时：回落到代码开关
    return FORCE_DARK_HEADER_THEME
  }
}

export function setForceDarkHeaderTheme(force: boolean): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(FORCE_DARK_HEADER_THEME_STORAGE_KEY, force ? '1' : '0')
    window.dispatchEvent(new CustomEvent(FORCE_DARK_HEADER_THEME_EVENT))
  } catch {
    // ignore
  }
}
