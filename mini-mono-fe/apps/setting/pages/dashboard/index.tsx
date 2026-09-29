/**
 * Index pages
 */
// @ts-nocheck
import React from 'react';
import { Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import { withSettingPage } from '~/hoc/withSettingPage';
import styles from './index.module.less';
import DashBoard from '~/components/AccountSafe/DashBoard';

function Page() {
  useLoginRedirect();

  return (
    <>
      <DashBoard />
      <Chat chatCls={styles['chat']} />
    </>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting'],
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
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};
export default withSettingPage(Page);
