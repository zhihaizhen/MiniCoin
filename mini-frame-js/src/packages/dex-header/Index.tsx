import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Header } from './header'
import { useDexHeader } from './hooks/useDexHeader'
import { useDexUserState } from './hooks/useDexUser'
import { useLanguageValue } from './hooks/useLanguage'
import { BaseStoreProvider, useBaseStore } from './store'
import { createFavicon, addThemeToPopperContainers, checkReferralCode } from '@/utils'
import { ensureBaseThemeCssInjected } from './utils/theme'
import { ensureMicrofusionScript } from '@/utils/microfusion'
import { banAreaCheck } from '@/api/dex'
import Favicon from './assets/favicon/favicon.ico'

const affiliateDomains = [
  'www-tey2tebxt859w.test.v8u7k50ylv0nzegojr867a.xyz',
  'v8u7k50ylv0nzegojr867a.xyz',
  'www-tey2tebxt859w.v8u7k50ylv0nzegojr867a.xyz'
]

// 主 Header 组件（内部实现）
function DexHeaderIndexInner() {
  const initRef = useRef(false)
  const baseStore = useBaseStore()
  const language = useLanguageValue()
  const { checkLogin, checkUrlLang } = useDexUserState()

  // 初始化
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    // 检查登录
    checkLogin()
    checkUrlLang()
    checkReferralCode()

    // 补齐公共主题变量 CSS（宿主未引入时自动兜底）
    ensureBaseThemeCssInjected()
    // 兼容 old-backup：注入 common/base/js（其中会拉取公共样式）
    ensureMicrofusionScript().catch(() => {
      // 静默失败，不影响宿主
    })

    // 创建 favicon
    if (!affiliateDomains.includes(window.location.host)) {
      createFavicon(Favicon)
    }

    // 给所有 rc-popper-container 添加主题类
    const cleanupPopperTheme = addThemeToPopperContainers()

    // 检查封禁状态
    checkBanStatus()
    return () => {
      cleanupPopperTheme?.()
    }
  }, [])

  // 检查封禁状态
  async function checkBanStatus() {
    try {
      const banStatus = await banAreaCheck()
      const { banned } = banStatus
      baseStore.setIsBanned(banned)
    } catch (error: any) {
      const { code } = error
      if (code === 26200011) {
        baseStore.setIsBanned(true)
      }
    }

    if (baseStore.isBanned && window.location.pathname !== `/${language}/setting/ip-block`) {
      window.location.href = `/${language}/setting/ip-block`
    }
  }

  return <Header />
}

// 主 Header 组件（带 Provider）
export function DexHeaderIndex() {
  return (
    <BaseStoreProvider>
      <DexHeaderIndexInner />
    </BaseStoreProvider>
  )
}

export function mount(container: HTMLElement, _props?: unknown) {
  const root = createRoot(container)

  const state = useDexHeader()

  root.render(React.createElement(DexHeaderIndex))

  return {
    unmount: () => root.unmount(),
    state
  }
}
