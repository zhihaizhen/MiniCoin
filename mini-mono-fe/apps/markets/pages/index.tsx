/**
 * Index pages
 */
import React, { useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { getLang, getAntdLocale, isMobile } from '@better-bit-fe/base-utils';
import { getTmsMessages } from '@better-bit-fe/lang';
import { tracing } from '@betterbit-library/tools';
import { ColorPreferenceProvider } from '@better-bit-fe/base-provider';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import {
  SymbolConfigProvider,
  SpotQuoteTokenProvider,
  CollectProvider
} from 'libs/ws-service';
import Wrapper from '~/containers/overviewContainer';
import styles from './index.module.less';

function Page() {
  useGlobalWidget();
  const isMb = isMobile();
  const lang = getLang();
  const { locale } = useRouter();
  const antdLocale = getAntdLocale(locale);

  if (isMb) {
    window.location.href = `/${lang}/downloadApp/`;
  }

  // useEffect(() => {
  //   tracing.init({
  //     project_type: 'Market',
  //     project_name: 'MarketPage'
  //   });
  //   tracing.push('event', 'PageView', {});
  // }, []);


  return (
    <div className={styles.page}>
      <AntdConfig locale={antdLocale}>
        <ColorPreferenceProvider>
          <SymbolConfigProvider>
            <SpotQuoteTokenProvider useTickersWs>
              <CollectProvider>
                <Wrapper />
                <Chat />
              </CollectProvider>
            </SpotQuoteTokenProvider>
          </SymbolConfigProvider>
        </ColorPreferenceProvider>
      </AntdConfig>
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
    project: ['markets', 'tradfi-symbol', 'error_code', 'footer',],
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
      ogImage: 'https://www.easicoin.io/static/image/brand/ogImage.png',
      path: `https://www.easicoin.io/${locale}/markets/`
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
