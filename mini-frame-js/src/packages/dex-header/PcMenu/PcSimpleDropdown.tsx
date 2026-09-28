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
  DEBUG_KEEP_MORE_OPEN,
  DEBUG_KEEP_ACTIVITIES_OPEN,
  getForceDarkHeaderTheme,
  FORCE_DARK_HEADER_THEME_EVENT
} from './constants'
import type { PcSimpleDropdownProps, SimpleDropdownItem } from './types'

/** 渲染活动菜单列（带 icon + title + desc + trailingIcon + badge 的双行布局） */
function ActivityItemList({
  title,
  items,
  onItemClick
}: {
  title?: string
  items: SimpleDropdownItem[]
  onItemClick: () => void
}) {
  return (
    <>
      {title && <div className="moreDropdownSectionTitle">{title}</div>}
      <ul className="rc-menu rc-menu--popup rc-menu--popup-right-start">
        {items.map((item) => (
          <li key={item.key} className="rc-sub-menu rc-sub-menu__title" style={{ padding: 0 }}>
            <div className="subMenuTitle">
              <a className="subMenuLink" href={item.href} onClick={onItemClick}>
                <div className="subMenuTitleContent">
                  {item.iconUrl && <img src={item.iconUrl} alt="" className="subMenuIcon" />}
                  <div className="subMenuText">
                    <span>
                      {item.text}
                      {item.trailingIconUrl && (
                        <img src={item.trailingIconUrl} alt="" className="subMenuTrailingIcon" style={item.trailingIconStyle} />
                      )}
                      {item.tag && <div className="menuItemTag">{item.tag}</div>}
                      {item.badge && <span className="moreRightApiBadge">{item.badge}</span>}
                    </span>
                    {item.desc && <span>{item.desc}</span>}
                  </div>
                </div>
                <i className="rc-icon rc-sub-menu__icon-arrow subMenuChevron" aria-hidden="true">
                  <ChevronRight />
                </i>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export function PcSimpleDropdown(props: PcSimpleDropdownProps) {
  const {
    label,
    active,
    items,
    variant = 'futuresData',
    leftTitle,
    rightTitle,
    rightItems,
    rightTitle2,
    rightItems2,
    thirdTitle,
    thirdItems,
    leadingIcon,
    align,
    onOpenChange
  } = props

  const popperRef = useRef<HTMLDivElement | null>(null)
  const rightPopperRef = useRef<HTMLDivElement | null>(null)
  const thirdPopperRef = useRef<HTMLDivElement | null>(null)

  const isMore = variant === 'more'
  const isActivities = variant === 'activities'
  const isFuturesLike = variant === 'futuresData' || isMore

  const forceOpenFuturesData = variant === 'futuresData' && DEBUG_KEEP_MORE_OPEN
  const forceOpenActivities = variant === 'activities' && DEBUG_KEEP_ACTIVITIES_OPEN
  const forceOpen = (isFuturesLike && DEBUG_KEEP_MORE_OPEN) || forceOpenActivities
  const [open, setOpen] = useState<boolean>(forceOpen)

  const [leftPanelWidth, setLeftPanelWidth] = useState(0)

  // EventBus 互斥：打开时通知其他导航菜单关闭
  const menuId = useId()
  const { onNavMenuOpen, emitNavMenuOpen } = useEvent()

  const { triggerRef, rect, updateRect, mainPanelStyle } = useDropdownPosition({ open, align, panelWidth: leftPanelWidth })

  // Portal 下拉挂在 body：在“强制黑色 Header”场景下需要手动注入暗色变量（避免继承到页面浅色变量）
  const [forceDarkTheme, setForceDarkTheme] = useState<boolean>(() => getForceDarkHeaderTheme())
  const [isGlobalDark, setIsGlobalDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('theme-dark')
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
      if (openingId !== menuId && open && !forceOpen) {
        setOpen(false)
        onOpenChange?.(false)
      }
    })
  }, [menuId, open, forceOpen, onNavMenuOpen, onOpenChange])

  // 安全设置 open 状态
  const setOpenSafe = (next: boolean) => {
    // 调试模式：保持下拉打开
    if (forceOpen && !next) return
    if (next) {
      // 打开时立即通知其他导航菜单关闭
      emitNavMenuOpen(menuId)
    }
    setOpen(next)
    onOpenChange?.(next)
    if (next) updateRect()
  }

  const { clearTimers, scheduleOpen, scheduleClose } = useHoverTimers({
    openDelayMs: DROPDOWN_OPEN_DELAY_MS,
    closeDelayMs: DROPDOWN_CLOSE_DELAY_MS,
    onOpen: () => setOpenSafe(true),
    onClose: () => setOpenSafe(false)
  })

  // 关闭事件
  const hasMultiColumn = (isMore || isActivities) && (rightItems2 ?? []).length > 0
  const dismissRefs = hasMultiColumn
    ? (thirdItems ?? []).length > 0
      ? [triggerRef, popperRef, rightPopperRef, thirdPopperRef]
      : [triggerRef, popperRef, rightPopperRef]
    : [triggerRef, popperRef]
  useDismiss({
    open: forceOpen ? false : open,
    refs: dismissRefs,
    beforeDismiss: clearTimers,
    onDismiss: () => setOpenSafe(false)
  })

  // 根据 variant 获取样式类名
  const getItemClassName = (type: 'content' | 'icon' | 'text') => {
    const prefix = variant === 'activities' ? 'activities' : variant === 'earn' ? 'earn' : 'futuresData'
    const suffixMap = { content: 'ItemContent', icon: 'Icon', text: 'Text' }
    return `${prefix}${suffixMap[type]}`
  }

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

  const showMoreMulti = isMore && (rightItems2 ?? []).length > 0
  const showActivitiesDouble = isActivities && (rightItems2 ?? []).length > 0

  // 测量左侧面板宽度（用于 center-left 对齐模式下居中左侧面板）
  useEffect(() => {
    if (!open || !showActivitiesDouble) return
    const id = requestAnimationFrame(() => {
      const el = popperRef.current
      if (!el) return
      const w = el.getBoundingClientRect().width
      if (w > 0) setLeftPanelWidth(w)
    })
    return () => cancelAnimationFrame(id)
  }, [open, showActivitiesDouble])

  return (
    <>
      {/* 触发器 */}
      <div className="pcMenuTriggerArea" onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
        <PcMenuPill
          ref={triggerRef}
          active={active || open}
          leadingIcon={leadingIcon}
          trailingIcon={<DropdownArrow open={open} className="itemArrow" />}
        >
          <span>{label}</span>
        </PcMenuPill>
      </div>

      {/* 下拉面板 */}
      {portalMounted &&
        rect &&
        createPortal(
          <>
            {/* more：多列合并面板 */}
            {showMoreMulti ? (
              <div
                className={`moreDropdownCombo ${portalThemeClassName}`}
                style={{ ...mainPanelStyle, display: portalVisible ? undefined : 'none' }}
                onMouseEnter={() => {
                  clearTimers()
                  setOpenSafe(true)
                }}
                onMouseLeave={scheduleClose}
              >
                {/* 左侧：合约数据 */}
                <div ref={popperRef} className="popperBg moreDropdownComboLeft">
                  <ActivityItemList
                    title={leftTitle}
                    items={items}
                    onItemClick={() => setOpenSafe(false)}
                  />
                </div>
                {/* 中列：学院 / 机构 */}
                <div ref={rightPopperRef} className="popperSubBg moreDropdownComboRight">
                  {(rightItems ?? []).length > 0 && (
                    <ActivityItemList
                      title={rightTitle}
                      items={rightItems ?? []}
                      onItemClick={() => setOpenSafe(false)}
                    />
                  )}
                  <ActivityItemList
                    title={rightTitle2}
                    items={rightItems2 ?? []}
                    onItemClick={() => setOpenSafe(false)}
                  />
                </div>
                {/* 右列：帮助 */}
                {(thirdItems ?? []).length > 0 && (
                  <div ref={thirdPopperRef} className="popperSubBg moreDropdownComboRight">
                    <ActivityItemList
                      title={thirdTitle}
                      items={thirdItems ?? []}
                      onItemClick={() => setOpenSafe(false)}
                    />
                  </div>
                )}
              </div>
            ) : showActivitiesDouble ? (
              // activities 双列
              <div
                className={`moreDropdownCombo ${portalThemeClassName}`}
                style={{ ...mainPanelStyle, display: portalVisible ? undefined : 'none' }}
                onMouseEnter={() => {
                  clearTimers()
                  setOpenSafe(true)
                }}
                onMouseLeave={scheduleClose}
              >
                {/* 左侧：专属活动 */}
                <div ref={popperRef} className="popperBg moreDropdownComboLeft activitiesComboLeft">
                  <ActivityItemList
                    title={leftTitle}
                    items={items}
                    onItemClick={() => setOpenSafe(false)}
                  />
                </div>
                {/* 右侧：热门活动 */}
                <div
                  ref={rightPopperRef}
                  className="popperSubBg moreDropdownComboRight activitiesComboRight"
                >
                  <ActivityItemList
                    title={rightTitle2}
                    items={rightItems2 ?? []}
                    onItemClick={() => setOpenSafe(false)}
                  />
                </div>
              </div>
            ) : (
              // 默认单列
              <div
                ref={popperRef}
                className={`popperBg ${portalThemeClassName} ${
                  variant === 'activities' ? 'popperBgActivities' : ''
                } ${variant === 'spotTrade' ? 'popperBgSpotTrade' : ''} ${
                  variant === 'buyCrypto' ? 'popperBgBuyCrypto' : ''
                } ${variant === 'earn' ? 'popperBgEarn' : ''}`}
                style={{ ...mainPanelStyle, display: portalVisible ? undefined : 'none' }}
                onMouseEnter={() => {
                  clearTimers()
                  setOpenSafe(true)
                }}
                onMouseLeave={scheduleClose}
              >
                <ul className="rc-menu rc-menu--popup rc-menu--popup-right-start">
                  {items.map((item) => {
                    return (
                      <li
                        key={item.key}
                        className={item.desc && variant !== 'earn' ? 'rc-sub-menu rc-sub-menu__title' : 'rc-menu-item'}
                        style={item.desc && variant !== 'earn' ? { padding: 0 } : undefined}
                      >
                        {item.desc && variant !== 'earn' ? (
                          <div className="subMenuTitle">
                            <a
                              className="subMenuLink"
                              href={item.href}
                              onClick={() => setOpenSafe(false)}
                            >
                              <div className="subMenuTitleContent">
                                {item.iconUrl && (
                                  <img src={item.iconUrl} alt="" className="subMenuIcon" />
                                )}
                                <div className="subMenuText">
                                  <span>
                                    {item.text}
                                    {item.trailingIconUrl && (
                                      <img
                                        src={item.trailingIconUrl}
                                        alt=""
                                        className="subMenuTrailingIcon"
                                      />
                                    )}
                                    {item.tag && <span className="menuItemTag">{item.tag}</span>}
                                    {item.badge && (
                                      <span className="moreRightApiBadge">{item.badge}</span>
                                    )}
                                  </span>
                                  <span>{item.desc}</span>
                                </div>
                              </div>
                              <i className="rc-icon rc-sub-menu__icon-arrow subMenuChevron" aria-hidden="true">
                                <ChevronRight />
                              </i>
                            </a>
                          </div>
                        ) : (
                          <a
                            className="customTitle"
                            href={item.href}
                            onClick={() => setOpenSafe(false)}
                          >
                            <div className={getItemClassName('content')}>
                              {item.iconUrl && (
                                <img src={item.iconUrl} alt="" className={getItemClassName('icon')} />
                              )}
                              <div
                                style={{
                                  flex: 1,
                                  display: 'flex',
                                  flexDirection: variant === 'earn' ? 'column' : 'row',
                                  alignItems: variant === 'earn' ? 'flex-start' : 'center',
                                  gap: variant === 'earn' ? '2px' : '6px',
                                  minWidth: 0
                                }}
                              >
                                {variant === 'earn' ? (
                                  <div className="earnTitleRow">
                                    <span className={getItemClassName('text')}>{item.text}</span>
                                    {item.tag && <span className="tag">{item.tag}</span>}
                                  </div>
                                ) : (
                                  <span
                                    className={getItemClassName('text')}
                                    style={item.badge ? { flex: '0 0 auto' } : undefined}
                                  >
                                    {item.text}
                                  </span>
                                )}
                                {variant === 'earn' && item.desc && (
                                  <span className="earnItemDesc">{item.desc}</span>
                                )}
                                {item.badge && (
                                  <span className="moreRightApiBadge">{item.badge}</span>
                                )}
                              </div>
                            </div>
                            <i
                              className="rc-icon rc-sub-menu__icon-arrow customArrow"
                              aria-hidden="true"
                            >
                              <ChevronRight />
                            </i>
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </>,
          document.body
        )}
    </>
  )
}

// 导出类型
export type { PcSimpleDropdownProps, SimpleDropdownItem } from './types'
