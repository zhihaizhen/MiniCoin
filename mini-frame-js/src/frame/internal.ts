import { createElement } from '@/utils/dom'

export const MOUNT_POINT_ATTR = 'data-global-widget-root'
export const CREATED_BY_FRAME = 'data-created-by-frame'
const MOUNT_POINT_SELECTOR = `[${MOUNT_POINT_ATTR}="1"]`

export function getWindowRecord(): Record<string, unknown> {
  return window as unknown as Record<string, unknown>
}

export function getOrCreateMountPoint(elementId: string): HTMLElement {
  const host = createElement(elementId)
  let mountPoint = host.querySelector(MOUNT_POINT_SELECTOR) as HTMLElement | null
  if (!mountPoint) {
    mountPoint = document.createElement('div')
    mountPoint.setAttribute(MOUNT_POINT_ATTR, '1')
    host.appendChild(mountPoint)
  }
  return mountPoint
}

/** 容器由 Frame 创建时整体移除，否则仅清理 mount point */
export function cleanupHost(elementId: string) {
  const host = document.getElementById(elementId)
  if (!host) return
  if (host.hasAttribute(CREATED_BY_FRAME)) {
    host.remove()
    return
  }
  host.querySelector(MOUNT_POINT_SELECTOR)?.remove()
}
