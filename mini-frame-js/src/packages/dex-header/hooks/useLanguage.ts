import { getI18n } from '@/utils/i18n'
import { LANGUAGES, LANG_KEY } from '@region-lib/language'
import { useEvent } from './useEvent'
import { cookie } from '@region-lib/helper'
import { useSyncExternalStore } from 'react'

let state: ReturnType<typeof initState>

export function getLanguage() {
  const navigatorSupportMap = {
    en: 'en-US',
    zh: 'zh-CN',
    cn: 'zh-CN',
    vi: 'vi-VN',
    // ko: 'ko-KR',
    id: 'id-ID',
    es: 'es-ES',
    ru: 'ru-RU',
    pt: 'pt-PT',
    ar: 'ar-SA',
    fr: 'fr-FR',
    uk: 'uk-UA',
    uz: 'uz-UZ',
    pl: 'pl-PL',
    az: 'az-AZ',
    kk: 'kk-KZ',
    si: 'si-LK',
    sk: 'sk-SK',
    sl: 'sl-SI',
    lo: 'lo-LA',
    lv: 'lv-LV',
    hu: 'hu-HU',
    el: 'el-GR',
    cs: 'cs-CZ',
    bg: 'bg-BG',
    sv: 'sv-SE',
    da: 'da-DK',
    ro: 'ro-RO',
    th: 'th-TH',
    tr: 'tr-TR',
    it: 'it-IT',
    ja: 'ja-JP',
    'en-US': 'en-US',
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-TW',
    'zh-CN': 'zh-CN',
    'vi-VN': 'vi-VN',
    // 'ko-KR': 'ko-KR',
    'id-ID': 'id-ID',
    'es-ES': 'es-ES',
    'ru-RU': 'ru-RU',
    'pt-PT': 'pt-PT',
    'ar-SA': 'ar-SA',
    'fr-FR': 'fr-FR',
    'uk-UA': 'uk-UA',
    'uz-UZ': 'uz-UZ',
    'es-LA': 'es-LA',
    'pl-PL': 'pl-PL',
    'az-AZ': 'az-AZ',
    'kk-KZ': 'kk-KZ',
    'si-LK': 'si-LK',
    'sk-SK': 'sk-SK',
    'sl-SI': 'sl-SI',
    'lo-LA': 'lo-LA',
    'lv-LV': 'lv-LV',
    'hu-HU': 'hu-HU',
    'el-GR': 'el-GR',
    'cs-CZ': 'cs-CZ',
    'bg-BG': 'bg-BG',
    'sv-SE': 'sv-SE',
    'da-DK': 'da-DK',
    'ro-RO': 'ro-RO',
    'th-TH': 'th-TH',
    'tr-TR': 'tr-TR',
    'it-IT': 'it-IT',
    'ja-JP': 'ja-JP'
  }
  // const isHomePage = `https://${window?.location.host}/` === window?.location.href
  const defaultLang = 'en-US'
  if (typeof window !== 'undefined' && window) {
    //1. url上取
    const langReg = /([a-z]{2}-[A-Z]{2})/
    let hrefLang: any = window.location.pathname.match(langReg)
    const supportedLangKeys = Object.keys(navigatorSupportMap)
    if (hrefLang) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      hrefLang = supportedLangKeys.includes(hrefLang[0]) ? hrefLang[0] : null
    }
    // 2.localstorage取
    const curStorageLang = localStorage.getItem(LANG_KEY)
    const storageLang = supportedLangKeys.includes(curStorageLang) ? curStorageLang : null
    // 3.从系统语言上取
    const systemLang = navigatorSupportMap[navigator.language]
    const curCookieLang = cookie.get('language')
    const cookieLang = supportedLangKeys.includes(curCookieLang) ? curCookieLang : null
    // 4. 默认语言
    const lang = hrefLang || cookieLang || storageLang || systemLang || defaultLang
    // if (isHomePage) {
    //   // 首页优先取系统语言
    //   lang = hrefLang || systemLang || storageLang || defalueLang
    // }
    // alert(
    //   `getLang error: ${window.location.pathname},${hrefLang},${storageLang},${systemLang},${lang}`
    // );
    //获取到之后先重定向，再set保证其他页面也一致
    // localStorage.setItem('LANG_KEY', lang)
    return lang
  }
  return defaultLang
}
function initState() {
  // 延迟获取 i18n 实例，避免在初始化前调用
  let i18nInstance: ReturnType<typeof getI18n> | null = null

  const getI18nInstance = () => {
    if (!i18nInstance) {
      i18nInstance = getI18n()
    }
    return i18nInstance
  }

  const { emitLanguageChanged, emitBeforeLanguageChange } = useEvent()

  // 默认命名空间统一使用 global-widget（不再使用 home-page）
  function t(key: string, namespace = 'global-widget') {
    const { t: _t } = getI18nInstance()
    return _t(`${namespace}:${key}`)
  }

  async function setLang(lang: string) {
    const { changeLanguage } = getI18nInstance()
    emitBeforeLanguageChange(lang)
    await changeLanguage(lang)
    emitLanguageChanged(lang)
  }

  const languageGetter = {
    get value() {
      const { getLanguage: getI18nLanguage } = getI18nInstance()
      return getI18nLanguage()
    }
  }

  return {
    t,
    language: languageGetter as any,
    setLang,
    getLanguage
  }
}

export function useLanguage() {
  if (!state) {
    state = initState()
  }
  return state
}

export function useLanguageValue() {
  const { getLanguage: getLang, subscribeLanguage } = getI18n()
  const fallback = getLanguage()
  return useSyncExternalStore(
    subscribeLanguage,
    () => getLang() || fallback,
    () => getLang() || fallback
  )
}
