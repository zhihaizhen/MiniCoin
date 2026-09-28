// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { withLayout, NotFound } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget, useScreen, ScreenType } from '@better-bit-fe/base-hooks';


function Page() {
  useGlobalWidget();
  console.log('Page component rendered');
  return (
    <NotFound />
  );
}


export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: 'home-page',
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  // console.log('==========', messages)

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png',
      path: `https://www.easicoin.io/${locale}/`
    }
  };
};

export default withLayout(Page);
