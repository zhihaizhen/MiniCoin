/**
 * Index pages
 */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { withLayout } from '@better-bit-fe/base-ui';
import { isMobile, ENV, div } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import LoginContent from '~/containers/loginContent';
import { CaptchaProvider } from '~/context/captchaContext';
import styles from './index.module.less';

function Page() {
  useGlobalWidget({
    handleLogin: handleShowBindEmail
  });
  const isMb = isMobile();
  const t = useFm();
  const { isLogin, userInfo } = useUserInfo();
  const bindEmailRef = useRef();

  // open Modal for bindEmail
  function handleShowBindEmail(newInfo?: Record<string, any>) {
    // if ((isLogin && userInfo) || newInfo) {
    //   const _userInfo = newInfo || userInfo;
    //   if (!_userInfo.vague_email) {
    //     const showBindEmail = localStorage.getItem('showBindEmail');
    //     if (!showBindEmail || showBindEmail === '1') {
    //       bindEmailRef.current.changeModalVisible(true);
    //     } else {
    //       loginPushRouter();
    //     }
    //   } else {
    //     loginPushRouter();
    //   }
    // }
    console.log('');
  }

  return (
    <div className={styles.page}>
      <CaptchaProvider>
        {/* <Header /> */}
        {/* <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}> */}
        <div className={styles.container}>
          {/* {isMb ? null : <div className={styles.title}>{t('page-title')}</div>} */}
          {/* <div className={styles.content}> */}
          <LoginContent
            handleShowBindEmail={handleShowBindEmail}
            mode={'login'}
          />
          {/* </div> */}
        </div>
        {/* <BindEmail ref={bindEmailRef} /> */}
        {/* </ConfigProvider> */}
      </CaptchaProvider>
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
    project: ['user-login', 'error_code'],
    // project: 'demo', //要一一对应
    entry: import.meta.url,
    locale: lc
    //additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages?.affiliateTitle,
      description: messages?.affiliateTitle
      // ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

// // 加载了UniFrame，不加载JsBridge，但是不渲染头部尾部
// export default withLayout(Page, {
//   hasRenderUniFrame: false,
//   hasLoadJsBridge: false
// });

// // 不加载JsBridge,UniFrame，不渲染头部尾部
// export default withLayout(Page, {
//   hasRenderUniFrame: false,
//   hasLoadJsBridge: false,
//   hasLoadUniFrame: false
// });

export default withLayout(Page);
