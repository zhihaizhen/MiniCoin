import { useEffect } from 'react'

export function useDismiss(opts: {
  open: boolean
  refs: Array<React.RefObject<HTMLElement | null>>
  onDismiss: () => void
  /** 关闭前清理 hover timers，防止“刚关又被 timer 拉开” */
  beforeDismiss?: () => void
}) {
  const { open, refs, onDismiss, beforeDismiss } = opts

  useEffect(() => {
    if (!open) return

    const containsTarget = (target: Node) => {
      for (const r of refs) {
        const el = r.current
        if (el && el.contains(target)) return true
      }
      return false
    }

    const doDismiss = () => {
      beforeDismiss?.()
      onDismiss()
    }

    const onPointerDownCapture = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (!containsTarget(target)) doDismiss()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      doDismiss()
    }

    document.addEventListener('pointerdown', onPointerDownCapture, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDownCapture, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, refs, onDismiss, beforeDismiss])
}


