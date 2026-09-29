import React, { useState, useEffect } from 'react'
import { Env, urlInfo } from '@region-lib/env'
import { cookie, storage, queryString, isMobile } from '@region-lib/helper'
import { useDexFooter } from '@/connector'
import styles from './index.module.less'

const { TOKEN_KEY, COOKIE_DOMAIN } = Env

interface DevHelperProps {
  children?: React.ReactNode
}

export interface DevHelperRef {
  visible: boolean
  setVisible: (v: boolean) => void
}

const DevHelper = React.forwardRef<DevHelperRef, DevHelperProps>(({ children }, ref) => {
  const [env, setEnv] = useState(urlInfo.envName)
  const [theme, setTheme] = useState('')
  const [token, setToken] = useState({
    test1: '',
    test2: '',
    testnet: '',
    www: ''
  })
  const [visible, setVisible] = useState(false)
  const [footerType, setFooterType] = useState<'none' | 'large' | 'small'>('none')

  const { createDexFooter, removeDexFooter } = useDexFooter()

  // 暴露给父组件的方法
  React.useImperativeHandle(ref, () => ({
    visible,
    setVisible
  }))

  function onThemeChange(value: string) {
    document.documentElement.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-ui-dex',
      'theme-ui-light'
    )
    document.documentElement.classList.add(...value.split(' '))
    storage.set('@global-widget/devHelper:theme', value)
    setTheme(value)
  }

  function onTokenChange(value: string) {
    cookie.set(TOKEN_KEY, value, { domain: COOKIE_DOMAIN })
    setToken((prev) => ({ ...prev, [env]: value }))
  }

  function onEnvChange(value: string) {
    const devHost = {
      test1: 'http://www.test-better-1.betterbitfinance.com',
      test2: 'http://www.test-better-2.betterbitfinance.com',
      testnet: 'https://www.testnet.betterbitfinance.com',
      www: 'https://www.betterbitfinance.com'
    }[value]
    storage.set('@region-lib/env:devHost', devHost)
    location.reload()
  }

  useEffect(() => {
    // init token
    setToken((prev) => ({ ...prev, [env]: cookie.get(TOKEN_KEY) || '' }))

    // init theme
    const savedTheme =
      storage.get('@global-widget/devHelper:theme') ||
      (document.documentElement.classList.contains('theme-dark')
        ? 'theme-dark theme-ui-dex'
        : 'theme-light theme-ui-light')
    onThemeChange(savedTheme)
  }, [])

  async function toggleFooter(type: 'large' | 'small') {
    try {
      // 如果点击同一个类型则卸载
      if (footerType === type) {
        await removeDexFooter()
        setFooterType('none')
        return
      }
      // 切换类型：先卸载已有，再创建新的
      await removeDexFooter()
      await createDexFooter({ elementId: 'DexFooter', props: { type } })
      setFooterType(type)
    } catch (error) {
      console.error('toggle footer failed', error)
    }
  }

  return (
    <>
      <div className={styles.switch} onClick={() => setVisible(true)}>
        🛠
      </div>

      {visible && (
        <div
          className={styles.drawerOverlay}
          onClick={(e) => e.target === e.currentTarget && setVisible(false)}
        >
          <div
            className={styles.drawer}
            style={{ width: isMobile() ? '100%' : '400px' }}
            role="dialog"
            aria-label="Dev"
          >
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>DevTool</div>
              <button
                className={styles.drawerClose}
                type="button"
                onClick={() => setVisible(false)}
                aria-label="close Dev"
              >
                X
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.set}>
                <div className={styles.title}>Env</div>
                <select
                  value={env}
                  className={styles.control}
                  onChange={(e) => {
                    setEnv(e.target.value)
                    onEnvChange(e.target.value)
                  }}
                >
                  <option value="test1">test1</option>
                  <option value="test2">test2</option>
                  <option value="testnet">testnet</option>
                  <option value="www">prod</option>
                </select>
              </div>

              <div className={styles.set}>
                <div className={styles.title}>Auth Token</div>
                <input
                  value={token[env as keyof typeof token] || ''}
                  className={styles.control}
                  type="text"
                  placeholder="复制 auth_token cookie 到这"
                  onChange={(e) => onTokenChange(e.target.value)}
                />
              </div>

              <div className={styles.set}>
                <div className={styles.title}>Theme</div>
                <select
                  value={theme}
                  className={styles.control}
                  onChange={(e) => onThemeChange(e.target.value)}
                >
                  <option value="theme-light theme-ui-light">浅色</option>
                  <option value="theme-dark theme-ui-dex">深色</option>
                </select>
              </div>

              <div className={styles.set}>
                <div className={styles.title}>Dex Footer</div>
                <div className={styles.btnRow}>
                  <button
                    type="button"
                    className={`${styles.btn} ${footerType === 'large' ? styles.active : ''}`}
                    onClick={() => toggleFooter('large')}
                  >
                    Large Footer {footerType === 'large' ? '(on)' : ''}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${footerType === 'small' ? styles.active : ''}`}
                    onClick={() => toggleFooter('small')}
                  >
                    Small Footer {footerType === 'small' ? '(on)' : ''}
                  </button>
                </div>
              </div>

              {children}
            </div>
          </div>
        </div>
      )}
    </>
  )
})

DevHelper.displayName = 'DevHelper'

export default DevHelper
