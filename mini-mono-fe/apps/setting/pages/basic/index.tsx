// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useFm } from '@better-bit-fe/base-hooks';
import { getUserProfile } from '~/api';
import Profile from '~/components/Profile';
import ColorPerfence from '~/components/ColorPerfence';
import DepositCheckList from '~/components/DepositCheckList';
import Notification from '~/components/Notification';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import { withSettingPage } from '~/hoc/withSettingPage';
import styles from './index.module.less';
import { getLang } from '@better-bit-fe/base-utils';
import Currency from '~/components/Currency';

function Home() {
  const [userInfo, setUserInfo] = useState({});
  const t = useFm();

  // 登录验证和重定向
  useLoginRedirect();

  const handleGoUserCenter = () => {
    const lang = getLang();
    window.location.href = `/${lang}/setting/dashboard`;
  };

  useEffect(() => {
    getUserProfile().then((data) => {
      setUserInfo(data);
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.title0} onClick={handleGoUserCenter}>
          {t('user-center')} /{' '}
        </div>
        <div className={styles.title2}> {t('settings')}</div>
      </div>
      <h1 className={styles.formTitle}>{t('settings')}</h1>
      <div className={styles.cardList}>
        <Profile />
        <Currency userInfo={userInfo} />
        <Notification userInfo={userInfo} />
        <ColorPerfence />
        <DepositCheckList />
      </div>
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
    project: ['setting', 'error_code', 'footer'],
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

export default withSettingPage(Home);
