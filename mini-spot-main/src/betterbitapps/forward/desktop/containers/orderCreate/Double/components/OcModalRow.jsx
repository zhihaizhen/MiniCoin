import PropTypes from 'prop-types';
import cls from 'classnames';
import React from 'react';


const OcModalRow = ({ label, value, valueCls }) => {
  return <div>
    <div className='row-grid-lable'>{label}</div>
    <div className={cls(valueCls, 'row-grid-value')}>{value}</div>
  </div>
}

OcModalRow.defaultProps = {
  label: '',
  value: '',
  valueCls: '',
};

OcModalRow.propTypes = {
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  value: PropTypes.string,
  valueCls: PropTypes.string,
};
export default OcModalRow;