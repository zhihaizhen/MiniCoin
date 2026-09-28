/**
 * Index pages
 */
import React from 'react';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import { Banner } from '../components/Banner';
import { ContentStep } from '../components/ContentStep';
import { returnPageDomain } from '../constants';
import path from 'path';

function Page() {
  const returnPageUrl = `${returnPageDomain}/${getLang()}/partner-program`;
  useGlobalWidget({
    returnPageUrl
  });
  // const t = useFm();

  return (
    <div className={'min-h-[calc(100vh - 64px)] bg-white sm:pb-[0]'}>
      <Banner />
      <ContentStep />
      <Chat />
    </div>
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
    project: ['partner-program', 'error_code', 'footer', 'gitbook-url'],
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
      path: `https://affiliates.easicoin.io/${lc}/partner-program/`
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
