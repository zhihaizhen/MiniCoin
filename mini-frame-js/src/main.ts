import { getLanguage } from '@region-lib/language'
import { Env } from '@region-lib/env'
import { createElement } from './utils/dom'
import { initI18next } from './utils/i18n'
import { initFrame, EVENT_FAILED } from './frame'
import { mountCookieConsent } from './packages/dex-footer/CookieConsent'

async function createFrame() {
  // 仅用于确保脚本有一个稳定的宿主节点（并不渲染任何 UI）
  createElement('global-widget')

  try {
    // 初始化 i18next (异步加载后端插件)
    await initI18next({
      ns: ['ztsl_error_code', 'global-widget', 'footer', 'gitbook-url'],
      defaultNS: 'global-widget',
      lng: getLanguage(),
      requestUrl: (lang, namespace) => Env.getTmsHost(lang, namespace)
    })

    // i18n 就绪后再初始化 Frame，保证 connector 拿到状态时，语言资源已可用
    initFrame()

    // Cookie 弹窗独立于 Header/Footer，所有页面都需要
    mountCookieConsent()
  } catch (e) {
    // 初始化失败时给外部一个可监听的事件
    window.dispatchEvent(new Event(EVENT_FAILED))
    throw e
  }
}

createFrame()
