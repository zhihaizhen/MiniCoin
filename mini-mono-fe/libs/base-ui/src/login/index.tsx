// @ts-nocheck
import React, { FC, useEffect } from 'react';
import clx from 'classnames';

interface LoginProps {
  className?: string;
  showStatus: boolean;
  updateLoginShowStatus: (status: boolean) => void;
  loginSuccess?: () => void;
}

const CONTAINER_ID = 'login-container';
let loginRef;
export const Login: FC<LoginProps> = ({
  className,
  showStatus,
  updateLoginShowStatus,
  loginSuccess
}) => {
  useEffect(() => {
    window &&
      window?.RegionFrame?.ready(({ loginModal }) => {
        loginModal.init().then((login) => {
          loginRef = login;
          // 获取登陆事件
          const { LOGIN_SUCCESS, HIDE_MODAL } = login.events;
          const { VISIBLE } = login.properties;
          loginModal
            .setProperty(VISIBLE, false)
            .subscribeEvent(LOGIN_SUCCESS, onloginSuccess)
            .subscribeEvent(HIDE_MODAL, hideModal);
        });
      });
  }, []);

  useEffect(() => {
    console.log('showStatus', showStatus);
    if (showStatus) {
      showModal();
    } else {
      closeModal();
    }
  }, [showStatus]);

  // 点击按钮等展示弹窗
  const showModal = () => {
    loginRef?.setProperty(loginRef.properties.VISIBLE, true);
  };
  const closeModal = () => {
    loginRef?.setProperty(loginRef.properties.VISIBLE, false);
  };
  const hideModal = () => {
    updateLoginShowStatus(false);
  };
  // 定义登陆成功回调函数
  const onloginSuccess = (userInfo, thirdPartyLogin) => {
    // 登陆成功后，返回用户信息或三方注册信息
    loginSuccess();
  };
  // destoryed 销毁
  // const destoryHandler = () => {
  //   loginRef.dealloc();
  // };

  return (
    <div
      id={CONTAINER_ID}
      className={clx('common-fixed-login', className)}
    />
  );
};
