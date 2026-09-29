import type { ComponentName } from './registry'

/**
 * Frame 内部状态类型（对外暴露给 connector 使用）
 */
export interface FrameApi {
  createComponent: (params: CreateComponentParams) => Promise<ComponentExpose>
  removeComponent: (elementId: string) => Promise<void>
  /**
   * 销毁 Frame：卸载所有已挂载组件，并清理 window 全局引用
   * 说明：通常用于热更新/测试/宿主卸载场景
   */
  destroy: () => Promise<void>
}

export type State = FrameApi

/**
 * createComponent 入参
 * 说明：props 来自业务侧，结构不固定，因此使用 unknown 保持类型安全（避免 any）
 */
export interface CreateComponentParams {
  elementId: string
  componentName: ComponentName
  props?: unknown
}

/**
 * createComponent 返回值
 * connector 侧会读取 component.state
 */
export interface ComponentExpose<TState = unknown> {
  state: TState
}

