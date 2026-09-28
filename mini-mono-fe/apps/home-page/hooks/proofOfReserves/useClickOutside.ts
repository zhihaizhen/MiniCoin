import { useEffect, RefObject } from 'react';

/**
 * 点击外部区域执行回调的 hook
 * @param ref 需要监听的 DOM 元素引用
 * @param callback 点击外部区域时的回调函数
 * @param isActive 是否激活监听，默认为 true
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  isActive: boolean = true
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, isActive]);
}
