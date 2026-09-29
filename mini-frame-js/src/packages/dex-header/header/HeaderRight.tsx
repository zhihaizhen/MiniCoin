import React, { useState, useEffect } from 'react'
import {
  PcAssetsDropdown,
  PcDownloadTooltip,
  PcLangDropdown,
  PcOrderDropdown
} from '../header-right/PcRightPopovers'
import { MenuH5Icon } from '../header-right/icons/MenuH5Icon'
import {
  H5AuthButtons,
  H5BottomMenu,
  H5LangPanel,
  PcAccountCenterDropdown,
  ReactAccountMenuList,
  UserInfoCard
} from '../header-right/HeaderRightPanels'
import { H5CloseIcon } from '../header-right/icons/H5CloseIcon'
import { ReactDrawer } from '../share/ReactDrawer'
import { ReactMenuContainer } from '../Menus/ReactMenuContainer'
import { useHeaderData } from '../hooks/useHeaderData'
import { useEvent } from '../hooks/useEvent'
import { useIsMobile } from '../hooks/useIsMobile'
import { getForceDarkHeaderTheme, FORCE_DARK_HEADER_THEME_EVENT } from '../PcMenu/constants'
import { FORCE_DARK_HEADER_DATASET_KEY, setTradeTheme, getTradeTheme, TRADE_THEMES, TRADE_THEME_KEY } from '../utils/theme'
import DefaultAvatarMini from '../assets/default-avatar-mini.svg?url'
import qrcodeLogoRaw from '../assets/qrcode.svg?raw'
import { DarkIcon } from '../header-right/icons/DarkIcon'
import { LightIcon } from '../header-right/icons/LightIcon'
import styles from './index.module.less'

import type { AssetAccountType, AssetShortcutType } from '../header-right/PcRightPopovers'

