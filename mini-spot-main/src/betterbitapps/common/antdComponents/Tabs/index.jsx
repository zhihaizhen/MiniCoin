import { Tabs as AntdTabs } from 'antd';
import React from 'react';
import cls from 'classnames';
import './index.less';

const { TabPane } = AntdTabs;

export function Tabs(props) {
  const { className, children, items, ...others } = props;

  return (
    <AntdTabs className={cls('overTabs', className)} {...others}>
      {items
        ? items.map(({ key, label, children: paneChildren, forceRender }) => (
            <TabPane tab={label} key={key} forceRender={forceRender}>
              {paneChildren}
            </TabPane>
          ))
        : children}
    </AntdTabs>
  );
}
