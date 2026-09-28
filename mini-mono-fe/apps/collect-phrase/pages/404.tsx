/**
 * 404 Not Found Page
 * 当访问不存在的 campaign_path 时显示此页面
 */
import React from 'react';
import { withLayout, NotFound } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';

function Page() {
  useGlobalWidget();

  return <NotFound />;
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;

  // 获取多语言消息
  const messages = await getTmsMessages({
    project: ['error_code', 'gitbook-url', 'footer'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });
  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages['404Title'],
      description: messages['404Desc'],
      ogImage: '/static/image/ogImage.jpeg',
      path: `/${lc}/404`
    }
  };
};

export default withLayout(Page);
