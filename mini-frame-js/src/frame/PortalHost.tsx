/**
 * PortalHost —— 共享 React 树的宿主组件
 *
 * 架构：整个 Frame 只创建一个 React Root，所有业务组件通过 Portal
 * 渲染到各自的 DOM 容器中，从而共享同一棵 React 树的 Context。
 *
 * 对外暴露 PortalHostHandle（add / remove），由 createFrameApi 持有，
 * 命令式地驱动 Portal 的增删。
 */

import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ComponentName } from './registry'

export interface PortalEntry {
  elementId: string
  componentName: ComponentName
  Comp: React.ComponentType<any>
  props: unknown
  /** Portal 渲染的目标 DOM 节点 */
  mountPoint: HTMLElement
  /** 组件首次 DOM 渲染完成后的回调（用于精准移除 skeleton） */
  onRendered: () => void
}

export interface PortalHostHandle {
  add: (entry: PortalEntry) => void
  remove: (elementId: string) => void
}

/**
 * 包装组件：借助 useEffect 在首次渲染后触发 onRendered，
 * 让调用方得到"组件已实际挂载到 DOM"的精确时机。
 */
function PortalItem({ Comp, props, onRendered }: {
  Comp: React.ComponentType<any>
  props: any
  onRendered: () => void
}) {
  useEffect(() => { onRendered() }, [])
  return React.createElement(Comp, props)
}

/**
 * 宿主组件：通过 state 维护 elementId → PortalEntry 映射，
 * 每个 entry 经 createPortal 渲染到对应的业务容器节点。
 *
 * onMount 在首次渲染后将 add/remove handle 交给外部（createFrameApi），
 * 后续由外部命令式调用来增删 Portal。
 */
export function PortalHost({ onMount }: { onMount: (handle: PortalHostHandle) => void }) {
  const [portals, setPortals] = useState<Map<string, PortalEntry>>(new Map())

  const add = useCallback((entry: PortalEntry) => {
    setPortals((prev) => new Map(prev).set(entry.elementId, entry))
  }, [])

  const remove = useCallback((elementId: string) => {
    setPortals((prev) => {
      const next = new Map(prev)
      next.delete(elementId)
      return next
    })
  }, [])

  useEffect(() => { onMount({ add, remove }) }, [])

  return React.createElement(
    React.Fragment,
    null,
    ...Array.from(portals.values()).map((entry) =>
      createPortal(
        React.createElement(PortalItem, {
          key: entry.elementId,
          Comp: entry.Comp,
          props: entry.props,
          onRendered: entry.onRendered
        }),
        entry.mountPoint,
        entry.elementId
      )
    )
  )
}
