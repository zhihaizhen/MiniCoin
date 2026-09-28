import { InputNumber } from 'common/antdComponents';
import { isFunction, isNumber, toThousands } from '@unified/helpers';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

const ProfitInput = ({
  name,
  className,
  value,
  onChange,
  onClear,
  tick,
  precision,
  min,
  max,
  onMinus,
  onPlus,
  ...others
}) => {
  const [t] = useTranslation();
  const ticks = tick / 10 ** precision;
  // ticksize 大于1
  const isBigTickSize = useMemo(() => ticks > 1, [ticks]);
  const minDefaultFunc = () => {
    if (!isFunction(onChange) || !value) return;
    if (value < min + ticks) {
      onChange(min, name, 'minus');
      return;
    }
    onChange(
      Math.round((value - ticks) * `1e${precision}`) / `1e${precision}`,
      name,
      'minus',
    );
  };
  const plusDefaultFunc = () => {
    if (!isFunction(onChange) || !isNumber(value)) return;
    if (value > max - ticks) {
      onChange(max, name, 'plus');
      return;
    }
    onChange(
      Math.round((value + ticks) * `1e${precision}`) / `1e${precision}`,
      name,
      'plus',
    );
  };

  const minusFunc = onMinus || minDefaultFunc;
  const plusFunc = onPlus || plusDefaultFunc;
  const clearFunc = () => {
    if (!isFunction(onChange)) return;
    onChange('', name);
    if (isFunction(onClear)) onClear();
  };
  const rightIcon = (
    <div className="profit-input-icons">
      <If condition={value}>
        <span
          className="profit-input-icon-clear icon-clear iconfont"
          onClick={clearFunc}
        />
      </If>
      <span className="profit-input-icon" onClick={minusFunc}>
        －
      </span>
      <span
        className="profit-input-icon profit-input__border-left"
        onClick={plusFunc}
      >
        ＋
      </span>
    </div>
  );

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

  return (
    <InputNumber
      name={name}
      className={classNames(className, 'profit-input', 'profit-input-wrap')}
      addonAfter={rightIcon}
      value={value}
      tick={tick}
      precision={precision}
      onChange={onChange}
      min={min}
      max={max}
      {...bigTickSizeProps}
      {...others}
    />
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
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
