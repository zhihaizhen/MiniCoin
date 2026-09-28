/**
 * 学院首页
 * 精选/最新文章 + 主题导航，读取 URL page 参数进行服务端分页。
 */
import React from 'react';
import { withLayout, AntdConfig } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { Header, ArticleGrid, ArticleFooter } from '~/components';
import { getArticleList, getTopics } from '~/api';
import { getSiteOrigin } from '~/utils/site';
import type { Article, Topic } from '~/types/academy';
import styles from './index.module.less';
import { AntThemeConfig } from '~/constants';

interface PageProps {
  topics: Topic[];
  articles: Article[];
  articlesTotal: number;
  locale: string;
  locales: string[];
  messages: any;
  title: string;
  description: string;
  ogImage: string;
  path: string;
}

const PAGE_SIZE = 15;

function getPageFromQuery(page: unknown) {
  const value = Array.isArray(page) ? page[0] : page;
  const pageNum = Number(value);
  return Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;
}

function Page({ topics, articles, articlesTotal }: PageProps) {
  useGlobalWidget();
  return (
    <AntdConfig className={styles.page} theme={AntThemeConfig}>
      <Header />
      <div className="mx-auto w-full max-w-[1200px] pt-[72px] md:pt-20 pb-10 px-4">
        <ArticleGrid
          articles={articles}
          topics={topics}
          total={articlesTotal}
          pageSize={PAGE_SIZE}
        />
      </div>
      <ArticleFooter />
    </AntdConfig>
  );
}

export const getServerSideProps = async (ctx) => {
  const { query, locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const page = getPageFromQuery(query.page);

  const [topics, articleResult, messages] = await Promise.all([
    getTopics(lc),
    getArticleList({ locale: lc, page, pageSize: PAGE_SIZE }),
    getTmsMessages({
      project: ['academy', 'error_code', 'footer'],
      entry: import.meta.url,
      locale: lc,
      additions: ['title', 'description']
    })
  ]);

  return {
    props: {
      topics,
      articles: articleResult.list,
      articlesTotal: articleResult.total,
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/ogImage.jpeg',
      path: `${getSiteOrigin()}/${lc}/academy/`,
    }
  };
};

export default withLayout(Page);
