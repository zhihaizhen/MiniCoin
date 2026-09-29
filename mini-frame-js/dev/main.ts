import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './global.less'

// 开发环境下加载主入口（触发 Frame 组件初始化）
if (import.meta.env.DEV) {
  import('@/main')
}

const container = document.getElementById('app')
if (container) {
  const root = createRoot(container)
  root.render(React.createElement(App))
}
