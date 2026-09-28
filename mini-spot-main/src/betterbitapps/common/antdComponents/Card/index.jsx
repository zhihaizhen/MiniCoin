import { Card as AntdCard } from 'antd';
import React from 'react';
import cls from 'classnames';
import './index.less'

export const Card = (props) => {
  const { head, className, children, ...others } = props;
  const clx = cls('common-card', className);
  return (
    <AntdCard className={clx} title={head} bordered={false} {...others}>
      {children}
    </AntdCard>
  );
};
