import { useState, useEffect } from 'react';

/**
 * 检测是否在客户端渲染的 hook
 * 用于解决 SSR 和客户端渲染不一致的问题
 * @returns 是否在客户端渲染
 */
export function useClientSide(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
