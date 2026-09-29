import { useEffect, useState } from 'react'

export type UseIsMobileOptions = {
  /** 断点：<= breakpoint 认为是移动端 */
  breakpoint?: number
}

/**
 * 基于窗口宽度的移动端判断（可响应 resize）
 * 默认：<= 768 为移动端
 */
export function useIsMobile(options: UseIsMobileOptions = {}) {
  const breakpoint = options.breakpoint ?? 768

  const get = () => (typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false)
  const [isMobile, setIsMobile] = useState(get)

  useEffect(() => {
    const onResize = () => setIsMobile(get())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // breakpoint 变化时需要重新计算/绑定
  }, [breakpoint])

  return isMobile
}


