/**
 * i18n 封装 - 替代 @region-lib/vue-i18n
 * 基于 i18next，提供与原 useI18next 兼容的 API
 * 使用动态导入优化初始包体积
 */
import i18next from 'i18next'

interface I18nConfig {
  ns: string[]
  defaultNS: string
  lng: string
  requestUrl: (lang: string, namespace: string) => string
}

let initialized = false
let currentLanguage = ''

/**
 * 初始化 i18next（替代 createI18next）
 * 仅使用 http backend 拉取远程多语言（不做本地缓存/链式后端）
 */
export async function initI18next(config: I18nConfig) {
  const { ns, defaultNS, lng, requestUrl } = config
  // 已初始化：允许通过再次调用 initI18next 来切换语言（避免被 initialized 短路）
  if (initialized) {
    if (i18next.language !== lng) {
      await i18next.changeLanguage(lng)
    }
    currentLanguage = i18next.language || lng
    return
  }

  try {
    // 动态导入 http backend，只在初始化时加载
    const { default: Backend } = await import('i18next-http-backend')

    await i18next.use(Backend).init({
      lng,
      ns,
      defaultNS,
      fallbackLng: 'en-US',
      load: 'currentOnly', // 禁用语言代码简化，使用完整的 zh-CN 而不是 zh
      interpolation: {
        escapeValue: false
      },
      backend: {
        loadPath: (lngs: string[], namespaces: string[]) => {
          return requestUrl(lngs[0], namespaces[0])
        }
      }
    } as any)

    currentLanguage = i18next.language || lng
    i18next.on('languageChanged', (newLng) => {
      currentLanguage = newLng
    })

    initialized = true
  } catch (error) {
    console.error('Failed to initialize i18next:', error)
    throw error
  }
}

export function useI18n(ns?: string) {
  function t(key: string, options?: any): string {
    const resolvedKey = ns ? `${ns}:${key}` : key
    return i18next.t(resolvedKey, options)
  }

  async function changeLanguage(lng: string) {
    await i18next.changeLanguage(lng)
  }

  return {
    t,
    getLanguage: () => i18next.language || currentLanguage,
    subscribeLanguage: (listener: () => void) => {
      // 订阅即触发一次：让 useSyncExternalStore 在初始化后/订阅后尽快同步
      listener()

      const cb = () => listener()
      // languageChanged：语言切换
      i18next.on('languageChanged', cb)
      // initialized：i18next 初始化完成（避免监听 loaded 导致频繁触发）
      i18next.on('initialized', cb)
      return () => {
        i18next.off('languageChanged', cb)
        i18next.off('initialized', cb)
      }
    },
    changeLanguage,
    i18next
  }
}

export function getI18n() {
  return useI18n()
}

export { i18next }
