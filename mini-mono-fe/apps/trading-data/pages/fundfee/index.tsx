/**
 * Index pages
 */
// @ts-nocheck

import React from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { ConfigProvider, theme } from 'antd';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { http, isApp } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import FundFee from '~/components/FundFee';
import SettingLayout from '~/components/settingLayout';
import { getAntdLocale } from '@better-bit-fe/base-utils';
import { useRouter } from 'next/router';

function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });
  const t = useFm();
  const { locale } = useRouter();
  const antdLocale = getAntdLocale(locale);
  return (
    <AntdConfig locale={antdLocale}>
      <div className={styles.page}>
        <SettingLayout />
        <FundFee />
      </div>
      <Chat />
    </AntdConfig>
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
    project: ['trading-data', 'footer', 'gitbook-url'],
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
      ogImage: '/static/image/brand/ogImage.png',
      path: `/${locale}/trading-data/fundfee`
    }
  };
};

export default withLayout(Page);
