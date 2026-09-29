import { InputNumber } from 'common/antdComponents';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import './index.css';

//  带有+—的inputnumber
const EnhanceInputNumber = ({
  onPlus,
  onMinus,
  containerClass = '',
  disabled,
  ...others
}) => (
  <div
    className={classnames(
      'enhance-input-num',
      containerClass,
      disabled ? 'disabled' : '',
    )}
  >
    <InputNumber
      disabled={disabled}
      {...others}
      addonAfter={
        <>
          <span
            className={classnames(
              'icon',
              'iconfont',
              'icon-minus',
              disabled ? '' : 'brand-hover',
            )}
            onClick={() => onMinus && !disabled && onMinus()}
          />
          <span
            className={classnames(
              'icon',
              'iconfont',
              'icon-plus',
              disabled ? '' : 'brand-hover',
            )}
            onClick={() => onPlus && !disabled && onPlus()}
          />
        </>
      }
    />
  </div>
);

export default EnhanceInputNumber;

EnhanceInputNumber.defaultProps = {
  onPlus: undefined,
  onMinus: undefined,
  containerClass: undefined,
  disabled: false,
};

EnhanceInputNumber.propTypes = {
  onPlus: PropTypes.func,
  onMinus: PropTypes.func,
  containerClass: PropTypes.string,
  disabled: PropTypes.bool,
};
