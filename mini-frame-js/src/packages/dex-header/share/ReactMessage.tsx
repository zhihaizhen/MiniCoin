import { createRoot } from 'react-dom/client'
import React, { useEffect, useState } from 'react'

interface MessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  content: string
  duration?: number
  onClose: () => void
}

function MessageComponent({ type, content, duration = 3000, onClose }: MessageProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // 等待动画结束
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  const colors = {
    success: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '-20px'})`,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'var(--bg-secondary, #1d1d1d)',
        border: `1px solid ${colors[type]}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <span
        style={{
          fontSize: '16px',
          color: colors[type],
          fontWeight: 'bold'
        }}
      >
        {icons[type]}
      </span>
      <span
        style={{
          fontSize: '14px',
          color: 'var(--text-primary, #f5f5f5)'
        }}
      >
        {content}
      </span>
    </div>
  )
}

let messageContainer: HTMLDivElement | null = null

function getMessageContainer() {
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    messageContainer.id = 'react-message-container'
    document.body.appendChild(messageContainer)
  }
  return messageContainer
}

function showMessage(type: 'success' | 'error' | 'warning' | 'info', content: string, duration?: number) {
  const container = getMessageContainer()
  const messageDiv = document.createElement('div')
  container.appendChild(messageDiv)

  const root = createRoot(messageDiv)

  const handleClose = () => {
    root.unmount()
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv)
    }
    // 如果容器为空，移除容器
    if (container.children.length === 0 && container.parentNode) {
      container.parentNode.removeChild(container)
      messageContainer = null
    }
  }

  root.render(
    React.createElement(MessageComponent, {
      type,
      content,
      duration,
      onClose: handleClose
    })
  )
}

export const ReactMessage = {
  success: (content: string, duration?: number) => showMessage('success', content, duration),
  error: (content: string, duration?: number) => showMessage('error', content, duration),
  warning: (content: string, duration?: number) => showMessage('warning', content, duration),
  info: (content: string, duration?: number) => showMessage('info', content, duration)
}

