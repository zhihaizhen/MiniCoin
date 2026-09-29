import { Select as AntdSelect } from 'antd';
import React from 'react';
import cls from 'classnames';
import './index.less'

const { Option } = AntdSelect;

const Select = (props) => {
  const { name, onChange, children, ...others } = props;
  const handleClick = (v, option) => {
    if (name) {
      onChange?.(v, name, option);
    } else {
      onChange?.(v, option);
    }
  }

  return (
    <AntdSelect onChange={handleClick}  {...others} suffixIcon={<span className="icon iconfont icon-xia" />}>
      {children}
    </AntdSelect>
  );
};

export { Option, Select };

