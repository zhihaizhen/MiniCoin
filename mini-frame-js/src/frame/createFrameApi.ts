/**
 * createFrameApi —— Frame 核心实现
 *
 * 职责：
 * 1. 初始化唯一的共享 React Root（PortalHost）
 * 2. 管理业务组件的创建 / 移除 / 整体销毁
 */

import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createElement } from '@/utils/dom'
import { componentRegistry } from './registry'
import { PortalHost, type PortalHostHandle } from './PortalHost'
import type { ComponentExpose, CreateComponentParams, State } from './types'
import { cleanupHost, getOrCreateMountPoint, getWindowRecord, CREATED_BY_FRAME } from './internal'
import { WINDOW_FRAME_KEY } from './constants'

const HOST_ID = '__frame-portal-host__'

/**
 * 创建共享 Root：整个 Frame 生命周期内只有一个 React Root，
 * 所有业务组件通过 Portal 挂载，共享同一棵 React 树的 Context。
 *
 * 返回：
 * - ready: PortalHost 首次渲染完成后 resolve，确保 handle 可用
 * - getHandle: 同步获取当前 handle（可能为 null，仅 teardown 后）
 * - teardown: 卸载 Root 并移除宿主 DOM
 */
function initSharedRoot() {
  let sharedRoot: Root | null = null
  let hostHandle: PortalHostHandle | null = null

  const ready = new Promise<PortalHostHandle>((resolve) => {
    const el = document.createElement('div')
    el.id = HOST_ID
    document.body.appendChild(el)
    sharedRoot = createRoot(el)
    sharedRoot.render(
      React.createElement(PortalHost, {
        onMount: (handle) => {
          hostHandle = handle
          resolve(handle)
        }
      })
    )
  })

  function teardown() {
    sharedRoot?.unmount()
    sharedRoot = null
    hostHandle = null
    document.getElementById(HOST_ID)?.remove()
  }

  return { ready, getHandle: () => hostHandle, teardown }
}

/**
 * 构建 Frame API 实例。
 *
 * @param frameRef - 返回当前 frame 单例的闭包，destroy 时用于清理 window 全局引用。
 *                   之所以用回调而非直接传值，是因为 frame 引用在 index.ts 中可被重置。
 */
export function createFrameApi(frameRef: () => State | null): State {
  const { ready, getHandle, teardown } = initSharedRoot()

  async function createComponent(params: CreateComponentParams): Promise<ComponentExpose> {
    const { elementId, componentName, props } = params

    if (!(componentName in componentRegistry)) {
      throw new Error(
        `Unknown componentName: ${String(componentName)}. Supported: ${Object.keys(
          componentRegistry
        ).join(', ')}`
      )
    }

    const handle = await ready

    const hostExisted = !!document.getElementById(elementId)
    const container = createElement(elementId)
    if (!hostExisted) container.setAttribute(CREATED_BY_FRAME, '1')

    const exposedState = await componentRegistry[componentName].getState(props)
    const instance: ComponentExpose = { state: exposedState as any }

    const Comp = await componentRegistry[componentName].load()
    const mountPoint = getOrCreateMountPoint(elementId)

    await new Promise<void>((resolve) => {
      handle.add({
        elementId,
        componentName,
        Comp,
        props: props as any,
        mountPoint,
        onRendered: resolve
      })
    })

    return instance
  }

  async function removeComponent(elementId: string) {
    getHandle()?.remove(elementId)
    cleanupHost(elementId)
  }

  /** 卸载所有组件 → 销毁共享 Root → 清理 window 全局引用 */
  async function destroy() {
    teardown()

    const w = getWindowRecord()
    if (w[WINDOW_FRAME_KEY] === frameRef()) {
      delete w[WINDOW_FRAME_KEY]
    }
  }

  return { createComponent, removeComponent, destroy }
}
