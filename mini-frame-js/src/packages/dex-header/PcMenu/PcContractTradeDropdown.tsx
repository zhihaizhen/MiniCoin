import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDismiss } from '../hooks/useDismiss'
import { useHoverTimers } from '../hooks/useHoverTimers'
import { useDropdownPosition } from '../hooks/useDropdownPosition'
import { useEvent } from '../hooks/useEvent'
import { DropdownArrow, ChevronRight } from './icons'
import { PcMenuPill } from './PcMenuPill'
import {
  DROPDOWN_OPEN_DELAY_MS,
  DROPDOWN_CLOSE_DELAY_MS,
  DEBUG_KEEP_DROPDOWN_OPEN,
  DEBUG_DEFAULT_ACTIVE_KEY,
  getForceDarkHeaderTheme,
  FORCE_DARK_HEADER_THEME_EVENT
} from './constants'
import type { PcContractTradeDropdownProps, ContractMenuEntry } from './types'

function ContractEntryItem({
  entry,
  activeKey,
  onHover,
  onClose
}: {
  entry: ContractMenuEntry
  activeKey: ContractMenuEntry['key'] | null
  onHover: (key: ContractMenuEntry['key']) => void
  onClose: () => void
}) {
  return (
    <li
      className={`rc-sub-menu rc-sub-menu__title ${
        activeKey === entry.key ? 'contract-item-active' : ''
      } ${
        DEBUG_KEEP_DROPDOWN_OPEN && activeKey === entry.key ? 'debug-active-item' : ''
      }`}
      style={{ padding: 0 }}
      onMouseEnter={() => {
        if (DEBUG_KEEP_DROPDOWN_OPEN) return
        onHover(entry.key)
      }}
    >
      <div className="subMenuTitle">
        <a
          className="subMenuLink"
          href={entry.href}
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        >
          <div className="subMenuTitleContent">
            <img src={entry.iconUrl} alt="" className="subMenuIcon" />
            <div className="subMenuText">
              <span>
                {entry.title}
                {entry.trailingIconUrl && (
                  <img src={entry.trailingIconUrl} alt="" className="subMenuTrailingIcon" />
                )}
                {entry.badge && <span className="moreRightApiBadge">{entry.badge}</span>}
              </span>
              <span>{entry.desc}</span>
            </div>
          </div>
          {entry.key !== 'linearPerpetualList' && (
            <i className="rc-icon rc-sub-menu__icon-arrow subMenuChevron" aria-hidden="true">
              <ChevronRight />
            </i>
          )}
        </a>
      </div>
    </li>
  )
}

