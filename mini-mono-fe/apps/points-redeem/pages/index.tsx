/**
 * Index pages
 */
import React from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import styles from './index.module.less';
import { ConfigProvider } from 'antd';
import { AntThemeConfig } from '~/constants';
import MainContent from '~/components/MainContent';
import { isApp } from '@better-bit-fe/base-utils';

function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });


  return (
    <AntdConfig className={styles.page}>
      <ConfigProvider theme={AntThemeConfig}>
        <MainContent />
        <Chat chatCls="bottom-4! md:bottom-[60px]!" />
      </ConfigProvider>
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
    project: [
      'points-redeem',
      'error_code',
      'gitbook-url',
      'footer'
    ],
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
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/points-redeem/`
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
