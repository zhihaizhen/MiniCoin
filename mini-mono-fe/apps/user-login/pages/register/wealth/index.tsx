/**
 *  fixed referral code WEALTH register page
 */
import React, { useState, useEffect, useRef } from 'react';
import { withLayout, Chat, DownloadBanner } from '@better-bit-fe/base-ui';
import { useRouter } from 'next/router';
import { ConfigProvider, theme } from 'antd';
import { isMobile, ENV } from '@better-bit-fe/base-utils';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import LoginContent from '~/containers/loginContent';
import BindEmail from '~/components/bindEmail';
import { CaptchaProvider } from '~/context/captchaContext';
import { loginPushRouter } from '~/utils';
import { ReactComponent as ChatSvg } from '~/public/images/chat.svg';
import { AntThemeConfig } from '~/constants';
import styles from '../../index.module.less';

function Page() {
  const { locale, query } = useRouter();
  const { identity_id, device_model } = query;
  const returnUrl = `${locale}/downloadApp/wealth/`;
  if (typeof window !== 'undefined') {
    document.getElementById('widget_header')?.style?.setProperty('display', 'none', 'important');
  }
  useGlobalWidget({
    // handleLogin: handleShowBindEmail,
    returnPageUrl: returnUrl,
    isHideHeader: true,
  });

  const isMb = isMobile();
  const t = useFm();
  const { isLogin, userInfo } = useUserInfo();
  const bindEmailRef = useRef(null);

  // open Modal for bindEmail
  function handleShowBindEmail(newInfo?: any) {
    if ((isLogin && userInfo) || newInfo) {
      const _userInfo = newInfo || userInfo;
      if (!_userInfo.vague_email) {
        const showBindEmail = localStorage.getItem('showBindEmail');
        if (!showBindEmail || showBindEmail === '1') {
          bindEmailRef.current.changeModalVisible(true);
        } else {
          window.location.pathname = returnUrl;
        }
      } else {
        window.location.pathname = returnUrl;
      }
    }
  }
  return (
    <div className={styles.page}>
      <ConfigProvider theme={AntThemeConfig}>
        <CaptchaProvider>
          <div className={styles.container}>
            <LoginContent
              handleShowBindEmail={handleShowBindEmail}
              mode={'register'}
              fixedReferralCode={'WEALTH'}
            />
            {/* <Chat /> */}
            <div
              className={"fixed right-[16px] bottom-[82px] bg-text-brand-default p-[12px] flex items-center justify-center z-[100] cursor-pointer  rounded-lg"}
              onClick={() => { window.open('https://t.me/EasiCoin_XQ') }}
            >
              <ChatSvg className="w-[28px] h-[28px]" />
              {/* <span className="text-text-black ml-[4px] text-[14px] font-[500]">客服</span> */}
            </div>
            <DownloadBanner manualDownloadUrl={returnUrl} />
          </div>
          <BindEmail ref={bindEmailRef as any} />
        </CaptchaProvider>
      </ConfigProvider>

    </div>
  );
}

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，加载的语言内容最终会被打包生成到html中
 *
 * @param ctx
 * @returns
 */
export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['user-login', 'error_code', 'gitbook-url', 'footer'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(Page);
