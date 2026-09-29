/**
 * Index pages
 */
import React, { useEffect } from 'react';
import * as Sentry from "@sentry/nextjs";
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import RedEnvMainContent from '~/components/red-envelope/RedEnvMainContent';
import { isApp } from '@better-bit-fe/base-utils';


function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });


  const { isLogin, userInfo } = useUserInfo();

  useEffect(() => {
    if (isLogin && userInfo?.id) {
      Sentry.setUser({ id: `${userInfo.id}` });
    } else {
      Sentry.setUser({ id: 'nologin' });
    }
  }, [isLogin, userInfo]);

  return (
    <AntdConfig>
      <RedEnvMainContent />
      <Chat />
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
    // 页面有加Footer组件 就必须加footer和gitbook-url
    // 页面有加Chat组件 就必须加footer
    project: ['lottery', 'error_code', 'gitbook-url', 'footer'],
    // project: 'demo', //要一一对应
    entry: import.meta.url,
    locale: lc,
    additions: ['redTitle', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.redTitle,
      description: messages.description,
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/lottery/`
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
