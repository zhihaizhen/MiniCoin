import { Checkbox as AntdCheckbox } from 'antd';
import React from 'react';
import cls from 'classnames';
import './index.less'

export const Checkbox = (props) => {
  const { className, children, ...others } = props;

  return (
    <AntdCheckbox className={className}  {...others}>
      {children}
    </AntdCheckbox>
  );
};
