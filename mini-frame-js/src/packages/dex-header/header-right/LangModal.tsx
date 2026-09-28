import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

import type { LangOption, TFunc } from '@/types/dex-header'
import closeIconUrl from '../assets/icon/close.svg?url'
import styles from './styles/langModal.module.less'
import { getExchangeRate } from '@/api/dex'
import { useEvent } from '../hooks/useEvent'

export type LangModalProps = {
  open: boolean
  onClose: () => void
  langs: LangOption[]
  activeKey: string
  onSelect: (key: string) => void
  t: TFunc
}

type TabKey = 'lang' | 'currency'

interface CurrencyOption {
  symbol: string
  fiatSymbol: string
}

const CURRENCY_STORAGE_KEY = 'CURRENCY_CODE'

export function LangModal({ open, onClose, langs, activeKey, onSelect, t }: LangModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('lang')
  const [currencyList, setCurrencyList] = useState<CurrencyOption[]>([])
  const [currency, setCurrency] = useState(
    () => localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD'
  )
  const fetchedRef = useRef(false)

  const fetchCurrencyList = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    try {
      const { list } = await getExchangeRate()
      setCurrencyList(
        list.map((item) => ({
          symbol: item.symbol,
          fiatSymbol: item.fiatSymbol
        }))
      )
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      fetchedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (open) fetchCurrencyList()
  }, [open, fetchCurrencyList])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setActiveTab('lang')
      setCurrency(localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD')
    }
  }, [open])

  const { emitCurrencyChanged, onCurrencyChange } = useEvent()

  useEffect(() => {
    return onCurrencyChange((value: string) => {
      setCurrency(value)
    })
  }, [onCurrencyChange])

  // 切换计价货币：更新状态、持久化到 localStorage、广播变更事件并关闭弹窗
  const handleCurrencyChange = useCallback(
    (value: string) => {
      setCurrency(value)
      localStorage.setItem(CURRENCY_STORAGE_KEY, value)
      emitCurrencyChanged(value)
      onClose()
    },
    [onClose, emitCurrencyChanged]
  )

  if (!open) return null

  return createPortal(
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 头部：Tabs + 关闭 */}
        <div className={styles.head}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${activeTab === 'lang' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('lang')}
            >
              {t('languageAndRegion')}
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'currency' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('currency')}
            >
              {t('currencyTab')}
            </div>
          </div>
          <div className={styles.closeBtn} onClick={onClose}>
            <img src={closeIconUrl} width={20} height={20} alt="" />
          </div>
        </div>

        {/* 语言 Tab */}
        {activeTab === 'lang' && (
          <div className={styles.langGrid}>
            {langs.map((lang) => (
              <div
                key={lang.key}
                className={`${styles.langItem} ${
                  activeKey === lang.key ? styles.langItemActive : ''
                }`}
                onClick={() => {
                  onSelect(lang.key)
                  onClose()
                }}
              >
                {lang.label}
              </div>
            ))}
          </div>
        )}

        {/* 币种 Tab */}
        {activeTab === 'currency' && (
          <div className={styles.langGrid}>
            {currencyList.map((item) => (
              <div
                key={item.symbol}
                className={`${styles.langItem} ${
                  currency === item.symbol ? styles.langItemActive : ''
                }`}
                onClick={() => handleCurrencyChange(item.symbol)}
              >
                {item.symbol} - {item.fiatSymbol}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
