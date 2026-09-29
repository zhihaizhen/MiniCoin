import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { ReactMessage } from '../share/ReactMessage'
import { useDismiss } from '../hooks/useDismiss'
import { useHoverTimers } from '../hooks/useHoverTimers'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { DEBUG_KEEP_ACCOUNT_CENTER_OPEN } from '../PcMenu/constants'
import { useEvent } from '../hooks/useEvent'
import { getHeaderThemeClassName } from '../utils/theme'

import DefaultAvatarMini from '../assets/default-avatar-mini.svg?url'
import kycIconUrl from '../assets/kyc.png?url'
import walletIconUrl from '../assets/icon/wallet.svg?url'
import safeIconUrl from '../assets/icon/safe.svg?url'
import settingIconUrl from '../assets/icon/setting.svg?url'
import kycMenuIconUrl from '../assets/icon/KYC.svg?url'
import apiIconUrl from '../assets/icon/api-key.svg?url'
import inviteIconUrl from '../assets/icon/invites.svg?url'
import benefitsIconUrl from '../assets/icon/benefits.svg?url'

import { H5CloseIcon } from './icons/H5CloseIcon'
import { H5UserIcon } from './icons/H5UserIcon'
import { H5OrderIcon } from './icons/H5OrderIcon'
import { H5LangMiniIcon } from './icons/H5LangMiniIcon'

import h5LangStyles from './styles/h5LangPanel.module.less'
import h5MenuStyles from '../H5Menu/index.module.less'

import type { AccountMenuClickType, LangOptionWithActive, Rect, TFunc } from '@/types/dex-header'

export function UserInfoCard(props: { t: TFunc; user: any; kycStatusText: string }) {
  const { t, user, kycStatusText } = props

  const copyUID = async () => {
    const id = user?.id ?? ''
    try {
      await navigator.clipboard.writeText(String(id))
      ReactMessage.success(String(t('copySuccess') || 'Copy Success'))
    } catch {
      ReactMessage.error(String(t('copyFailed') || 'Copy Failed'))
    }
  }

  return (
    <div className="user-info-card">
      <div className="user-info-top">
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} className="avatar-icon" alt="avatar" />
          ) : (
            <img src={DefaultAvatarMini} className="avatar-icon" alt="default-avatar" />
          )}
        </div>

        <div className="user-details">
          <div className="user-nickname">{user?.nickName || user?.nick_name || ''}</div>
          <div className="user-uid-row">
            <div className="user-uid-info">
              <span className="uid-text">UID: {String(user?.id || '')}</span>
              <svg
                className="copy-icon"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={copyUID}
              >
                <path d="M9 10.5H1.5V3H9V10.5ZM11 8.5H10V2H3.5V1H11V8.5Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="user-tags">
        <div className="user-tag kyc-tag">
          <img className="tag-icon" src={kycIconUrl} />
          <span>{String(kycStatusText || '')}</span>
        </div>
      </div>
    </div>
  )
}

export function ReactAccountMenuList(props: {
  t: TFunc
  language: string
  dynamicDomain: string
  kycTagClass?: string
  kycStatusText?: string
  showKycLabel?: boolean
  onMenuClick?: (type: string) => void
}) {
  const { t, language, dynamicDomain, kycTagClass, kycStatusText, showKycLabel, onMenuClick } =
    props

  const handleMenuClick = (type: AccountMenuClickType) => {
    let url = ''
    switch (type) {
      case 'dashboard':
        url = `${dynamicDomain}/${language}/setting/dashboard`
        break
      case 'security':
        url = `${dynamicDomain}/${language}/setting/account-safe`
        break
      case 'settings':
        url = `${dynamicDomain}/${language}/setting/base`
        break
      case 'verification':
        url = `${dynamicDomain}/${language}/setting/kyc`
        break
      case 'apiKey':
        url = `${dynamicDomain}/${language}/setting/newapi`
        break
      case 'rewardsHub':
        url = `${dynamicDomain}/${language}/rewards-hub`
        break
      case 'invite':
        url = `${dynamicDomain}/${language}/activity-center/invite`
        break
    }

    if (url) {
      window.location.href = url
    }
    onMenuClick?.(type)
  }

  return (
    <div className="account-menu-list">
      <div className="account-menu-item" onClick={() => handleMenuClick('dashboard')}>
        <img className="menu-icon" src={walletIconUrl} alt="" width={24} height={24} />
        <span>{t('dashboard')}</span>
      </div>

      <div className="account-menu-item" onClick={() => handleMenuClick('security')}>
        <img className="menu-icon" src={safeIconUrl} alt="" width={24} height={24} />
        <span>{t('security')}</span>
      </div>

      <div className="account-menu-item" onClick={() => handleMenuClick('verification')}>
        <img className="menu-icon" src={kycMenuIconUrl} alt="" width={24} height={24} />
        <span>{showKycLabel ? 'KYC' : t('Verification')}</span>
        {kycTagClass && kycStatusText ? (
          <div className={kycTagClass}>{String(kycStatusText)}</div>
        ) : null}
      </div>

      <div className="account-menu-item" onClick={() => handleMenuClick('rewardsHub')}>
        <img className="menu-icon" src={benefitsIconUrl} alt="" width={24} height={24} />
        <span>{t('rewardsHub')}</span>
      </div>

      <div className="account-menu-item" onClick={() => handleMenuClick('invite')}>
        <img className="menu-icon" src={inviteIconUrl} alt="" width={24} height={24} />
        <span>{t('referral')}</span>
      </div>

      <div className="account-menu-item" onClick={() => handleMenuClick('settings')}>
        <img className="menu-icon" src={settingIconUrl} alt="" width={24} height={24} />
        <span>{t('Settings')}</span>
      </div>

      <div className="account-menu-item" onClick={() => handleMenuClick('apiKey')}>
        <img className="menu-icon" src={apiIconUrl} alt="" width={24} height={24} />
        <span>APIs</span>
      </div>
    </div>
  )
}

