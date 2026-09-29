/**
 * App entrance before access real pages, all provider, metas will setup here
 */
import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { isApp } from '@better-bit-fe/base-utils';
import 'libs/base-ui/src/styles/tailwind-global-styles.css'
import './styles.less';


/**
 * https://nextjs.org/docs/advanced-features/custom-app
 * 初始化页面、数据，服务端渲染
 * 添加全局的css
 */
function CustomApp({ Component, pageProps }: any) {
  const isAppPlatform = isApp();

  return (
    <>
      <div id="modal" />
      <div className="app">
        <div
          id="widget_header"
          style={isAppPlatform ? null : { height: '64px', background: 'var(--bg-primary, #070808)', borderBottom: '1px solid var(--line-border-default, #28292A)' }}
        ></div>
        <Component {...pageProps} />
        
        <div id="widget_footer"></div>
      </div>
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
