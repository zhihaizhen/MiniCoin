/**
 * Index pages
 */
// @ts-nocheck
import React from 'react';
import { Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import BaseSetting from '~/components/AccountSafe/BaseSetting';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import { withSettingPage } from '~/hoc/withSettingPage';
import styles from './index.module.less';

function Page() {
  useLoginRedirect();

  return (
    <div className={styles.page}>
      <BaseSetting />
      <Chat chatCls={styles['chat']} />
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting', 'error_code', 'verify-modal', 'passKey'],
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
