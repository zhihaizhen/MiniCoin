/**
 * App entrance before access real pages, all provider, metas will setup here
 */
import React from 'react';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import 'libs/base-ui/src/styles/tailwind-global-styles.css';
import './styles.less';
import '../styles/components.css';
import { isApp } from '@better-bit-fe/base-utils';

dayjs.extend(utc);
dayjs.extend(timezone);
BigNumber.config({ EXPONENTIAL_AT: -20 });

/**
 * https:/nextjs.org/docs/advanced-features/custom-app
 * 初始化页面、数据，服务端渲染
 * 添加全局的css
 */
function CustomApp({ Component, pageProps, router }: any) {
  const isAppPlatform = isApp();
  const isVipPage = router.pathname.startsWith('/vip-premier-wealth-hub');
  return (
    <>
      <div id="modal" />
      <div className="app">
        <div
          id="widget_header"
          style={
            isAppPlatform
              ? null
              : {
                  height: '64px',
                  background: '#070808',
                  borderBottom: '1px solid #28292A'
                }
          }
        ></div>
        <Component {...pageProps} />
        <div className={isVipPage ? 'banner-theme-dark' : ''} id="widget_footer"></div>
      </div>
    </>
  );
}

/**
 * https:/nextjs.org/docs/basic-features/data-fetching/get-static-props
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
