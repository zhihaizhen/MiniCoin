import { Modal as AntdModal } from 'antd';
import React from 'react';
import cls from 'classnames';
import './index.less'

// 兼容react-ui里面modal的写法
export const Modal = (props) => {
  const { className, confirming, title, head, width = 440, innerClass, onConfirm, confirmText, children, ...others } = props;
  const clx = cls(className);
  return (
    <AntdModal
      title={head || title}
      wrapClassName={innerClass}
      maskClosable={false}
      destroyOnClose={true}
      className={clx}
      onOk={onConfirm}
      okText={confirmText}
      confirmLoading={confirming}
      width={width}
      {...others}
    >
      {children}
    </AntdModal>
  );
};
