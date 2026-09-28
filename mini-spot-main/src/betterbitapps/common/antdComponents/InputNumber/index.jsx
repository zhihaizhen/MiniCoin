import { InputNumber as AntdInputNumber } from 'antd';
import cls from 'classnames';
import React from 'react';
import './index.less';

export const InputNumber = (props) => {
  const { enterNegative, precision, className, textAlign, onKeyDown, value, onChange, name, children, ...others } = props;
  // tick, step,表示最小数量，用不到
  // precision表示保留的小数位
  const sanitizeInput = (raw) => {
    // 兜底清理：无论键盘还是输入法组合输入，只保留数字相关字符
    let str = String(raw ?? '').replace(/[^\d.-]/g, '');

    // 负号：不允许时全部移除；允许时仅保留开头一个
    str = enterNegative ? str.replace(/(?!^)-/g, '') : str.replace(/-/g, '');

    // 整数模式
    if (precision === 0) return str.replace(/\./g, '');

    // 小数模式：仅保留一个小数点，并限制小数位
    const [intPart = '', ...rest] = str.split('.');
    if (!rest.length) return str;

    const decimalPart = rest.join('');
    const limitedDecimalPart = typeof precision === 'number' && precision >= 0
      ? decimalPart.slice(0, precision)
      : decimalPart;

    return `${intPart}.${limitedDecimalPart}`;
  };

  const handleChange = (val) => {
    if (!onChange) return;
    onChange(val ?? undefined, name);
  }

  const handleKeyDown = (e) => {
    // 键盘层只做白名单拦截，复杂边界交给 parser 统一兜底
    const isShortcut = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes((e.key || '').toLowerCase());
    if (isShortcut) {
      onKeyDown?.(e);
      return;
    }

    const allowControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'];
    const isControlKey = allowControlKeys.includes(e.key);
    const isNumber = /^\d$/.test(e.key);
    const isPoint = e.key === '.' || e.keyCode === 190 || e.keyCode === 110;
    const isNegative = e.key === '-' || e.keyCode === 189 || e.keyCode === 109;

    if (isControlKey || isNumber) {
      onKeyDown?.(e);
      return;
    }

    const inputValue = String(e.target?.value ?? '');
    if (isPoint && precision !== 0 && !inputValue.includes('.')) {
      onKeyDown?.(e);
      return;
    }

    if (isNegative && enterNegative && !inputValue.includes('-')) {
      onKeyDown?.(e);
      return;
    }

    e.preventDefault();
    onKeyDown?.(e)
  }


  const clx = cls(textAlign === 'center' && 'inputNumberCenter', className)
  const normalizedValue = value === '' ? undefined : value;
  return (
    <AntdInputNumber
      className={clx}
      onChange={handleChange}
      controls={false}
      onKeyDown={handleKeyDown}
      parser={sanitizeInput}
      precision={precision}
      value={normalizedValue ?? undefined}
      {...others}
    >
      {children}
    </AntdInputNumber>
  );
};
