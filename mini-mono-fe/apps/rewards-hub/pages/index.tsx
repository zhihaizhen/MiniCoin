import React, { useEffect, useState } from 'react';
import { Spin } from "antd";
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { isPC } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

function Page() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 根据设备类型按需加载对应组件
    const loadComponent = async () => {
      try {
        const module = isPC()
          ? await import("~/container/PC")
          : await import("~/container/H5");

        setComponent(() => module.default);
      } catch (error) {
        console.error('Failed to load component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, []);

  // 组件加载中显示loading
  if (isLoading || !Component) {
    return (
      <div className={styles['loading-container']}>
        <Spin
          tip="Loading..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Component />
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
    project: ['rewards-hub', 'error_code', 'footer', 'gitbook-url'],
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
      path: `https://www.easicoin.io/${locale}/rewards-hub/`
    }
  };
};

export default withLayout(Page);
