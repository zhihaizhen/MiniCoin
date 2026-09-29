import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { isApp } from '@/utils'
import { CookieBanner } from './CookieBanner'
import { CookieSettings } from './CookieSettings'

const STORAGE_KEY = 'easicoin_cookie_consent'
const ANIMATION_DURATION = 300

type ConsentValue = 'all' | 'rejected' | 'custom'

function getConsent(): ConsentValue | null {
  try {
    const val = window.localStorage.getItem(STORAGE_KEY)
    if (val === 'all' || val === 'rejected' || val === 'custom') return val
    return null
  } catch {
    return null
  }
}

function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {}
}

function waitForPageReady(): Promise<void> {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true })
  })
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [closingBanner, setClosingBanner] = useState(false)
  const [closingSettings, setClosingSettings] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (getConsent() !== null) return

    let cancelled = false
    waitForPageReady().then(() => {
      if (!cancelled) setVisible(true)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const dismiss = useCallback((value: ConsentValue) => {
    setClosingBanner(true)
    if (showSettings) setClosingSettings(true)
    timerRef.current = setTimeout(() => {
      setConsent(value)
      setVisible(false)
    }, ANIMATION_DURATION)
  }, [showSettings])

  if (!visible) return null

  const handleAcceptAll = () => dismiss('all')
  const handleRejectAll = () => dismiss('rejected')
  const handleSave = () => dismiss('custom')

  const handleOpenSettings = () => setShowSettings(true)

  const handleCloseSettings = () => {
    setClosingSettings(true)
    timerRef.current = setTimeout(() => {
      setClosingSettings(false)
      setShowSettings(false)
    }, ANIMATION_DURATION)
  }

  return (
    <>
      <CookieBanner
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
        onOpenSettings={handleOpenSettings}
        closing={closingBanner}
      />
      {showSettings && (
        <CookieSettings onSave={handleSave} onClose={handleCloseSettings} closing={closingSettings} />
      )}
    </>
  )
}

const MOUNT_ID = '__cookie-consent-root__'

export function mountCookieConsent() {
  // app不显示cookie弹框
  if (isApp()) return
  if (document.getElementById(MOUNT_ID)) return
  const el = document.createElement('div')
  el.id = MOUNT_ID
  document.body.appendChild(el)
  createRoot(el).render(React.createElement(CookieConsent))
}
