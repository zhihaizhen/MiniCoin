// @ts-nocheck
import { InputNumber } from 'common/antdComponents';
import { Tooltip } from 'antd';
import { isFunction, isNumber, toNumber, toThousands } from '@unified/helpers';
import classNames from 'classnames';
import { If } from 'common/global/tsx-control-statement/index.d';
import { ONKEYDOWN_TYPES } from 'common/packages-biz/global-settings';
import { IInputRefObject } from 'common/types/components';
import Decimal from 'decimal.js';
import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PlusSvg } from 'common/assets/images/calc/input_plus.svg';
import { ReactComponent as MinusSvg } from 'common/assets/images/calc/input_minus.svg'

// import './index.css'; // 限价单，输入框后缀的样式
import Style from './index.module.less'

const rootClass = 'by-qai';
interface InputProps {
  name: string;
  values: {
    label: string;
    value: number;
  }[]; // 选择器
  value?: string | number;
  onChange?: (num: number, name: string) => void;
  precision: number;
  tick: number;
  min: number;
  max: number;
  disabled?: boolean;
  className?: string;
  size?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onFocus?: () => void;
  color?: string;
  type?: string;
  handleAutoPrice?: (num: number, name: string) => void;
}

const PriceAssistantInput = ({
  name,
  values = [],
  leftIcon,
  rightIcon,
  value,
  onChange,
  precision = 4,
  tick = 2,
  min,
  max,
  disabled,
  handleAutoPrice,
  rightUnit,
  ...others
}: InputProps) => {
  const [t] = useTranslation();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<IInputRefObject>(null);

  const step: number = useMemo(() => {
    const tickDecimal = new Decimal(tick);
    const precisionDecimal = new Decimal(10).pow(precision);
    const stepDecimal = tickDecimal.div(precisionDecimal);
    return toNumber(stepDecimal.toFixed(precision));
  }, [tick, precision]);

  // ticksize 大于1
  const isBigTickSize = useMemo(() => step > 1, [step]);

  const toggleOpen = (e) => {
    e.stopPropagation()
    setOpen(!open);
  }

  const handleNumberClick = (e, num: number, override?: boolean) => {
    e.stopPropagation()
    if (!onChange || !isFunction(onChange)) return;
    if (override) {
      onChange(num, name);
      return;
    }

    const tickDecimal = new Decimal(step);
    const newValueDecimal = new Decimal(toNumber(value) || 0);
    let newValue: number = toNumber(newValueDecimal.plus(new Decimal(num)));
    const remainder = newValueDecimal.mod(tickDecimal);

    if (isBigTickSize && toNumber(remainder.valueOf()) > 0) {
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


  const handleOutsideClick = (event) => {
    setOpen(false);
  }

  const handleClick = () => {
    if (handleAutoPrice) {
      handleAutoPrice();
    }
  }

  const unitRightIcon = (<div style={{ userSelect: 'none' }}>
    <span className={Style.last} onClick={handleClick}>{t('inputLast')}</span>
    <span className={Style.unit}>{rightUnit}</span>
  </div>
  );

  const bigTickSizeProps = isBigTickSize
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

  const handleInputFocus = useCallback(() => {
    if (inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className={Style.ocPriceInputWrapper}>
      <div className={Style.left}>
        <div className={Style.labelText}>{leftIcon}</div>
        <InputNumber
          ref={inputRef}
          name={name}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          tick={tick}
          precision={precision}
          onChange={onChange}
          addonAfter={unitRightIcon}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            const priceStep = {
              [ONKEYDOWN_TYPES.UP]: step,
              [ONKEYDOWN_TYPES.DOWN]: -step,
            }[e.keyCode];
            if (!priceStep) return;
            handleNumberClick(e, priceStep);
            e.preventDefault();
          }}
          {...bigTickSizeProps}
          {...others}
        />
      </div>
      <div className={Style.right}>
        <div className={Style.svgWrapper}>
          <PlusSvg onClick={(e) => handleNumberClick(e, +step)} />
        </div>
        <div className={Style.svgWrapper}>
          <MinusSvg onClick={(e) => handleNumberClick(e, -step)} />
        </div>
      </div>
    </div>
  );
};

PriceAssistantInput.defaultProps = {
  value: undefined,
  onChange: undefined,
  handleAutoPrice: undefined,
  disabled: false,
  className: undefined,
  size: undefined,
  leftIcon: undefined,
  rightIcon: undefined,
  onFocus: undefined,
  color: undefined,
  type: undefined,
};

export default PriceAssistantInput;
