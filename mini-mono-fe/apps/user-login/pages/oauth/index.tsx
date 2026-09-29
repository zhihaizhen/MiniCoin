/**
 * Index pages
 */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { ConfigProvider, theme } from 'antd';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { isMobile, ENV } from '@better-bit-fe/base-utils';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { tracing } from '@betterbit-library/tools';
import { loginPushRouter } from '~/utils';
import { CaptchaProvider } from '~/context/captchaContext';
import BindInviteCodeModal, { modalRef, inviteModal } from '~/components/bindInviteCode';
import Consent from '~/components/consent';
import styles from '../index.module.less';
import { AntThemeConfig } from '~/constants';

function Page() {
  const router = useRouter();
  useGlobalWidget({
    isHideFooter: true,
    isHideHeader: true
  });
  const isMb = isMobile();
  const t = useFm();
  const { isLogin, userInfo } = useUserInfo();

  return (
    <div className={styles.page}>
      <ConfigProvider theme={AntThemeConfig} autoInsertSpaceInButton={false}>
        {/* <CaptchaProvider> */}
        <div className={styles.container}>
          <Consent />
          <Chat />
        </div>
        {/* <BindEmail ref={bindEmailRef} />
          <BindInviteCodeModal ref={modalRef} /> */}
        {/* <IpRestrictModal visible={showModal} onClose={closeModal} countryName={countryName} /> */}
        {/* </CaptchaProvider> */}
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
    project: ['user-login', 'error_code', 'footer'],
    // project: 'demo', //要一一对应
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
