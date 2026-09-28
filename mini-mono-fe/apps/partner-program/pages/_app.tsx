/**
 * App entrance before access real pages, all provider, metas will setup here
 */
import React from 'react';
import type { AppProps } from 'next/app';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import 'libs/base-ui/src/styles/tailwind-global-styles.css'
import './styles.less';
// import { Nested } from '@better-bit-fe/base-ui';
// import { DataCollectionProvider } from '@better-bit-fe/base-provider';

// import '@better-bit-fe/styles/base-ui.less';
// import '@better-bit-fe/styles/quick-login.less';
// import '@better-bit-fe/styles/styles.css';

/**
 * https://nextjs.org/docs/advanced-features/custom-app
 * 初始化页面、数据，服务端渲染
 * 添加全局的css
 */
function CustomApp({ Component, pageProps }: any) {
  return (
    <>
      <div
        id="widget_header"
        style={{ height: '64px', background: ' #070808', borderBottom: '1px solid  #28292A' }}
      />
      <Component {...pageProps} />
      <div id="widget_footer" />
    </>
  );
}

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，不会出现在浏览器中
 *
 * @param ctx
 * @returns
 */
export const getStaticProps = async (ctx) => {
  const { locale, defaultLocale } = ctx;

  const lc = locale || defaultLocale;
  return {
    props: {
      locale: lc
    }
  };
};
export default CustomApp;
