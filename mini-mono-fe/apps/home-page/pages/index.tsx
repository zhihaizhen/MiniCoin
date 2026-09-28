// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { withLayout, Chat, AntdConfig } from '@better-bit-fe/base-ui';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getTmsMessages } from '@better-bit-fe/lang';
import { throttle } from '~/utils/index';
import { useGlobalWidget, useScreen, ScreenType } from '@better-bit-fe/base-hooks';
import { getLang, langList, isMobile, isApp } from '@better-bit-fe/base-utils';
import { tracing } from '@betterbit-library/tools';
// import {
//   SymbolConfigProvider,
//   SpotQuoteTokenProvider,
//   // CollectProvider
// } from 'libs/ws-service';
import { SymbolConfigProvider, useSymbolConfig } from '~/context/symbolConfig';
import { ColorPreferenceProvider } from '@better-bit-fe/base-provider';
import HomePage from '~/components/home-page/home';
import Styles from './index.module.less';

function Page() {
  useGlobalWidget({
    footerProps: { showDownloadBanner: true }
  });
  const { userInfo, isLogin } = useUserInfo();

  return (
    <AntdConfig>
      <SymbolConfigProvider>
        <ColorPreferenceProvider>
          <div className={Styles['page-wrapper']}>
            <HomePage />
            <Chat chatCls={Styles['chat']} modalCls={Styles['chat-modal']} />
          </div>
        </ColorPreferenceProvider>
      </SymbolConfigProvider>
    </AntdConfig>
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
    project: ['home-page', 'error_code', 'footer', 'gitbook-url'],
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
      ogImage: '/static/image/brand/ogImage.png',
      path: `https://www.easicoin.io/${locale}/`
    }
  };
};

export default withLayout(Page);