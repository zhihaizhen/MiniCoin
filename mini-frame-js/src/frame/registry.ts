import type React from 'react'

/**
 * 组件注册表：
 * - load()：按需加载组件，返回 React Component
 * - getState()：返回对外暴露给 connector 的 state（不依赖 UI 渲染）
 */
export const componentRegistry = {
  DexHeader: {
    load: async () => {
      const mod = await import('@/packages/dex-header/Index')
      return mod.DexHeaderIndex as React.ComponentType<any>
    },
    getState: async () => {
      const mod = await import('@/packages/dex-header/hooks/useDexHeader')
      return mod.getDexHeader()
    }
  },
  DexFooter: {
    load: async () => {
      const mod = await import('@/packages/dex-footer/Index')
      return mod.DexFooterIndex as React.ComponentType<any>
    },
    getState: async (props?: unknown) => {
      const p = (props ?? {}) as { type?: 'large' | 'small'; showDownloadBanner?: boolean }
      const type = p.type === 'small' ? 'small' : 'large'
      return { type, showDownloadBanner: p.showDownloadBanner ?? false }
    }
  }
} as const

export type ComponentName = keyof typeof componentRegistry
