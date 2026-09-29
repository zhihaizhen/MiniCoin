import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDismiss } from '../hooks/useDismiss'
import { useHoverTimers } from '../hooks/useHoverTimers'
import { useEvent } from '../hooks/useEvent'

import type { HeaderRightHoverPopoverProps, Rect } from '@/types/dex-header'

export function HeaderRightHoverPopover(props: HeaderRightHoverPopoverProps) {
  const {
    triggerClassName,
    trigger,
    popperClassName,
    offset = 12,
    debugKeepOpen = false,
    openDelayMs = 0,
    closeDelayMs = 100,
    onBeforeOpen,
    popperStyle,
    onPopperClickCapture,
    children
  } = props

  const instanceId = useId()
  const { onHeaderRightPopoverOpen, emitHeaderRightPopoverOpen } = useEvent()
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const popperRef = useRef<HTMLDivElement | null>(null)

  const [open, setOpen] = useState<boolean>(debugKeepOpen)
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
    if (debugKeepOpen && !next) return
    setOpen(next)
    if (next) updateRect()
  }

  const { clearTimers, scheduleOpen, scheduleClose } = useHoverTimers({
    openDelayMs,
    closeDelayMs,
    onOpen: () => {
      onBeforeOpen?.()
      setOpenSafe(true)
    },
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
    if (debugKeepOpen && !open) {
      setTimeout(() => {
        setOpen(true)
        updateRect()
      }, 100)
    }
  }, [debugKeepOpen, open])

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
    open: debugKeepOpen ? false : open,
    refs: [triggerRef, popperRef],
    beforeDismiss: clearTimers,
    onDismiss: () => setOpenSafe(false)
  })

  // Portal 一旦打开就保持挂载：避免 hover 频繁挂载/卸载导致闪烁、图片重复请求等
  const portalVisible = open && rect
  const [portalMounted, setPortalMounted] = useState(false)
  useEffect(() => {
    if (portalVisible) setPortalMounted(true)
  }, [portalVisible])

  const defaultPopperStyle = useMemo(() => {
    if (!rect) return { display: 'none' } as React.CSSProperties
    return {
      position: 'fixed',
      top: rect.bottom + offset,
      right: 16,
      zIndex: 3000
    } satisfies React.CSSProperties
  }, [rect, offset])

  const api = useMemo(
    () => ({
      open,
      close: () => setOpenSafe(false)
    }),
    [open]
  )

  const content =
    typeof children === 'function'
      ? (children as (api: { open: boolean; close: () => void }) => React.ReactNode)(api)
      : children

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
        {trigger}
      </div>

      {portalMounted &&
        rect &&
        createPortal(
          <div
            className={popperClassName}
            style={{
              ...defaultPopperStyle,
              ...popperStyle,
              display: portalVisible ? undefined : 'none'
            }}
            ref={popperRef}
            onClickCapture={onPopperClickCapture}
            onMouseEnter={() => {
              clearTimers()
              setOpenSafe(true)
            }}
            onMouseLeave={scheduleClose}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  )
}
