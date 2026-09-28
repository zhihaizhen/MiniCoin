import { useState, useEffect } from 'react';
import { isMobile as isMobileUtils } from '@better-bit-fe/base-utils';

/**
 * 检测是否为移动设备的 hook
 * @param breakpoint 断点值，默认为 768px
 * @returns 是否为移动设备
 */
export function useMobileDetection(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  const isMb = isMobileUtils();
  console.log('isMb', isMb);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(isMb);
    };

    // 初始检测
    checkIsMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
