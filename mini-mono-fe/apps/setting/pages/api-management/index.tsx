/**
 * Index pages
 */
// @ts-nocheck
import React, { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { useRouter } from 'next/router';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import ApiMgContainer from '~/containers/ApiMgContainer';
import { STORAGE_ADDRESS } from '~/constant';
import { ENV } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

function Page() {
  useGlobalWidget();
  const { isLogin } = useUserInfo();
  const { locale } = useRouter();
  useEffect(() => {
    if (ENV !== 'prod' && ENV !== 'testnet' && ENV !== 'test') return;
    const isLoginStorage = localStorage.getItem(STORAGE_ADDRESS);
    if (!isLoginStorage && isLogin === false) {
      window.location.href = `/${locale}/account/login`;
    }
  }, [isLogin, locale]);

  return (
    <div className={styles.page}>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <ApiMgContainer />
        <Chat />
      </ConfigProvider>
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
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

// // 加载了UniFrame，不加载JsBridge，但是不渲染头部尾部
// export default withLayout(Page, {
//   hasRenderUniFrame: false,
//   hasLoadJsBridge: false
// });

// // 不加载JsBridge,UniFrame，不渲染头部尾部
// export default withLayout(Page, {
//   hasRenderUniFrame: false,
//   hasLoadJsBridge: false,
//   hasLoadUniFrame: false
// });

export default withLayout(Page);
