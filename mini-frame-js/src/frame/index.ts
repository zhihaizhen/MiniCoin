/**
 * Frame 入口 —— 全局生命周期管理 + 统一导出
 *
 * 本模块是 Frame 对外的唯一入口，负责：
 * - 管理 frame 单例的初始化 / 获取 / 等待就绪 / 销毁
 * - 通过 window 全局属性 + 自定义事件与宿主页面通信
 * - 统一 re-export 所有需要对外暴露的类型和常量
 */

import { createFrameApi } from './createFrameApi'
import { getWindowRecord } from './internal'
import { EVENT_READY, WINDOW_FRAME_KEY } from './constants'
import type { State } from './types'

export { EVENT_READY, EVENT_FAILED, WINDOW_FRAME_KEY } from './constants'
export type { ComponentName } from './registry'
export type { ComponentExpose, CreateComponentParams, State } from './types'

let frame: State | null = null
let hasDispatchedReady = false

/** 初始化 Frame 单例，挂载到 window 并广播就绪事件供 connector 监听 */
export function initFrame(): State {
  if (!frame) {
    frame = createFrameApi(() => frame)
    getWindowRecord()[WINDOW_FRAME_KEY] = frame
  }
  if (!hasDispatchedReady) {
    hasDispatchedReady = true
    window.dispatchEvent(new Event(EVENT_READY))
  }
  return frame
}

/** 同步获取当前 frame（未初始化时为 null） */
export function getFrame(): State | null {
  return frame
}

/**
 * 等待 Frame 就绪后返回实例。
 * 优先检查本地引用 → window 全局属性 → 监听 EVENT_READY 事件。
 * connector 侧使用此方法确保在 Frame 初始化完成后再调用 API。
 */
export function waitForFrameReady(): Promise<State> {
  if (frame) return Promise.resolve(frame)

  const w = getWindowRecord()
  const existed = w[WINDOW_FRAME_KEY] as State | undefined
  if (existed) {
    frame = existed
    return Promise.resolve(existed)
  }

  return new Promise<State>((resolve) => {
    const handler = () => {
      window.removeEventListener(EVENT_READY, handler)
      const readyFrame = (getWindowRecord()[WINDOW_FRAME_KEY] as State | undefined) ?? frame
      if (readyFrame) {
        frame = readyFrame
        resolve(readyFrame)
        return
      }
      resolve(initFrame())
    }
    window.addEventListener(EVENT_READY, handler)
  })
}

/** 销毁 Frame：卸载所有组件 + 清理全局状态，用于热更新/测试/宿主卸载场景 */
export async function destroyFrame() {
  if (!frame) return
  await frame.destroy()
  frame = null
  hasDispatchedReady = false
}

/** @deprecated 非 Hook，仅为兼容历史命名保留 */
export function useFrame() {
  return frame
}