export function PcContractTradeDropdown(props: PcContractTradeDropdownProps) {
  const { label, active, entries, symbols, searchIconUrl, searchPlaceholder, align, onOpenChange } = props

  const [open, setOpen] = useState(DEBUG_KEEP_DROPDOWN_OPEN)

  // EventBus 互斥：打开时通知其他导航菜单关闭
  const menuId = useId()
  const { onNavMenuOpen, emitNavMenuOpen } = useEvent()

  const [mainWidth, setMainWidth] = useState(320)
  // Portal 下拉挂在 body：在“强制黑色 Header”场景下需要手动注入暗色变量（避免继承到页面浅色变量）
  const [forceDarkTheme, setForceDarkTheme] = useState<boolean>(() => getForceDarkHeaderTheme())
  const [isGlobalDark, setIsGlobalDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('theme-dark')
  })
  // 非调试模式下：默认不展示二级菜单（只有 hover 到 USDT永续时才展示）
  const [activeKey, setActiveKey] = useState<ContractMenuEntry['key'] | null>(
    DEBUG_KEEP_DROPDOWN_OPEN ? DEBUG_DEFAULT_ACTIVE_KEY : null
  )
  const [query, setQuery] = useState('')

  const mainPopperRef = useRef<HTMLDivElement | null>(null)
  const subPopperRef = useRef<HTMLDivElement | null>(null)
  const comboWrapperRef = useRef<HTMLDivElement | null>(null)

  const { triggerRef, rect, updateRect, mainPanelStyle, getSubPanelStyle } = useDropdownPosition({
    open,
    align,
    panelWidth: mainWidth
  })

  useEffect(() => {
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

  useEffect(() => {
    if (typeof document === 'undefined') return
    const getGlobal = () => document.documentElement.classList.contains('theme-dark')
    setIsGlobalDark(getGlobal())
    const observer = new MutationObserver(() => setIsGlobalDark(getGlobal()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // EventBus 互斥：收到其他菜单打开事件时立即关闭自己
  useEffect(() => {
    return onNavMenuOpen((openingId) => {
      if (openingId !== menuId && open && !DEBUG_KEEP_DROPDOWN_OPEN) {
        setOpen(false)
        onOpenChange?.(false)
        setQuery('')
        setActiveKey(null)
      }
    })
  }, [menuId, open, onNavMenuOpen, onOpenChange])

  // 安全设置 open 状态
  const setOpenSafe = (next: boolean) => {
    // 调试模式下，保持打开状态
    if (DEBUG_KEEP_DROPDOWN_OPEN && !next) {
      return
    }
    if (next) {
      // 打开时立即通知其他导航菜单关闭
      emitNavMenuOpen(menuId)
    }
    setOpen(next)
    onOpenChange?.(next)
    if (next) {
      updateRect()
      // 默认高亮第一项
      if (!DEBUG_KEEP_DROPDOWN_OPEN) {
        setActiveKey(entries[0]?.key ?? null)
      }
    }
    if (!next) {
      setQuery('')
      setActiveKey(null)
    }
  }

  // 调试模式：自动打开下拉框并更新位置
  useEffect(() => {
    if (DEBUG_KEEP_DROPDOWN_OPEN) {
      // 添加调试模式的 CSS class
      document.body.classList.add('debug-dropdown-open')

      // 确保激活指定的子菜单
      if (activeKey !== DEBUG_DEFAULT_ACTIVE_KEY) {
        setActiveKey(DEBUG_DEFAULT_ACTIVE_KEY)
      }

      if (!open) {
        setTimeout(() => {
          setOpen(true)
          updateRect()
        }, 100)
      }
    } else {
      // 移除调试模式的 CSS class
      document.body.classList.remove('debug-dropdown-open')
    }

    return () => {
      if (DEBUG_KEEP_DROPDOWN_OPEN) {
        document.body.classList.remove('debug-dropdown-open')
      }
    }
  }, [DEBUG_KEEP_DROPDOWN_OPEN, open, activeKey])

  const { clearTimers, scheduleOpen, scheduleClose } = useHoverTimers({
    openDelayMs: DROPDOWN_OPEN_DELAY_MS,
    closeDelayMs: DROPDOWN_CLOSE_DELAY_MS,
    onOpen: () => setOpenSafe(true),
    onClose: () => setOpenSafe(false)
  })

  // hover 到「USDT 永续」时展示右侧币对列表；hover 股票/模拟时保持单列样式
  const showUsdtSymbolsPanel = activeKey === 'linearPerpetualList'

  const tradeEntries = useMemo(() => entries.filter((e) => !e.section || e.section === 'trade'), [entries])
  const exploreEntries = useMemo(() => entries.filter((e) => e.section === 'explore'), [entries])

  // 关闭事件（调试模式下禁用）
  useDismiss({
    open: DEBUG_KEEP_DROPDOWN_OPEN ? false : open,
    // 统一把 wrapper 也计入，避免 hover 切换样式时误判 outside
    refs: [triggerRef, comboWrapperRef, mainPopperRef, subPopperRef],
    beforeDismiss: clearTimers,
    onDismiss: () => setOpenSafe(false)
  })

  // 测量主面板宽度
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => {
      const el = mainPopperRef.current
      if (!el) return
      const w = el.getBoundingClientRect().width
      if (w > 0) setMainWidth(w)
    })
    return () => cancelAnimationFrame(id)
  }, [open, entries.length])

  // 过滤币对
  const filteredSymbols = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return symbols
    return symbols.filter((s) => s.symbolName.toLowerCase().includes(q))
  }, [symbols, query])

  const subPanelStyle = getSubPanelStyle(mainWidth)
  // Portal 保持挂载：避免每次 hover 都重新挂载图片导致频繁请求（dev 环境常见 no-cache）
  const [portalMounted, setPortalMounted] = useState(false)
  const portalVisible = open && rect
  useEffect(() => {
    if (portalVisible) setPortalMounted(true)
  }, [portalVisible])
  const portalThemeClassName = forceDarkTheme
    ? 'dex-header-force-dark header-theme-dark'
    : isGlobalDark
    ? 'header-theme-dark'
    : 'header-theme-light'

  return (
    <>
      {/* 触发器 */}
      <div className="pcMenuTriggerArea" onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
        <PcMenuPill
          ref={triggerRef}
          active={active || open}
          trailingIcon={<DropdownArrow open={open} className="itemArrow" />}
        >
          <span>{label}</span>
        </PcMenuPill>
      </div>

      {/* 下拉面板 */}
      {portalMounted &&
        rect &&
        createPortal(
          <div style={{ display: portalVisible ? undefined : 'none' }}>
            {/* 合约交易下拉：左侧列表始终渲染；仅在 hover「USDT 永续」时展示右侧币对列表 */}
            <div
              ref={comboWrapperRef}
              className={`${portalThemeClassName} ${
                showUsdtSymbolsPanel ? 'contractTradeCombo' : ''
              }`}
              style={mainPanelStyle}
              onMouseEnter={() => {
                clearTimers()
                setOpenSafe(true)
              }}
              onMouseLeave={scheduleClose}
            >
              {/* 左侧 - 菜单列表（单列样式/合并样式共用同一份 DOM，避免 hover 切换时丢点击） */}
              <div
                ref={mainPopperRef}
                className={`popperBg popperBgContract ${showUsdtSymbolsPanel ? 'contractTradeComboLeft' : ''}`}
              >
                {tradeEntries.length > 0 && (
                  <>
                    <div className="contractSectionTitle">{props.tradeSectionTitle ?? '交易'}</div>
                    <ul className="rc-menu rc-menu--popup rc-menu--popup-right-start">
                      {tradeEntries.map((entry) => (
                        <ContractEntryItem
                          key={entry.key}
                          entry={entry}
                          activeKey={activeKey}
                          onHover={setActiveKey}
                          onClose={() => setOpenSafe(false)}
                        />
                      ))}
                    </ul>
                  </>
                )}
                {exploreEntries.length > 0 && (
                  <>
                    <div className="contractSectionTitle">{props.exploreSectionTitle ?? '探索'}</div>
                    <ul className="rc-menu rc-menu--popup rc-menu--popup-right-start">
                      {exploreEntries.map((entry) => (
                        <ContractEntryItem
                          key={entry.key}
                          entry={entry}
                          activeKey={activeKey}
                          onHover={setActiveKey}
                          onClose={() => setOpenSafe(false)}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* 右侧 - 币对列表：仅在 hover USDT 永续时显示 */}
              <div
                ref={subPopperRef}
                className={`popperSubBg contractTradeComboRight`}
                style={{ display: showUsdtSymbolsPanel ? undefined : 'none' }}
              >
                <div className="coinList">
                  {/* 搜索框 */}
                  <div className="rc-input rc-input-group rc-input-group--prepend searchInp">
                    <div className="input-group__prepend">
                      <img src={searchIconUrl} alt="search" />
                    </div>
                    <input
                      className="input-inner"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                    />
                  </div>

                  {/* 币对列表 */}
                  <div className="coinListScroll">
                    <ul>
                      {filteredSymbols.map((symbol) => (
                        <li key={symbol.symbolName} className="rc-menu-item">
                          <a
                            className="subMenuLink"
                            href={symbol.href}
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenSafe(false)
                            }}
                          >
                            <img
                              className="coinIcon"
                              loading="lazy"
                              src={symbol.iconUrl}
                              alt={symbol.symbolName}
                            />
                            {symbol.symbolName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

// 导出类型
export type { ContractMenuEntry, ContractSymbol, PcContractTradeDropdownProps } from './types'
