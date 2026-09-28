import React, { Suspense } from 'react'
import { ReactMenuContainer } from '../Menus/ReactMenuContainer'
import { useLanguage, useLanguageValue } from '../hooks/useLanguage'
import { useIsMobile } from '../hooks/useIsMobile'
import { getForceDarkHeaderTheme, FORCE_DARK_HEADER_THEME_EVENT } from '../PcMenu/constants'
import { FORCE_DARK_HEADER_DATASET_KEY } from '../utils/theme'
import { dynamicDomain } from '../constants/menus'
import styles from './index.module.less'

const FORCE_DARK_HEADER_EVENT = 'dexHeader:forceDarkChange'
const FORCE_DARK_HEADER_MODAL_CLASS = 'dex-header-force-dark'

const LazyHeaderRight = React.lazy(() =>
  import('./HeaderRight').then((mod) => ({ default: mod.HeaderRight }))
)

export function Header() {
  const isMobile = useIsMobile()
  const language = useLanguageValue()
  const { t } = useLanguage()

  const [forceDarkHeader, setForceDarkHeader] = React.useState(false)
  const [isGlobalDark, setIsGlobalDark] = React.useState(true)
  const [forceDarkTheme, setForceDarkTheme] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return

    const getForce = () => document.documentElement.dataset[FORCE_DARK_HEADER_DATASET_KEY] === '1'
    const getGlobal = () => document.documentElement.classList.contains('theme-dark')

    setForceDarkHeader(getForce())
    setIsGlobalDark(getGlobal())

    const handleForceChange = () => {
      setForceDarkHeader(getForce())
    }

    const observer = new MutationObserver(() => {
      setIsGlobalDark(getGlobal())
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    window.addEventListener(FORCE_DARK_HEADER_EVENT, handleForceChange)
    return () => {
      observer.disconnect()
      window.removeEventListener(FORCE_DARK_HEADER_EVENT, handleForceChange)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = () => setForceDarkTheme(getForceDarkHeaderTheme())
    sync()
    window.addEventListener(FORCE_DARK_HEADER_THEME_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(FORCE_DARK_HEADER_THEME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const forceDarkHeaderFinal = forceDarkTheme || forceDarkHeader
  const headerThemeClass =
    forceDarkHeaderFinal || isGlobalDark ? 'header-theme-dark' : 'header-theme-light'

  return (
    <div
      className={`${styles['dex-header']} dex-header-root ${headerThemeClass} ${
        forceDarkHeaderFinal ? FORCE_DARK_HEADER_MODAL_CLASS : ''
      }`}
    >
      <div className={styles['home-header']}>
        {/* 左侧：Logo + 导航菜单，同步渲染，不依赖任何异步数据 */}
        <div className={styles['home-header-left']}>
          <a className={styles.logo} href={`${dynamicDomain || ''}/${language}/`}>
            <img src="/static/image/header/brand.svg" width={143} height={34} alt="" />
          </a>
          {!isMobile && (
            <div className={styles['left-nav']}>
              <ReactMenuContainer language={language} t={t} />
            </div>
          )}
        </div>

        {/* 右侧：用户态/下载/订单/多语言，延迟加载 */}
        <div className={styles['home-header-right']}>
          <Suspense fallback={null}>
            <LazyHeaderRight />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
