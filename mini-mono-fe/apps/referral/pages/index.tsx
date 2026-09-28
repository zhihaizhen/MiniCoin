import React from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { isApp } from '@better-bit-fe/base-utils';
import ReferralContainer from '~/container';

function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  return (
    <AntdConfig>
      <ReferralContainer />
      <Chat />
    </AntdConfig>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['referral', 'error_code'],
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
      path: `https://www.easicoin.io/${lc}/referral/`
    }
  };
};

export default withLayout(Page);
