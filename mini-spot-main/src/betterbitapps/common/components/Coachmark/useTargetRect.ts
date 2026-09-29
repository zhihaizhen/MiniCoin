// Coachmark 定位 hook：查询 Target_Element 并计算其在视口中的位置
// 与业务解耦，仅依赖 targetSelector（CSS 选择器）定位 DOM 节点

import { useEffect, useState, useCallback } from 'react';

/** Target_Element 在视口中的位置信息，字段与 DOMRect 保持一致，便于直接用于定位计算 */
export interface TargetRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * 根据 CSS 选择器查询 Target_Element 并计算其 rect
 * - 查询不到节点或 rect 宽高为 0 时返回 null，供主组件判断跳过该步
 * - 监听 window resize 与滚动容器 scroll 事件，变化时重新计算
 */
const useTargetRect = (selector: string | undefined): TargetRect | null => {
  const [rect, setRect] = useState<TargetRect | null>(null);

  const updateRect = useCallback(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    const target = document.querySelector(selector);
    if (!target) {
      setRect(null);
      return;
    }
    const domRect = target.getBoundingClientRect();
    if (domRect.width === 0 || domRect.height === 0) {
      setRect(null);
      return;
    }
    setRect({
      top: domRect.top,
      left: domRect.left,
      right: domRect.right,
      bottom: domRect.bottom,
      width: domRect.width,
      height: domRect.height,
    });
  }, [selector]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    // Target_Element 可能位于任意层级的滚动容器内，scroll 事件不冒泡，
    // 在 document 上以捕获阶段监听即可覆盖所有嵌套滚动容器，无需逐层查找
    document.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      document.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  return rect;
};

export default useTargetRect;
