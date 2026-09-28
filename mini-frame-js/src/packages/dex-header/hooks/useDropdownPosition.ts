import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Rect } from '../PcMenu/types'
import { DROPDOWN_Z_INDEX, SUB_PANEL_GAP } from '../PcMenu/constants'

export type DropdownAlign = 'left' | 'center' | 'center-left'

interface UseDropdownPositionOptions {
  open: boolean
  align?: DropdownAlign
  /** center-left 模式下需要居中的左侧面板宽度 */
  panelWidth?: number
}

/**
 * 下拉菜单定位 Hook
 * 处理触发元素的位置追踪和下拉面板的定位计算
 */
export function useDropdownPosition({ open, align = 'left', panelWidth }: UseDropdownPositionOptions) {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [headerBottom, setHeaderBottom] = useState<number | null>(null)

  // 更新触发元素位置
  const updateRect = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ left: r.left, top: r.top, width: r.width, height: r.height })

    // 以 Header 最底部作为下拉对齐基准（与右侧 icon 下拉一致）
    const headerEl = el.closest('.dex-header-root') as HTMLElement | null
    if (headerEl) {
      const hr = headerEl.getBoundingClientRect()
      setHeaderBottom(hr.bottom)
    } else {
      setHeaderBottom(null)
    }
  }, [])

  // 监听窗口变化
  useEffect(() => {
    if (!open) return

    const handleResize = () => updateRect()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [open, updateRect])

  // 主面板样式
  const mainPanelStyle = useMemo((): React.CSSProperties => {
    if (!rect) return { display: 'none' }
    const top = headerBottom ?? rect.top + rect.height + 1
    const triggerCenter = rect.left + rect.width / 2

    if (align === 'center') {
      return {
        position: 'fixed',
        left: triggerCenter,
        transform: 'translateX(-50%)',
        top,
        zIndex: DROPDOWN_Z_INDEX
      }
    }

    if (align === 'center-left') {
      if (panelWidth && panelWidth > 0) {
        return {
          position: 'fixed',
          left: triggerCenter - panelWidth / 2,
          top,
          zIndex: DROPDOWN_Z_INDEX
        }
      }
      return {
        position: 'fixed',
        left: triggerCenter,
        transform: 'translateX(-50%)',
        top,
        zIndex: DROPDOWN_Z_INDEX
      }
    }

    return {
      position: 'fixed',
      left: rect.left,
      top,
      zIndex: DROPDOWN_Z_INDEX
    }
  }, [rect, headerBottom, align, panelWidth])

  // 子面板样式（用于合约交易的币对列表）
  const getSubPanelStyle = useCallback(
    (mainWidth: number): React.CSSProperties => {
      if (!rect) return { display: 'none' }
      return {
        position: 'fixed',
        left: rect.left + mainWidth + SUB_PANEL_GAP,
        top: headerBottom ?? rect.top + rect.height + 1,
        zIndex: DROPDOWN_Z_INDEX,
        height: 520
      }
    },
    [rect, headerBottom]
  )

  return {
    triggerRef,
    rect,
    updateRect,
    mainPanelStyle,
    getSubPanelStyle
  }
}
