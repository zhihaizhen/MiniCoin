// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as ChatSvg } from './icon/chat.svg';
import { ReactComponent as ChatCloseSvg } from './icon/chat-close.svg';
import { ReactComponent as ChatBackSvg } from './icon/chat-back.svg';
import cls from 'classnames';
import { Input, message } from 'antd';
import { getLang, isMobile, isApp } from '@better-bit-fe/base-utils';
import udesk from './udesk';

export interface ChatProps {
  /** 自定义样式类名 */
  chatCls?: string;
  modalCls?: string;

  /** 客服图标位置 */
  position?: {
    bottom?: number;
    right?: number;
  };
  /** 是否显示客服功能 */
  visible?: boolean;
  /** 自定义 udesk 配置 */
  udeskConfig?: any;
  /** 是否显示客服弹窗 */
  showModalProp?: boolean;
}
const isH5 = isMobile();

export const Chat = ({
  chatCls,
  modalCls,
  style,
  visible = true,
  showModalProp = false,
  udeskConfig
}: ChatProps) => {
  const isAppPlatform = isApp();
  if (isAppPlatform) {
    return null;
  }

  if (!visible) {
    return null;
  }



  const t = useFm();
  const { userInfo, isLogin } = useUserInfo();
  const [isHover, setIsHover] = useState(false);
  const [showModal, setShowModal] = useState(showModalProp);
  const [isVisitor, setIsVisitor] = useState(false);
  const [email, setEmaill] = useState();

  // 监听 showModalProp 变化
  useEffect(() => {
    setShowModal(showModalProp);
  }, [showModalProp]);

  // 点击客服logo
  const handleOpenChat = () => {
    console.log('step1,点击客服icon');
    setIsHover(false);
    if (isLogin) {
      udesk.openUdPanel();
    } else {
      // 游客模式，关闭客服，再打开应该还在一个会话周期内，所以直接打开即可
      setShowModal(true);
    }
  };

  // 初始化就加载了
  useEffect(() => {
    if (isLogin) {
      udesk.start(userInfo);
    } else {
      udesk.start({});
    }
  }, [isLogin]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 回到登录或者游客访问页面
  const handleBack = () => {
    setEmaill();
    setIsVisitor(false);
  };

  const gotoLogin = () => {
    const lang = getLang();
    window.location.href = `/${lang}/account/login`;
  };

  const handleVisitor = () => {
    setIsVisitor(true);
  };

  const handleStartChat = () => {
    // 验证邮箱
    if (!email) {
      message.error(t('emailIsEmptyTips'));
      return;
    }

    const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!reg.test(email)) {
      message.error(t('emailInvalidTips'));
      return;
    }

    const data = {
      isVistor: true,
      id: email, // 同email还是同一个用户
      email
    };
    udesk.start(data); // 因为没有提前加载所以会导致初始化完成，但是不会打开面板
    // 回到初始状态
    setIsVisitor(false);
    setEmaill();
    setShowModal(false);
  };

  const handleChangeEmail = (e) => {
    const val = e.target.value;
    setEmaill(val);
  };


  const handleHoverChat = () => {
    setIsHover(true);
  };

  const handleLeaveChat = () => {
    setIsHover(false);
  };

  // h5函数没法响应式,所以position废弃了，改用chatCls和modalCls来控制样式
  return (
    <div>
      {!showModal && (
        <div id={isLogin ? 'brandChat' : ''}
          className={cls(chatCls, "fixed right-[16px] bottom-[60px] bg-text-brand-default p-[12px] flex items-center justify-center z-[100] cursor-pointer  rounded-lg")}
          onMouseEnter={handleHoverChat}
          onMouseLeave={handleLeaveChat}
          onClick={handleOpenChat}
        >
          <ChatSvg className="w-[28px] h-[28px]" />
          {isHover && <span className="text-text-black ml-[4px] text-[14px] font-[500]">{t('chatService')}</span>}
        </div>
      )}

      {/* 登录或者游客方式 */}
      {showModal && (
        <div
          className={cls(modalCls, `fixed bottom-[0px] right-[0px] z-[100] w-full  bg-bg-secondary p-[16px] rounded-[12px] md:w-[364px] md:bottom-[16px] md:right-[16px] `)}

        >
          {!isVisitor ? (
            <>
              <div className="flex items-center text-sm pb-[32px] text-text-primary justify-between">
                {t('chatLoginGuide')}
                <ChatCloseSvg className="w-4 h-4 bg-center inline-block cursor-pointer"
                  onClick={handleCloseModal} />
              </div>
              <div >
                <div
                  className="text-sm py-[10px] w-full rounded-[12px]  cursor-pointer flex items-center justify-center  text-text-white-to-black  bg-fill-button-primary-default mb-3"
                  onClick={gotoLogin}
                >
                  {t('login')}
                </div>
                <div
                  className="text-sm py-[10px] w-full  cursor-pointer flex items-center justify-center text-text-primary"
                  onClick={handleVisitor}
                >
                  {t('continueAsVisitor')}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center text-sm pb-4 text-text-primary">
                <ChatBackSvg className="w-4 h-4  inline-block mr-3 cursor-pointer"
                  onClick={handleBack} />
                {t('enterEmail')}
              </div>
              <div >
                <Input
                  value={email}
                  onChange={handleChangeEmail}
                  placeholder={t('plsEnterEmail')}
                  className="!h-[46px] !rounded-[12px] font-medium !bg-[#f5f5f5]"
                />
                <div
                  className="text-sm py-[12px] w-full rounded-[12px]  cursor-pointer flex items-center justify-center text-text-black bg-text-brand-default text-center mt-[16px]"
                  onClick={handleStartChat}
                >
                  {t('startChat')}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{` `}</style>
    </div>
  );
}

export default Chat;
