import { useEffect, useRef } from 'react'

export function useHoverTimers(opts: {
  openDelayMs?: number
  closeDelayMs?: number
  onOpen: () => void
  onClose: () => void
}) {
  const { openDelayMs = 0, closeDelayMs = 0, onOpen, onClose } = opts

  const enterTimer = useRef<number | null>(null)
  const leaveTimer = useRef<number | null>(null)

  const clearTimers = () => {
    if (enterTimer.current !== null) window.clearTimeout(enterTimer.current)
    if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current)
    enterTimer.current = null
    leaveTimer.current = null
  }

  const scheduleOpen = () => {
    clearTimers()
    enterTimer.current = window.setTimeout(onOpen, openDelayMs)
  }

  const scheduleClose = () => {
    clearTimers()
    leaveTimer.current = window.setTimeout(onClose, closeDelayMs)
  }

  useEffect(() => {
    return () => clearTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { clearTimers, scheduleOpen, scheduleClose }
}


