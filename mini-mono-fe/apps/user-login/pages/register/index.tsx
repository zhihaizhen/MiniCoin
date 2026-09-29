/**
 * Index pages
 */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { useRouter } from 'next/router';
import { ConfigProvider, theme } from 'antd';
import { isMobile, ENV, div } from '@better-bit-fe/base-utils';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import LoginContent from '~/containers/loginContent';
import BindEmail from '~/components/bindEmail';
import { CaptchaProvider } from '~/context/captchaContext';
import { loginPushRouter } from '~/utils';
import IpRestrictModal from '~/components/ipRestrictModal';
import { useIpRestrict } from '~/hooks/useIpRestrict';
import styles from '../index.module.less';
import { AntThemeConfig } from '~/constants';

function Page() {
  const { locale, isReady, query } = useRouter();
  const returnUrl = `${locale}/downloadApp/`
  useGlobalWidget({
    handleLogin: handleShowBindEmail,
    returnPageUrl: returnUrl,
    isHideFooter: isReady && query.isOauth,
    isHideHeader: isReady && query.isOauth
  });
  const isMb = isMobile();
  const t = useFm();
  const { isLogin, userInfo } = useUserInfo();
  const bindEmailRef = useRef(null);
  const { isRestricted, showModal, closeModal, checkIpRestriction, countryName } = useIpRestrict('register');

  // open Modal for bindEmail
  function handleShowBindEmail(newInfo?: any) {
    if ((isLogin && userInfo) || newInfo) {
      const _userInfo = newInfo || userInfo;
      if (!_userInfo.vague_email) {
        const showBindEmail = localStorage.getItem('showBindEmail');
        if (!showBindEmail || showBindEmail === '1') {
          bindEmailRef.current.changeModalVisible(true);
        } else {
          loginPushRouter();
        }
      } else {
        loginPushRouter();
      }
    }
  }
  return (
    <div className={styles.page}>
      <ConfigProvider theme={AntThemeConfig} autoInsertSpaceInButton={false}>
        <CaptchaProvider>
          <div className={styles.container}>
            <LoginContent
              handleShowBindEmail={handleShowBindEmail}
              mode={'register'}
              isRestricted={isRestricted}
              checkIpRestriction={checkIpRestriction}
            />
            <Chat />
          </div>
          <BindEmail ref={bindEmailRef as any} />
          <IpRestrictModal visible={showModal} onClose={closeModal} countryName={countryName} />
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