export function PcAccountCenter(props: {
  t: TFunc
  user: any
  kycStatusText: string
  kycTagClass?: string
  language: string
  dynamicDomain: string
  onLogout: () => void
}) {
  const { t, user, kycStatusText, kycTagClass, language, dynamicDomain, onLogout } = props

  return (
    <div className="pc-account-center">
      <UserInfoCard t={t} user={user} kycStatusText={kycStatusText} />
      <ReactAccountMenuList
        t={t}
        language={language}
        dynamicDomain={dynamicDomain}
        kycTagClass={kycTagClass}
        kycStatusText={kycStatusText}
      />
      <div className="account-logout-btn" onClick={onLogout}>
        {String(t('logout') || 'Logout')}
      </div>
    </div>
  )
}

export type PcAccountCenterDropdownProps = {
  triggerClassName: string
  userAvatarClassName: string
  avatarUrl?: string | null
  defaultAvatarUrl: string

  t: TFunc
  user: any
  kycStatusText: string
  kycTagClass?: string
  language: string
  dynamicDomain: string
  onLogout: () => void

  offset?: number
}

const OPEN_DELAY_MS = 0
const CLOSE_DELAY_MS = 100

export function PcAccountCenterDropdown(props: PcAccountCenterDropdownProps) {
  const {
    triggerClassName,
    userAvatarClassName,
    avatarUrl,
    defaultAvatarUrl,
    t,
    user,
    kycStatusText,
    kycTagClass,
    language,
    dynamicDomain,
    onLogout,
    offset = 12
  } = props

  const instanceId = useId()
  const { onHeaderRightPopoverOpen, emitHeaderRightPopoverOpen } = useEvent()
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const popperRef = useRef<HTMLDivElement | null>(null)

  const [open, setOpen] = useState(DEBUG_KEEP_ACCOUNT_CENTER_OPEN)
  const [rect, setRect] = useState<Rect | null>(null)

  const updateRect = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
      height: r.height,
      width: r.width
    })
  }

  const setOpenSafe = (next: boolean) => {
    // 调试模式下，保持打开状态
    if (DEBUG_KEEP_ACCOUNT_CENTER_OPEN && !next) {
      return
    }
    setOpen(next)
    if (next) updateRect()
  }

  const { clearTimers, scheduleOpen, scheduleClose } = useHoverTimers({
    openDelayMs: OPEN_DELAY_MS,
    closeDelayMs: CLOSE_DELAY_MS,
    onOpen: () => setOpenSafe(true),
    onClose: () => setOpenSafe(false)
  })

  // 互斥：进入另一个 popover 时立即关闭自己（无延迟），避免重叠
  useEffect(() => {
    return onHeaderRightPopoverOpen((openingId) => {
      if (openingId !== instanceId && open) {
        clearTimers()
        setOpen(false)
      }
    })
  }, [onHeaderRightPopoverOpen, instanceId, open, clearTimers])

  // 调试模式：自动打开并更新位置
  useEffect(() => {
    if (DEBUG_KEEP_ACCOUNT_CENTER_OPEN && !open) {
      setTimeout(() => {
        setOpen(true)
        updateRect()
      }, 100)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onResize = () => updateRect()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open])

  useDismiss({
    open: DEBUG_KEEP_ACCOUNT_CENTER_OPEN ? false : open,
    refs: [triggerRef, popperRef],
    beforeDismiss: clearTimers,
    onDismiss: () => setOpenSafe(false)
  })

  const defaultPopperStyle = useMemo(() => {
    if (!rect) return { display: 'none' } as React.CSSProperties
    return {
      position: 'fixed',
      top: rect.bottom + offset,
      right: 16,
      zIndex: 3000
    } satisfies React.CSSProperties
  }, [rect, offset])

  return (
    <>
      <div
        ref={triggerRef}
        className={triggerClassName}
        onMouseEnter={() => {
          emitHeaderRightPopoverOpen(instanceId)
          scheduleOpen()
        }}
        onMouseLeave={scheduleClose}
      >
        <img
          className={userAvatarClassName}
          src={(avatarUrl || '').trim() ? String(avatarUrl) : defaultAvatarUrl}
          alt=""
        />
      </div>

      {rect &&
        createPortal(
          <div
            className={`accountCenterDrop ${getHeaderThemeClassName()}`}
            style={{
              ...defaultPopperStyle,
              display: open ? undefined : 'none'
            }}
            ref={popperRef}
            onMouseEnter={() => {
              clearTimers()
              setOpenSafe(true)
            }}
            onMouseLeave={scheduleClose}
          >
            <PcAccountCenter
              t={t}
              user={user}
              kycStatusText={kycStatusText}
              kycTagClass={kycTagClass}
              language={language}
              dynamicDomain={dynamicDomain}
              onLogout={onLogout}
            />
          </div>,
          document.body
        )}
    </>
  )
}

