import React, { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ReactDialogProps {
  open: boolean
  onClose: () => void
  width?: number | string
  children: ReactNode
  className?: string
  title?: string
  showClose?: boolean
}

export function ReactDialog({
  open,
  onClose,
  width = 520,
  children,
  className = '',
  title,
  showClose = true
}: ReactDialogProps) {
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

  const widthValue = typeof width === 'number' ? `${width}px` : width

  return createPortal(
    <div
      className={`react-dialog-overlay ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        className={`react-dialog-content ${className}`}
        style={{
          width: widthValue,
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-secondary, #1d1d1d)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'dialogFadeIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--line-border-default, #28292A)'
            }}
          >
            {title && (
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F5F5)'
                }}
              >
                {title}
              </div>
            )}
            {showClose && (
              <div
                onClick={onClose}
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary, #999)',
                  fontSize: '20px',
                  marginLeft: 'auto'
                }}
              >
                ×
              </div>
            )}
          </div>
        )}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes dialogFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  )
}
