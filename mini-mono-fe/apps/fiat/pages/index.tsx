/**
 * Index pages
 */
import React, { useEffect, useState } from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
// import { getLang, isMobile } from '@better-bit-fe/base-utils';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import Wrapper from '~/components/Wrapper';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useRouter } from 'next/router';

function Page() {
  useGlobalWidget();

  const [curWindow, setCurrentWindow] = useState<Window | null>();
  useEffect(() => {
    setCurrentWindow(window)
  }, []);

  const { isLogin } = useUserInfo();
  const { locale } = useRouter();
  useEffect(() => {
    if (typeof isLogin !== 'undefined' && !isLogin && typeof curWindow !== 'undefined') {
      curWindow.location.href = `/${locale}/account/login`;
    }
  }, [curWindow, isLogin]);


  return (
    <AntdConfig>
      <Wrapper />
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
    project: ['fiat', 'error_code', 'footer', 'gitbook-url'],
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
      path: `/${locale}/buy-crypto/`
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
