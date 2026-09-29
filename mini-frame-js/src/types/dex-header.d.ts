/** dex-header 内部可复用的 TS 类型定义（仅类型，无运行时代码） */

import type { CSSProperties, MouseEvent, ReactNode } from 'react'

/** 通用翻译函数：默认命名空间已在 hooks/useLanguage.ts 内处理 */
export type TFunc = (key: string, namespace?: string) => string

/** header-right 弹层定位需要的 trigger 位置矩形 */
export type Rect = {
  top: number
  bottom: number
  left: number
  right: number
  height: number
  width: number
}

/** 语言选项（PC/H5 语言面板共用） */
export type LangOption = {
  key: string
  label: string
}

/** 带激活态的语言选项（H5 语言面板使用） */
export type LangOptionWithActive = LangOption & { active: boolean }

/** 订单下拉可选类型 */
export type OrderType = 'spot' | 'contract' | 'fiat' | 'earn' | 'block' | 'convert' | 'loan'

export type HeaderRightHoverPopoverRenderApi = {
  open: boolean
  close: () => void
}

export type HeaderRightHoverPopoverProps = {
  triggerClassName: string
  offset?: number

  /** 调试模式：保持弹层常开，并禁用点击外部关闭 */
  debugKeepOpen?: boolean

  /** 打开延迟（ms），默认 0 */
  openDelayMs?: number
  /** 关闭延迟（ms），默认 120 */
  closeDelayMs?: number

  /** 打开前回调（例如：预加载二维码） */
  onBeforeOpen?: () => void

  trigger: ReactNode
  popperClassName: string
  popperStyle?: CSSProperties
  onPopperClickCapture?: (e: MouseEvent<HTMLDivElement>) => void
  children: ReactNode | ((api: HeaderRightHoverPopoverRenderApi) => ReactNode)
}

/** account menu 点击类型 */
export type AccountMenuClickType = 'dashboard' | 'security' | 'settings' | 'verification' | 'apiKey' | 'rewardsHub' | 'invite'

export type DexHeaderPublicState = {
  language: string
  returnPageUrl: string
  user: any
  profileUser: any
  loginChecked: boolean
}

export type DexHeaderPublicApi = {
  kind: 'DexHeaderPublicApi'
  version: 2
  getState: () => DexHeaderPublicState
  setReturnPage: (pageUrl: string) => void
  goLoginPage: () => void
  goSignupPage: () => void
  setLang: (lang: string) => Promise<void>
}

/** 兼容旧版对外暴露的 ref 形态（例如：loginChecked.value） */
export type RefLike<T> = { value: T }

export type HeaderState = {
  /**
   * 兼容旧版 betterbit-frame-pkg / global-widget：
   * 外部项目可能直接读取 `user.value` / `loginChecked.value`
   */
  user: RefLike<any>
  profileUser: RefLike<any>
  loginChecked: RefLike<boolean>

  // plain snapshot (React side should prefer useDexHeaderState)
  getState: () => DexHeaderPublicState
  // navigation helpers
  setReturnPage: (pageUrl: string) => void
  goLoginPage: () => void
  goSignupPage: () => void
  // user operations (delegate to useDexUser)
  logout: (...args: any[]) => Promise<void>
  checkLogin: (...args: any[]) => Promise<boolean>
  getUserInfo: (...args: any[]) => Promise<any>
  // language operations
  setLang: (lang: string) => Promise<void>
  // currency operations
  setCurrency: (currency: string) => void
  // theme operations
  setTheme: (theme: string) => void
  // events (delegated to internal EventEmitter)
  onBeforeLanguageChange: ReturnType<typeof useEvent>['onBeforeLanguageChange']
  onLanguageChange: ReturnType<typeof useEvent>['onLanguageChange']
  onCurrencyChange: ReturnType<typeof useEvent>['onCurrencyChange']
  onThemeChange: ReturnType<typeof useEvent>['onThemeChange']
  onLogin: ReturnType<typeof useEvent>['onLogin']
  onLoginChecked: (cb: Parameters<ReturnType<typeof useEvent>['onLoginChecked']>[0]) => () => void
  onUserChange: (cb: Parameters<ReturnType<typeof useEvent>['onUserChange']>[0]) => () => void
  onLogout: ReturnType<typeof useEvent>['onLogout']
  onDexInfoChange: ReturnType<typeof useEvent>['onDexInfoChange']
}
