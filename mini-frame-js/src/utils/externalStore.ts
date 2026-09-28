import { EventEmitter } from './event'

/**
 * 极简 external store 工具：
 * - 用于配合 React `useSyncExternalStore` 使用
 * - 统一封装 subscribe / setState / getState，避免每个模块手写一套
 */
export function createExternalStore<T extends Record<string, any>>(initialState: T) {
  let state = initialState
  const emitter = new EventEmitter()

  const getState = () => state

  const setState = (partial: Partial<T>) => {
    // 只有检测到变化才 clone 并写入
    let nextState: T = state
    for (const k in partial) {
      if (!Object.prototype.hasOwnProperty.call(partial, k)) continue
      const key = k as keyof T
      const nextVal = partial[key] as T[typeof key]
      if (Object.is(nextState[key], nextVal)) continue
      if (nextState === state) {
        nextState = { ...state }
      }
      ;(nextState as T)[key] = nextVal
    }
    if (nextState === state) return
    state = nextState
    emitter.emit('change')
  }

  const subscribe = (listener: () => void) => {
    emitter.on('change', listener)
    return () => emitter.off('change', listener)
  }

  return { getState, setState, subscribe }
}