export function H5AuthButtons(props: {
  t: TFunc
  onLogin?: () => void
  onSignup: () => void
  wrapperClassName?: string
  loginClassName?: string
  signupClassName?: string
  showLogin?: boolean // 控制是否显示登录按钮
}) {
  const {
    t,
    onLogin,
    onSignup,
    wrapperClassName,
    loginClassName,
    signupClassName,
    showLogin = false
  } = props

  return (
    <div className={wrapperClassName || 'h5-login-buttons'}>
      {showLogin && onLogin && (
        <div className={loginClassName || 'h5-login-secondary-btn'} onClick={onLogin}>
          {t('login')}
        </div>
      )}
      <div className={signupClassName || 'h5-login-primary-btn'} onClick={onSignup}>
        {t('signUp')}
      </div>
    </div>
  )
}

export function H5LangPanel(props: {
  t: TFunc
  closeIconClassName: string
  langs: LangOptionWithActive[]
  onClose: () => void
  onSelect: (key: string) => void
}) {
  const { t, langs, onClose, onSelect, closeIconClassName } = props

  useEscapeKey(true, onClose)

  return (
    <div className={h5LangStyles.langWrapper}>
      <div className={h5LangStyles.langHeader}>
        <div className={h5LangStyles.langTitle}>{t('chooseLanguage')}</div>
        <div className={h5LangStyles.langCloseBtn} onClick={onClose}>
          <H5CloseIcon className={closeIconClassName} />
        </div>
      </div>

      <div className={h5LangStyles.langList}>
        {langs.map((lang, i) => (
          <div
            key={`${lang.key}-${i}`}
            className={`${h5LangStyles.langItem} ${lang.active ? h5LangStyles.langItemActive : ''}`}
            onClick={() => onSelect(lang.key)}
          >
            {lang.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function H5BottomMenu(props: {
  accountCenterLabel: string
  ordersLabel: string
  currentLanguageLabel: string
  downloadAppLabel: string
  iconClassName: string
  onAccountCenter: () => void
  onOrders: () => void
  onShowLang: () => void
  onDownload: () => void
}) {
  const {
    accountCenterLabel,
    ordersLabel,
    currentLanguageLabel,
    downloadAppLabel,
    iconClassName,
    onAccountCenter,
    onOrders,
    onShowLang,
    onDownload
  } = props

  return (
    <div className={h5MenuStyles.h5BottomMenu}>
      <a className={h5MenuStyles.h5BottomMenuItem} onClick={onAccountCenter}>
        <H5UserIcon className={iconClassName} />
        <span>{accountCenterLabel}</span>
      </a>

      <a className={h5MenuStyles.h5BottomMenuItem} onClick={onOrders}>
        <H5OrderIcon className={iconClassName} />
        <span>{ordersLabel}</span>
      </a>

      <a className={h5MenuStyles.h5BottomMenuItem} onClick={onShowLang}>
        <H5LangMiniIcon className={iconClassName} />
        <span>{currentLanguageLabel}</span>
      </a>

      <div className={h5MenuStyles.h5DownloadBtn} onClick={onDownload}>
        {downloadAppLabel}
      </div>
    </div>
  )
}
