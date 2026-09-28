import { useState, useRef, useCallback } from 'react';
import { useClickOutside } from './useClickOutside';

/**
 * 下拉框状态管理的 hook
 * @param initialOpen 初始是否打开状态，默认为 false
 * @returns 下拉框相关的状态和方法
 */
export function useDropdown(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 使用 useClickOutside hook 处理点击外部关闭
  useClickOutside(dropdownRef, close, isOpen);

  return {
    isOpen,
    dropdownRef,
    toggle,
    open,
    close,
    setIsOpen
  };
}
