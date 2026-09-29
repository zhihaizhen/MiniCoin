/**
 * App entrance before access real pages, all provider, metas will setup here
 */
import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import 'libs/base-ui/src/styles/tailwind-global-styles.css'
import './styles.less';

function CustomApp({ Component, pageProps }: any) {
  // useEffect(() => {
  //   // 这里可以根据您的需求动态设置主题
  //   // 例如：根据 localStorage、状态管理工具或 API 响应来设置
  //   const isDarkMode = false; // 替换为您的主题判断逻辑
  //   document.documentElement.classList.toggle('theme-dark', isDarkMode);
  //   document.documentElement.classList.toggle('theme-light', !isDarkMode);
  // }, []);

  return (
    <>
      <div className="app">
        <div
          id="widget_header"
          style={{
            height: '64px',
            background: 'var(--bg-primary, #070808)',
            borderBottom: '1px solid var(--line-border-default, #28292A)'
          }}
        />
        <Component {...pageProps} />
        <div id="widget_footer" />
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
