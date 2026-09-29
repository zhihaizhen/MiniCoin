// @ts-nocheck
import { InputNumber, Input } from 'common/antdComponents';
import { isFunction, isNumber, toNumber, toThousands } from '@unified/helpers';
import { ONKEYDOWN_TYPES } from 'common/packages-biz/global-settings';
import { IInputRefObject } from 'common/types/components';
import Decimal from 'decimal.js';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const QtyAssistantInput = ({
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
    if (inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, []);

  const leftIconWithFocus = useMemo(() => {
    if (leftIcon) {
      return <span onClick={handleIconClick}>{leftIcon}</span>;
    }
    return '';
  }, [handleIconClick, leftIcon]);

  const handleFocus = () => {
    setcurQtyValue(0)
    setinputValue(undefined)
    if (resetQtySelector && isFunction(resetQtySelector)) {
      resetQtySelector();
    }
    setTimeout(() => {
      if (inputRef.current && inputRef.current.focus) {
        inputRef.current.focus();
      }
    }, 0);
  }

  const leftInputFocus = useMemo(() => {
    return <div
      onClick={handleFocus}
      style={{
        color: 'rgba(255,255,255,.5)',
        maxWidth: '165px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
      dangerouslySetInnerHTML={{
        __html: t('tips-maxPercentOpen', {
          value: `<span style="color:#fff">${curQtyValue}</span>`
        })
      }}
    />;
  }, [curQtyValue, t]);
  const rightIconWithFocus = useMemo(() => {
    if (rightIcon) {
      return <span onClick={handleIconClick}>{rightIcon}</span>;
    }
    return '';
  }, [handleIconClick, rightIcon]);

  useEffect(() => {
    if (qtyValue) {
      setcurQtyValue(`${Math.round(qtyValue * 100)}%`)
    } else {
      setcurQtyValue(0)
    }

    if (value) {
      setinputValue(value)
    } else {
      setinputValue(undefined)
    }
  }, [qtyValue, value]);

  const inputElement = useMemo(() => {
    if (curQtyValue) {
      // 有百分比的时候
      return <Input
        ref={inputRef}
        name={name}
        value={curQtyValue}
        // addonBefore={leftInputFocus}
        addonAfter={rightIconWithFocus}
        onChange={onChange}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          const qtyStep = {
            [ONKEYDOWN_TYPES.UP]: step,
            [ONKEYDOWN_TYPES.DOWN]: -step,
          }[e.keyCode];
          if (resetQtySelector && isFunction(resetQtySelector))
            resetQtySelector();
          if (!qtyStep) return;
          handleNumberClick(qtyStep)();
          e.preventDefault();
        }}
        {...bigLotSizeProps}
        {...others}
        onFocus={handleFocus}
      />
    }
    return <div style={{ width: '100%' }}>
      <InputNumber
        ref={inputRef}
        name={name}
        value={inputValue}
        min={min}
        addonAfter={rightIconWithFocus}
        // addonBefore={leftIconWithFocus}
        precision={precision}  // 小数的精度
        onChange={onChange}
        {...bigLotSizeProps}
        {...others}
      />
    </div>

  }, [bigLotSizeProps, curQtyValue, handleFocus, handleNumberClick, inputValue, leftIconWithFocus, leftInputFocus, max, min, name, onChange, others, precision, resetQtySelector, rightIconWithFocus, step, tick]);

  return (
    <>
      {
        inputElement
      }
    </>

  );
};

QtyAssistantInput.defaultProps = {
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

export default QtyAssistantInput;
