// @ts-nocheck
import { InputNumber, Input } from 'common/antdComponents';
import { isFunction, isNumber, toNumber, toThousands } from '@unified/helpers';
import { ONKEYDOWN_TYPES } from 'common/packages-biz/global-settings';
import { IInputRefObject } from 'common/types/components';
import Decimal from 'decimal.js';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Style from './index.module.less'


// 价格输入框
interface InputProps {
  name: string;
  value?: string | number;
  onChange?: (num: number, name: string) => void;
  precision: number;
  tick: number;
  min: number;
  max: number;
  resetQtySelector?: () => void;
  className: string;
  onFocus?: () => void;
  size?: string;
  color?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: string;
  qtyValue?: any;
}

const OcInput = ({
  name,
  value = 0,
  onChange,
  tick = 2,
  precision = 2,
  min,
  max,
  resetQtySelector,
  leftIcon,
  rightIcon,
  qtyValue,
  ...others
}: InputProps) => {
  const [t] = useTranslation();
  const inputRef = useRef<IInputRefObject>(null);
  const focusTimerRef = useRef<any>(null);
  const step: number = useMemo(() => {
    const tickDecimal = new Decimal(tick);
    const precisionDecimal = new Decimal(10).pow(precision);
    const stepDecimal = tickDecimal.div(precisionDecimal);
    return toNumber(stepDecimal.toFixed(precision));
  }, [tick, precision]);
  const [curQtyValue, setcurQtyValue] = useState<string | number | undefined>(undefined);
  const [inputValue, setinputValue] = useState<any>(undefined);
  // lotsize 大于1
  const isBigLotSize: boolean = useMemo(() => step > 1, [step]);

  const handleNumberClick = (num: number, override?: boolean) => () => {
    if (!onChange || !isFunction(onChange)) return;
    if (override) {
      onChange(num, name);
      return;
    }

    const tickDecimal = new Decimal(step);
    const newValueDecimal = new Decimal(toNumber(value) || 0);
    let newValue: number = newValueDecimal.plus(new Decimal(num)).toNumber();
    const remainder = newValueDecimal.mod(tickDecimal);

    if (isBigLotSize && toNumber(remainder.valueOf()) > 0) {
      const fixedValue = newValueDecimal
        .minus(remainder)
        .plus(new Decimal(num))
        .toFixed(precision);
      newValue = toNumber(fixedValue);
    }

    if (isNumber(min) && newValue < min) newValue = min;
    if (isNumber(max) && newValue > max) newValue = max;

    onChange(newValue, name);
  };

  const bigLotSizeProps = isBigLotSize
    ? {
      precision: undefined,
      helperText: t('tickSizeFixNumTips', {
        ticksize: toThousands(step, precision),
      }),
      errorText: t('tickSizeFixNumTips', {
        ticksize: toThousands(step, precision),
      }),
      pattern: (value: string) =>
        !Number(value) ||
        new Decimal(value).mod(new Decimal(step)).toNumber() === 0,
    }
    : {};

  const handleIconClick = useCallback(() => {
    console.log('handleIconClick  input被select', inputRef.current);
    if (inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, []);

  const leftIconWithFocus = useMemo(() => {
    if (leftIcon) {
      return <span onClick={handleIconClick} style={{ userSelect: 'none' }}>{leftIcon}</span>;
    }
    return '';
  }, [handleIconClick, leftIcon]);

  const handleFocus = () => {
    setcurQtyValue(0)
    setinputValue(undefined)
    if (resetQtySelector && isFunction(resetQtySelector)) {
      resetQtySelector();
    }
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }
    focusTimerRef.current = setTimeout(() => {
      if (inputRef.current && inputRef.current.focus) {
        inputRef.current.focus();
      }
      focusTimerRef.current = null;
    }, 0);
  }

  const rightIconWithFocus = useMemo(() => {
    if (rightIcon) {
      return <span onClick={handleIconClick} style={{ userSelect: 'none' }}>{rightIcon}</span>;
    }
    return '';
  }, [handleIconClick, rightIcon]);

  useEffect(() => {
    if (value) {
      setinputValue(value)
    } else {
      setinputValue(undefined)
    }
  }, [qtyValue, value]);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    };
  }, []);

  const inputElement = useMemo(() => {
    return <div className={Style.ocInputWrapper}>
      <div className={Style.labelText}>{leftIconWithFocus}</div>
      <InputNumber
        ref={inputRef}
        name={name}
        value={inputValue}
        min={min}
        addonAfter={rightIconWithFocus}
        precision={precision}  // 小数的精度
        onChange={onChange}
        {...bigLotSizeProps}
        {...others}
      />
    </div>

  }, [bigLotSizeProps, curQtyValue, handleFocus, handleNumberClick, inputValue, leftIconWithFocus, max, min, name, onChange, others, precision, resetQtySelector, rightIconWithFocus, step, tick]);

  return (
    <>
      {
        inputElement
      }
    </>

  );
};

OcInput.defaultProps = {
  value: undefined,
  onChange: undefined,
  resetQtySelector: (): void => { },
  onFocus: undefined,
  size: undefined,
  color: undefined,
  leftIcon: undefined,
  rightIcon: undefined,
  type: undefined,
  qtyValue: undefined,
};

export default OcInput;
