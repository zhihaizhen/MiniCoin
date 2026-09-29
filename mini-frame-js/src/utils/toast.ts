type ToastType = 'success' | 'error' | 'info'

export type ToastOptions = {
  /** 是否对相同文案做去重（短时间内重复不再弹） */
  grouping?: boolean
  /** 自动关闭时间（ms） */
  duration?: number
}

type ToastInput = string | { message: string } | ({ message: string } & ToastOptions)

const DEFAULT_DURATION = 2600
const GROUP_WINDOW_MS = 2000

let lastKey = ''
let lastAt = 0

function normalize(input: ToastInput): { message: string; options: ToastOptions } {
  if (typeof input === 'string') return { message: input, options: {} }
  const { message, ...rest } = input
  return { message, options: rest }
}

function ensureContainer() {
  const id = '__global_widget_toast__'
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    el.style.position = 'fixed'
    el.style.zIndex = '99999'
    el.style.top = '16px'
    el.style.left = '50%'
    el.style.transform = 'translateX(-50%)'
    el.style.display = 'flex'
    el.style.flexDirection = 'column'
    el.style.gap = '10px'
    el.style.pointerEvents = 'none'
    document.body.appendChild(el)
  }
  return el
}

function show(type: ToastType, input: ToastInput) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const { message, options } = normalize(input)
  const duration = options.duration ?? DEFAULT_DURATION
  const grouping = options.grouping ?? false

  const key = `${type}:${message}`
  const now = Date.now()
  if (grouping && key === lastKey && now - lastAt < GROUP_WINDOW_MS) return
  lastKey = key
  lastAt = now

  const container = ensureContainer()
  const item = document.createElement('div')
  item.textContent = message
  item.style.pointerEvents = 'auto'
  item.style.maxWidth = 'min(92vw, 560px)'
  item.style.padding = '10px 12px'
  item.style.borderRadius = '10px'
  item.style.fontSize = '14px'
  item.style.lineHeight = '20px'
  item.style.fontWeight = '500'
  item.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)'
  item.style.backdropFilter = 'blur(6px)'
  item.style.border = '1px solid rgba(255,255,255,.12)'

  const palette =
    type === 'success'
      ? { bg: 'rgba(34, 197, 94, .18)', fg: 'rgb(134, 239, 172)' }
      : type === 'error'
        ? { bg: 'rgba(239, 68, 68, .18)', fg: 'rgb(252, 165, 165)' }
        : { bg: 'rgba(59, 130, 246, .18)', fg: 'rgb(147, 197, 253)' }

  item.style.background = palette.bg
  item.style.color = palette.fg

  container.appendChild(item)

  const remove = () => {
    item.style.opacity = '0'
    item.style.transform = 'translateY(-4px)'
    item.style.transition = 'opacity .18s ease, transform .18s ease'
    window.setTimeout(() => item.remove(), 200)
  }

  const t = window.setTimeout(remove, duration)
  item.addEventListener('click', () => {
    window.clearTimeout(t)
    remove()
  })
}

export const toast = {
  success(input: ToastInput) {
    show('success', input)
  },
  error(input: ToastInput) {
    show('error', input)
  },
  info(input: ToastInput) {
    show('info', input)
  }
}


