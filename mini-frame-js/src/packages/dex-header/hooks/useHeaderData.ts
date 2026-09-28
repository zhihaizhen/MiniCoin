import { useState, useEffect, useCallback, useMemo } from 'react'
import QRCode from 'qrcode'
import { useLanguage, useLanguageValue } from './useLanguage'
import { useDexHeader } from './useDexHeader'
import { useDexUserState } from './useDexUser'
import { useBaseStore } from '../store'
import { STORAGE_ADDRESS } from '../constants'
import { langList } from '@/utils'
import { isFixedLocaleDomain, isProd } from '@/utils/host'
import { dynamicDomain } from '../constants/menus'
import { LANG_KEY } from '@region-lib/language'
import { cookie } from '@region-lib/helper'
import { Env } from '@region-lib/env'

export function useHeaderData() {
  const { t, setLang } = useLanguage()
  const language = useLanguageValue()
  const baseStore = useBaseStore()
  const { goLoginPage, goSignupPage, onDexInfoChange } = useDexHeader()
  const { logout, user, profileUser } = useDexUserState()

  const [dexInfo, setDexInfo] = useState<any>(localStorage.getItem(STORAGE_ADDRESS))
  const [showH5Drawer, setShowH5Drawer] = useState(false)
  const [showH5Lang, setShowH5Lang] = useState(false)
  const [showH5AccountCenter, setShowH5AccountCenter] = useState(false)
  const [showLangList, setShowLangList] = useState(langList)
  const [qrcodeDataUrl, setQrcodeDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAffilate, setIsAffilate] = useState(null)

  // 计算 KYC 状态文本
  const getKycStatusText = useMemo(() => {
    if (!profileUser) return t('kycUnverified')

    const kycLevel = profileUser.kyc_level || 0
    const kycStatus = profileUser.kyc_status || ''

    // KYC状态映射表
    const kycStatusMap: any = {
      0: () => t('kycUnverified'), // 未验证
      1: {
        pending: () => t('kycReviewing'), // 审核中
        rejected: () => t('kycUnverified'), // 被拒绝
        passed: () => t('basicAuth') // 基础认证
      },
      2: {
        pending: () => t('basicAuth'), // 基础认证（高级审核中）
        rejected: () => t('basicAuth'), // 基础认证（高级被拒绝）
        passed: () => t('advancedAuth') // 高级认证
      }
    }

    // 根据level和status获取对应状态
    const levelConfig = kycStatusMap[kycLevel]
    if (!levelConfig) return t('kycUnverified')

    // 如果是函数，直接返回（level=0的情况）
    if (typeof levelConfig === 'function') {
      return levelConfig()
    }

    // 如果是对象，根据status获取对应状态
    const statusHandler = levelConfig[kycStatus]
    return statusHandler ? statusHandler() : t('kycUnverified')
  }, [profileUser, t])

  // 计算 KYC 标签样式类
  const getKycTagClass = useMemo(() => {
    if (!profileUser) return 'verification-tag-orange'

    const kycLevel = profileUser.kyc_level || 0
    const kycStatus = profileUser.kyc_status || ''

    // KYC审核中和KYC未验证 -> 橙色样式
    if (kycLevel === 0) {
      return 'verification-tag-orange'
    }

    if (kycLevel === 1 && kycStatus === 'pending') {
      return 'verification-tag-orange'
    }

    if (kycLevel === 1 && kycStatus === 'rejected') {
      return 'verification-tag-orange'
    }

    // 基础认证和高级认证 -> 绿色样式
    return 'verification-tag-green'
  }, [profileUser])

  // 生成下载页面URL
  const getDownloadPageUrl = useCallback(() => {
    return isProd
      ? `${window.location.origin}/${language}/downloadApp`
      : `https://www.test.bitrunfinance.com/${language}/downloadApp`
  }, [language])

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)

    try {
      const downloadUrl = getDownloadPageUrl()
      const dataUrl = await QRCode.toDataURL(downloadUrl, {
        width: 140,
        margin: 3,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })
      setQrcodeDataUrl(dataUrl)
    } catch (error) {
      console.error('生成二维码失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, getDownloadPageUrl])

  // 预生成二维码
  const preGenerateQRCode = useCallback(() => {
    if (!qrcodeDataUrl) {
      generateQRCode()
    }
  }, [qrcodeDataUrl, generateQRCode])

  // 页面加载时生成二维码
  useEffect(() => {
    generateQRCode()
  }, [])

  // 监听语言变化，重新生成二维码
  useEffect(() => {
    setQrcodeDataUrl('')
    generateQRCode()
  }, [language])

  // 监听用户变化
  useEffect(() => {
    setShowLangList(langList)
  }, [user])

  // 监听 dexInfo 变化
  useEffect(() => {
    const handleStorageChange = () => {
      setDexInfo(localStorage.getItem(STORAGE_ADDRESS))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleGoLogin = useCallback(
    (type: 'login' | 'signup') => {
      if (type === 'login') {
        goLoginPage()
      } else {
        goSignupPage()
      }
    },
    [goLoginPage, goSignupPage]
  )

  const handleOpen = useCallback(
    (type: string) => {
      // 未登录跳转到登录页
      if (!user) {
        goLoginPage()
        return
      }

      // 处理个人中心弹框
      if (type === 'accountCenter') {
        setShowH5AccountCenter(true)
        return
      }

      if (type === 'deposit') {
        window.location.href = `${dynamicDomain}/${language}/assets/deposit`
      } else if (type === 'orders') {
        window.location.href = `${dynamicDomain}/${language}/assets/history/order`
      }
    },
    [user, language, goLoginPage]
  )

  const handleLogout = useCallback(() => {
    logout()
    setShowH5AccountCenter(false)
    setShowH5Drawer(false)
  }, [logout])

  const ORDER_PATH_MAP: Record<string, string> = {
    spot: 'spot-order',
    contract: 'future-order',
    fiat: 'fiat-order',
    earn: 'earn-order',
    block: 'block-order',
    convert: 'convert-order',
    loan: 'loan-borrow-history',
  }

  const handleOrderClick = useCallback(
    (type: 'spot' | 'contract' | 'fiat' | 'earn' | 'block' | 'convert' | 'loan') => {
      if (!user) {
        goLoginPage()
        return
      }
      const path = ORDER_PATH_MAP[type]
      if (path) {
        window.location.href = `${dynamicDomain}/${language}/assets/history/${path}`
      }
    },
    [user, language, goLoginPage]
  )

  const handleChangeLang = useCallback(
    (lang: string) => {
      // 1) 持久化语言（让 getLanguage() / 下次加载一致）
      try {
        localStorage.setItem(LANG_KEY, lang)
      } catch {
        // ignore
      }
      try {
        const { COOKIE_DOMAIN } = Env
        cookie.set('language', lang, {
          domain: COOKIE_DOMAIN,
          path: '/',
          // 7 天（分钟）
          expires: 60 * 24 * 7
        })
      } catch {
        // ignore
      }

      // 2) 只要当前 URL 带有 /{lang} 前缀，就替换并跳转（不仅限于 trade/spot）
      // 例如：/zh-TW/markets -> /en-US/markets
      try {
        const { pathname, search, hash } = window.location
        const hasLangPrefix = /^\/[a-z]{2}-[A-Z]{2}(?=\/|$)/.test(pathname)
        if (hasLangPrefix) {
          const nextPathname = pathname.replace(/^\/[a-z]{2}-[A-Z]{2}(?=\/|$)/, `/${lang}`)
          if (nextPathname !== pathname) {
            window.location.replace(`${nextPathname}${search}${hash}`)
            return
          }
        }
      } catch {
        // ignore
      }

      // 3) no-locale 路由（例如 /trade/... /spot/exchange...）：地址栏不带 lang，只切文案
      // fixed-locale 由上面的 hasLangPrefix 覆盖（更通用）
      setLang(lang)
    },
    [setLang]
  )

  const getCurrentLanguage = useCallback(() => {
    const currentLang = showLangList.find((lang) => lang.key === language)
    return currentLang?.label || 'English'
  }, [language, showLangList])

  const handleGotoDownload = useCallback(() => {
    window.location.href = `${dynamicDomain}/${language}/downloadApp/`
  }, [language])

  return {
    // 基础数据
    language,
    t,
    baseStore,
    dexInfo,
    user,
    profileUser,
    dynamicDomain,

    // KYC
    getKycStatusText,
    getKycTagClass,

    // 状态
    showH5Drawer,
    setShowH5Drawer,
    showH5Lang,
    setShowH5Lang,
    showH5AccountCenter,
    setShowH5AccountCenter,
    showLangList,
    isAffilate,

    // 二维码
    qrcodeDataUrl,
    preGenerateQRCode,

    // 事件处理
    handleGoLogin,
    handleOpen,
    handleLogout,
    handleOrderClick,
    handleChangeLang,
    getCurrentLanguage,
    handleGotoDownload,

    // DexHeader
    onDexInfoChange
  }
}
