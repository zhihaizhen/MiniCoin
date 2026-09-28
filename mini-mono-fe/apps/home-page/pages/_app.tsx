/**
 * App entrance before access real pages, all provider, metas will setup here
 */
// @ts-nocheck
import React from 'react';
import Script from 'next/script';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import 'libs/base-ui/src/styles/tailwind-global-styles.css'
// import { ThemeContext } from '~/context/ThemeContext';
import './app.less';
/**
 * https://nextjs.org/docs/advanced-features/custom-app
 * 初始化页面、数据，服务端渲染
 * 添加全局的css
 */
function CustomApp({ Component, pageProps }: any) {
  return (
    <>
      <div className="app">
        {/* <ThemeContext> */}
        <main>
          <Component {...pageProps} />
        </main>
        {/* </ThemeContext> */}
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
export default CustomApp;
