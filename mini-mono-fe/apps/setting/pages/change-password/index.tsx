/**
 * Change password page
 */
// @ts-nocheck
import React from 'react';
import { Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import ChangePwd from '~/components/AccountSafe/ChangePwd';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import { withSettingPage } from '~/hoc/withSettingPage';
import styles from './index.module.less';

function Page() {
  useLoginRedirect();

  return (
    <div className={styles.page}>
      <ChangePwd />
      <Chat chatCls={styles['chat']} />
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting', 'error_code', 'footer', 'verify-modal'],
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
