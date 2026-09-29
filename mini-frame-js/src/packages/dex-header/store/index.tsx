import React, { createContext, useContext, useState } from 'react'

export interface BaseStore {
  isBanned: boolean
  setIsBanned: (banned: boolean) => void
}

const BaseStoreContext = createContext<BaseStore | null>(null)

/**
 * BaseStore Provider 组件
 * 用于在组件树顶层提供全局状态
 */
export function BaseStoreProvider({ children }: { children: React.ReactNode }) {
  const [isBanned, setIsBanned] = useState(false)

  const value: BaseStore = {
    isBanned,
    setIsBanned
  }

  return <BaseStoreContext.Provider value={value}>{children}</BaseStoreContext.Provider>
}

/**
 * React Hook：获取 BaseStore
 * 用于 React 组件中
 */
export function useBaseStore(): BaseStore {
  const context = useContext(BaseStoreContext)
  if (!context) {
    throw new Error('useBaseStore must be used within BaseStoreProvider')
  }
  return context
}
