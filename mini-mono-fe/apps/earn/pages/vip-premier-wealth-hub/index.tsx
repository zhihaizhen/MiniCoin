import React from 'react';
import {  withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { ConfigProvider } from 'antd';
import { AntThemeConfig } from '~/constants';
import VipPremierWealthHub from '~/components/VipPremierWealthHub';
import { isApp } from '@better-bit-fe/base-utils';
function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  return (
    <AntdConfig>
      <ConfigProvider theme={AntThemeConfig}>
        <div className="banner-theme-dark bg-bg-primary overflow-x-hidden">
           <VipPremierWealthHub />
           <Chat />
        </div>
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
    project: ['earn', 'error_code', 'gitbook-url'],
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
      path: `/${lc}/earn`
    }
  };
};

export default withLayout(Page);
