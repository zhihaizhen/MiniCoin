import React from 'react';
import { withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import CouponCenterContainer from '~/container/coupon-center';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { isApp } from '@better-bit-fe/base-utils';

function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  return (
    <div className="page-wrapper">
      <CouponCenterContainer />
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['rewards-hub', 'error_code', 'footer', 'gitbook-url'],
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
      ogImage: '/static/image/brand/ogImage.png',
      path: `https://www.easicoin.io/${locale}/rewards-hub/coupon-center`
    }
  };
};

export default withLayout(Page);
