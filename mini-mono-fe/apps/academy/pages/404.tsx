/**
 * 404 Not Found Page
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

  const messages = await getTmsMessages({
    project: ['academy', 'error_code', 'footer'],
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
      path: '/404'
    }
  };
};

export default withLayout(Page);
