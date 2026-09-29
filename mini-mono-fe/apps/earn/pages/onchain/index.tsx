import React from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { ConfigProvider } from 'antd';
import { AntThemeConfig } from '~/constants';
import OnchainHeader from '~/components/Onchain/Header';
import OnchainContent from '~/components/Onchain/Content';
import { EarnDataProvider } from '~/context/EarnDataContext';
import { TransferModalRef, modalRef } from 'betterbit-ui';

function Page() {
  useGlobalWidget();

  return (
    <AntdConfig>
      <ConfigProvider theme={AntThemeConfig}>
        <EarnDataProvider>
          <OnchainHeader />
          <OnchainContent />
           <TransferModalRef ref={modalRef} />
        </EarnDataProvider>
        <Chat />
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
