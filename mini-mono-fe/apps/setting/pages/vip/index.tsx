// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { STORAGE_ADDRESS } from '~/constant';
import { ENV } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import Currency from '~/components/Currency';
import { getUserProfile } from '~/api';
import TradeCheckList from '~/components/TradeCheckList';
import DepositCheckList from '~/components/DepositCheckList';
import Header from '~/components/header';
import styles from './index.module.less';
import Vip from '~/components/Vip';

function Home() {
  const { isLogin } = useUserInfo();
  const { locale } = useRouter();
  const [userInfo, setUserInfo] = useState({});
  const t = useFm();

  useEffect(() => {
    getUserProfile().then((data) => {
      setUserInfo(data);
    });
  }, []);

  useEffect(() => {
    // if (isLogin === false) {
    //   window.location.href = '/trade/usdt/BTCUSDT';
    //   return;
    // }
    if (ENV !== 'prod' && ENV !== 'testnet' && ENV !== 'test') return;
    const isLoginStorage = localStorage.getItem(STORAGE_ADDRESS);
  }, [isLogin, locale]);

  return (
    <div className={styles.container}>
      <Vip />
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
    project: ['setting', 'error_code', 'footer', 'gitbook-url'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: 'VIP',
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(Home);
