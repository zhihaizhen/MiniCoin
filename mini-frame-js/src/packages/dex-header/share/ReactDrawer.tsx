import React, { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ReactDrawerProps {
  open: boolean
  onClose: () => void
  size?: number | string
  children: ReactNode
  className?: string
  modalClass?: string
  showClose?: boolean
  withHeader?: boolean
}

export function ReactDrawer({
  open,
  onClose,
  size = 268,
  children,
  className = '',
  modalClass = '',
  showClose = true,
  withHeader = true
}: ReactDrawerProps) {
  const drawerRef = React.useRef<HTMLDivElement>(null)

  // 处理 ESC 关闭
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // 锁定 body 滚动
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  if (!open) return null

  const sizeValue = typeof size === 'number' ? `${size}px` : size

  return createPortal(
    <div
      className={`react-drawer-overlay ${modalClass}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        ref={drawerRef}
        className={`react-drawer-content ${className}`}
        style={{
          width: sizeValue,
          height: '100%',
          backgroundColor: 'var(--bg-secondary, #1d1d1d)',
          overflowY: 'auto',
          animation: 'slideInRight 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>,
    document.body
  )
}
