import { EventEmitter } from 'events'
import { waitForFrameReady } from '@/frame'
import type {
  State as FrameState,
  ComponentExpose,
  ComponentName,
  CreateComponentParams
} from '@/frame'

export interface CreateParams<P = unknown> {
  elementId?: string
  props?: P
}

const event = new EventEmitter()

export async function getFrame() {
  return await waitForFrameReady()
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch (_) {
    return String(error)
  }
}

export function useBase<Props = unknown, TState = unknown>(componentName: ComponentName) {
  let component: ComponentExpose<TState> | null = null
  let elementId: string

  const EVENT_CREATED = `${componentName}:created`
  const EVENT_FAILED = `${componentName}:failed`

  async function createComponent(params?: CreateParams<Props>): Promise<ComponentExpose<TState>> {
    if (component) return component
    try {
      const frame: FrameState = await getFrame()
      const data: CreateComponentParams = {
        elementId: componentName,
        componentName,
        ...params
      }
      elementId = data.elementId
      component = (await frame.createComponent(data)) as ComponentExpose<TState>
      event.emit(EVENT_CREATED)
    } catch (e) {
      const message = getErrorMessage(e)
      event.emit(EVENT_FAILED, { message })
      throw new Error(message)
    }
    return component
  }

  async function removeComponent() {
    if (!component) return
    const frame = await getFrame()
    await frame.removeComponent(elementId)
    component = null
    elementId = ''
  }

  async function getComponent(): Promise<ComponentExpose<TState>> {
    if (component) return component
    return new Promise((resolve, reject) => {
      // 超时警告
      const timer = setTimeout(() => {
        console.warn(
          'Global Widget: Timed out, global-widget.js and called the create function of the component'
        )
      }, 1000 * 10)

      event.once(EVENT_CREATED, () => {
        clearTimeout(timer)
        resolve(component as ComponentExpose<TState>)
      })
      event.once(EVENT_FAILED, (e: { message?: string } | undefined) => {
        clearTimeout(timer)
        reject(e?.message ?? 'Global Widget: create component failed')
      })
    })
  }

  return {
    createComponent,
    removeComponent,
    getComponent
  }
}