const FORCE_DARK_HEADER_MODAL_CLASS = 'dex-header-force-dark'
const QRCODE_LOGO_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrcodeLogoRaw)}`

// 主题切换 icon 仅在大宗/现货/合约交易页展示，兼容带语言前缀的 URL
function isTradeThemePage(): boolean {
  if (typeof window === 'undefined') return false
  const { pathname } = window.location
  return (
    /\/tradfi\/[^/]+/.test(pathname) ||
    /\/spot\/exchange\/.+/.test(pathname) ||
    /\/trade\/[^/]+\/[^/]+/.test(pathname)
  )
}

export function HeaderRight() {
  const isMobile = useIsMobile()

  const [forceDarkHeaderFinal, setForceDarkHeaderFinal] = useState(false)
  const [assetsBalanceVisible, setAssetsBalanceVisible] = useState(true)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const sync = () => {
      const forceDataset = document.documentElement.dataset[FORCE_DARK_HEADER_DATASET_KEY] === '1'
      const forceTheme = getForceDarkHeaderTheme()
      const globalDark = document.documentElement.classList.contains('theme-dark')
      setForceDarkHeaderFinal(forceTheme || forceDataset || globalDark)
    }

    sync()

    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const FORCE_DARK_HEADER_EVENT = 'dexHeader:forceDarkChange'
    window.addEventListener(FORCE_DARK_HEADER_EVENT, sync)
    window.addEventListener(FORCE_DARK_HEADER_THEME_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      observer.disconnect()
      window.removeEventListener(FORCE_DARK_HEADER_EVENT, sync)
      window.removeEventListener(FORCE_DARK_HEADER_THEME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const {
    language,
    t,
    user,
    profileUser,
    dynamicDomain,
    showH5Drawer,
    setShowH5Drawer,
    showH5Lang,
    setShowH5Lang,
    showH5AccountCenter,
    setShowH5AccountCenter,
    showLangList,
    qrcodeDataUrl,
    preGenerateQRCode,
    getKycStatusText,
    getKycTagClass,
    handleGoLogin,
    handleOpen,
    handleLogout,
    handleOrderClick,
    handleChangeLang,
    getCurrentLanguage,
    handleGotoDownload
  } = useHeaderData()

  const accountUser = profileUser || user

  // user 三态：undefined → 登录检查中，false/null → 未登录，{...} → 已登录
  // 检查未完成前不渲染登录态相关 UI，避免"未登录 → 已登录"闪烁
  const authResolved = user !== undefined
  const isLoggedIn = !!user

  const { emitThemeChanged, onThemeChange } = useEvent()

  const [tradeTheme, setTradeThemeState] = useState<string>(() => getTradeTheme() ?? TRADE_THEMES.DARK)

  useEffect(() => {
    // 跨标签页同步
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TRADE_THEME_KEY && e.newValue) {
        setTradeThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    // 响应宿主侧主动调用 setTheme，保持图标状态同步
    const off = onThemeChange((theme) => setTradeThemeState(theme))
    return () => {
      window.removeEventListener('storage', handleStorage)
      off()
    }
  }, [onThemeChange])

  // 切换主题：持久化到 localStorage、广播变更事件通知宿主、更新本地状态
  const handleThemeToggle = () => {
    const next = tradeTheme === TRADE_THEMES.DARK ? TRADE_THEMES.LIGHT : TRADE_THEMES.DARK
    setTradeTheme(next)
    emitThemeChanged(next)
    setTradeThemeState(next)
  }

  const handleAssetShortcutSelect = (type: AssetShortcutType) => {
    if (type === 'deposit') {
      handleOpen('deposit')
      return
    }

    window.location.href = `${dynamicDomain}/${language}/assets/${type}`
  }

  const handleAssetAccountSelect = (type: AssetAccountType) => {
    const pathMap: Record<AssetAccountType, string> = {
      overview: 'overview',
      funding: 'funding-account',
      spot: 'spot-account',
      contract: 'trading-account',
      earn: 'earn-account',
      block: 'block-account',
      strategy: 'strategy-account'
    }

    window.location.href = `${dynamicDomain}/${language}/assets/${pathMap[type]}`


  }

  const [showThemeToggle, setShowThemeToggle] = useState(() => isTradeThemePage())

  useEffect(() => {
    const handleRouteChange = () => setShowThemeToggle(isTradeThemePage())

    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('locationchange', handleRouteChange)

    // 兼容 history.pushState / replaceState 触发的 SPA 跳转
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      handleRouteChange()
    }
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      handleRouteChange()
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('locationchange', handleRouteChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  return (
    <>
      {/* PC 端：等登录态确认后一次性渲染，避免图标逐个弹出导致布局跳动 */}
      {!isMobile && authResolved && (
        <div className={`${styles['right-nav']} ${styles['pc-wrapper']}`}>
          <div>
            {!isLoggedIn && (
              <>
                <span
                  className={styles['login-signup-btn']}
                  onClick={() => handleGoLogin('login')}
                >
                  {t('login')}
                </span>
                <span className={styles['login-btn']} onClick={() => handleGoLogin('signup')}>
                  {t('signUp')}
                </span>
              </>
            )}
            {isLoggedIn && (
              <span className={styles['primary-btn']} onClick={() => handleOpen('deposit')}>
                {t('depositBtn')}
              </span>
            )}
          </div>

          <span className={styles['divider-line']} />

          {isLoggedIn && (
            <PcAssetsDropdown
              triggerClassName={styles['hover-item']}
              iconClassName={styles['assets-icon']}
              t={t}
              balanceVisible={assetsBalanceVisible}
              onToggleBalanceVisible={() => setAssetsBalanceVisible((visible) => !visible)}
              onShortcutSelect={handleAssetShortcutSelect}
              onAccountSelect={handleAssetAccountSelect}
              hideBlockAccount={user?.supportBlock === false}
            />
          )}

          {isLoggedIn && (
            <PcAccountCenterDropdown
              triggerClassName={
                user?.avatar ? styles['hover-item-user-avatar'] : styles['hover-item']
              }
              userAvatarClassName={styles['user-avatar']}
              avatarUrl={user?.avatar}
              defaultAvatarUrl={DefaultAvatarMini}
              t={t}
              user={user}
              kycStatusText={getKycStatusText}
              kycTagClass={getKycTagClass}
              language={language}
              dynamicDomain={dynamicDomain}
              onLogout={handleLogout}
            />
          )}



          {isLoggedIn && (
            <PcOrderDropdown
              triggerClassName={styles['hover-item']}
              iconClassName={styles['order-icon']}
              t={t}
              onSelect={handleOrderClick}
              hideBlockOrder={user?.supportBlock === false}
            />
          )}

          <PcDownloadTooltip
            triggerClassName={styles['hover-item']}
            iconClassName={styles['download-icon']}
            t={t}
            qrcodeDataUrl={qrcodeDataUrl}
            qrcodeLogoUrl={QRCODE_LOGO_DATA_URL}
            moreClientsHref={`${dynamicDomain}/${language}/downloadApp/`}
            onPreload={preGenerateQRCode}
          />

          <PcLangDropdown
            triggerClassName={styles['hover-item']}
            iconClassName={styles['lang-icon']}
            langs={showLangList.map((l) => ({ key: l.key, label: l.label }))}
            activeKey={language}
            onSelect={handleChangeLang}
            t={t}
          />

          {showThemeToggle && (
            <div className={styles['hover-item']} onClick={handleThemeToggle}>
              {tradeTheme === TRADE_THEMES.LIGHT ? (
                <LightIcon className={styles['theme-icon']} />
              ) : (
                <DarkIcon className={styles['theme-icon']} />
              )}
            </div>
          )}
        </div>
      )}

      {/* H5 端 */}
      {isMobile && (
        <>
          <div className={`${styles['right-nav']} ${styles['h5-wrapper']}`}>
            {authResolved && !isLoggedIn && (
              <H5AuthButtons
                t={t}
                signupClassName={styles['h5-signup-btn-out']}
                onSignup={() => handleGoLogin('signup')}
              />
            )}
            <MenuH5Icon
              className={styles['menu-h5-icon']}
              onClick={() => setShowH5Drawer(true)}
            />
          </div>

          <ReactDrawer
            open={showH5Drawer}
            onClose={() => setShowH5Drawer(false)}
            className="h5-drawer"
            modalClass={forceDarkHeaderFinal ? FORCE_DARK_HEADER_MODAL_CLASS : ''}
            size="100%"
          >
            <div className={styles['h5-drawer-content']}>
              <div className={styles['h5-drawer-header']}>
                <div className={styles['h5-drawer-close']} onClick={() => setShowH5Drawer(false)}>
                  <H5CloseIcon className={styles['h5-drawer-close-icon']} />
                </div>
              </div>

              {authResolved && !isLoggedIn && (
                <H5AuthButtons
                  t={t}
                  showLogin={true}
                  wrapperClassName={styles['h5-login-buttons']}
                  loginClassName={styles['h5-login-secondary-btn']}
                  signupClassName={styles['h5-login-primary-btn']}
                  onLogin={() => handleGoLogin('login')}
                  onSignup={() => handleGoLogin('signup')}
                />
              )}

              {showH5AccountCenter && (
                <div className={styles['h5-panel-overlay']}>
                  <div className={styles['h5-panel-header']}>
                    <div className={styles['h5-panel-title']}>
                      {String(t('accountCenter') || '')}
                    </div>
                    <div
                      className={styles['h5-panel-close']}
                      onClick={() => setShowH5AccountCenter(false)}
                    >
                      <H5CloseIcon className={styles['h5-panel-close-icon']} />
                    </div>
                  </div>

                  <div className={styles['h5-panel-body']}>
                    <UserInfoCard
                      t={t}
                      user={accountUser}
                      kycStatusText={String(getKycStatusText || '')}
                    />
                    <ReactAccountMenuList
                      t={t}
                      language={language}
                      dynamicDomain={dynamicDomain}
                      kycTagClass={getKycTagClass}
                      kycStatusText={String(getKycStatusText || '')}
                      onMenuClick={() => {
                        setShowH5AccountCenter(false)
                        setShowH5Drawer(false)
                      }}
                    />
                    <div className={styles['h5-logout-btn']} onClick={handleLogout}>
                      {String(t('logout') || 'Logout')}
                    </div>
                  </div>
                </div>
              )}

              {showH5Lang && (
                <div className={styles['h5-panel-overlay']}>
                  <H5LangPanel
                    t={t}
                    closeIconClassName={styles['h5-panel-close-icon']}
                    langs={showLangList.map((l) => ({
                      key: l.key,
                      label: l.label,
                      active: l.key === language
                    }))}
                    onClose={() => setShowH5Lang(false)}
                    onSelect={(key) => {
                      handleChangeLang(key)
                      setShowH5Lang(false)
                    }}
                  />
                </div>
              )}

              <div className={styles['H5Menu-scrollable']}>
                <div className={styles['H5Menu-section']}>
                  <ReactMenuContainer language={language} t={t} />
                </div>

                <div className={styles['h5-bottom-section']}>
                  <H5BottomMenu
                    accountCenterLabel={t('accountCenter')}
                    ordersLabel={t('ordersBtn')}
                    currentLanguageLabel={getCurrentLanguage()}
                    downloadAppLabel={t('downloadApp')}
                    iconClassName={styles['social-icon']}
                    onAccountCenter={() => handleOpen('accountCenter')}
                    onOrders={() => handleOpen('orders')}
                    onShowLang={() => setShowH5Lang(true)}
                    onDownload={handleGotoDownload}
                  />
                </div>
              </div>
            </div>
          </ReactDrawer>
        </>
      )}
    </>
  )
}
