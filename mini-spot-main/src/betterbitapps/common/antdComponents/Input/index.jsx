import { Input as AntdInput } from 'antd';
import React from 'react';
import cls from 'classnames';
import './index.less'

export const Input = (props) => {
  const { tick, step, onChange, name, className, children, ...others } = props;
  const clx = cls(className);

  const handleChange = (e) => {
    const { value } = e.target;
    if (!onChange) return;
    onChange(value, name)
  }
  return (
    <AntdInput
      className={clx}
      onChange={handleChange}
      step={tick || step}
      {...others}
    >
      {children}
    </AntdInput>
  );
};
