import { localTime, toThousands } from '@unified/helpers';
import cs from 'classnames';
import PropTypes from 'prop-types';
import { numberFormat } from 'common/utils/utils'
import React, { useCallback } from 'react';

const RtItem = ({
  className,
  execPrice,
  execQty,
  execTime,
  side,
  qtyPrecision,
  lastPricePrecision,
}) => {
 
  return (
    <li className={cs('rt__body-row full flex', className)}>
      <span className={`rt__row-left ${side === 'Sell' ? 'short' : 'long'}`}>
        {toThousands(execPrice, lastPricePrecision)}
      </span>
      <span className="rt__row-center">
        {numberFormat(execQty, qtyPrecision)}
      </span>
      <span className="rt__row-right">{localTime(execTime)}</span>
    </li>
  );
};

RtItem.defaultProps = {
  className: undefined,
};

RtItem.propTypes = {
  className: PropTypes.string,
  execPrice: PropTypes.string.isRequired,
  execQty: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  execTime: PropTypes.string.isRequired,
  side: PropTypes.string.isRequired,
  qtyPrecision: PropTypes.number.isRequired,
  lastPricePrecision: PropTypes.number.isRequired,
};

export default React.memo(RtItem);
