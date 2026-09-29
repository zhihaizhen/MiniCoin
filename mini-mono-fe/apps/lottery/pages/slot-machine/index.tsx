/**
 * Index pages
 */
import React, { useEffect } from 'react';
import * as Sentry from "@sentry/nextjs";
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import MainContent from '~/components/slot-machine';
import FooterBanner from '~/components/common/FooterBanner';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isApp } from '@better-bit-fe/base-utils';

function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  const { isLogin, userInfo } = useUserInfo();

  useEffect(() => {
    if (isLogin && userInfo?.id) {
      Sentry.setUser({ id: `${userInfo.id}` });
    } else {
      Sentry.setUser(null);
    }
  }, [isLogin, userInfo]);

  return (
    <AntdConfig>
      <MainContent />
      {isLogin === false && <FooterBanner />}
      <Chat />
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
    project: ['lottery', 'error_code'],
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
      path: `https://www.easicoin.io/${lc}/lottery/`
    }
  };
};

export default withLayout(Page);
