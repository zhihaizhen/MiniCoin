import { InputNumber } from 'common/antdComponents';
import { toThousands } from '@unified/helpers';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../ProfitInput/index.css';

const ProfitInput = ({
  name,
  leftIcon,
  className,
  value,
  onChange,
  tick,
  precision,
  min,
  max,
  rightIcon,
  ...others
}) => {
  const [t] = useTranslation();
  const inputRef = useRef();
  const ticks = tick / 10 ** precision;
  // ticksize 大于1
  const isBigTickSize = useMemo(() => ticks > 1, [ticks]);

  const bigTickSizeProps = isBigTickSize
    ? {
      precision: undefined,
      helperText: t('tickSizeFixNumTips', {
        ticksize: toThousands(ticks, precision),
      }),
      errorText: t('tickSizeFixNumTips', {
        ticksize: toThousands(ticks, precision),
      }),
      pattern: (value) =>
        !Number(value) ||
        new Decimal(value).mod(new Decimal(ticks)).toNumber() === 0,
    }
    : {};

  const handleInputFocus = useCallback(() => {
    if (inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, []);
  const leftIconWithFocus = useMemo(() => {
    if (leftIcon) {
      return <span onClick={handleInputFocus}>{leftIcon}</span>;
    }
    return '';
  }, [leftIcon, handleInputFocus]);
  return (
    <div className="label-input__container">
      <InputNumber
        ref={inputRef}
        addonBefore={leftIconWithFocus}
        addonAfter={rightIcon}
        name={name}
        className={classNames(
          className,
          'profit-input',
          'profit-input-wrap',
        )}
        value={value}
        tick={tick}
        precision={precision}
        onChange={onChange}
        min={min}
        max={max}
        {...bigTickSizeProps}
        {...others}
      />
    </div>
  );
};

ProfitInput.defaultProps = {
  name: undefined,
  value: undefined,
  onChange: undefined,
  onClear: undefined,
  tick: undefined,
  className: undefined,
  precision: undefined,
  min: undefined,
  max: undefined,
  onMinus: undefined,
  onPlus: undefined,
};

ProfitInput.propTypes = {
  name: PropTypes.string,
  leftIcon: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rightIcon: PropTypes.element.isRequired,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  tick: PropTypes.number,
  precision: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  onMinus: PropTypes.func,
  onPlus: PropTypes.func,
};

export default ProfitInput;
