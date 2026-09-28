/**
 * 主题/分类列表页
 * 读取 URL page 参数进行服务端分页。
 */
import React from 'react';
import { withLayout, AntdConfig } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { ArticleGrid, Header, ArticleFooter } from '~/components';
import { getArticleList, getTopics } from '~/api';
import { getSiteOrigin } from '~/utils/site';
import type { Article, Topic } from '~/types/academy';
import styles from '../index.module.less';

interface PageProps {
  topic: Topic;
  topics: Topic[];
  articles: Article[];
  total: number;
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

function Page({ topic, topics, articles, total }: PageProps) {
  useGlobalWidget();

  return (
    <AntdConfig className={styles.page}>
      <Header />
      <div className="mx-auto w-full max-w-[1200px] py-[40px]">
        <ArticleGrid
          activeSlug={topic.slug}
          articles={articles}
          topics={topics}
          total={total}
          pageSize={PAGE_SIZE}
        />
      </div>
      <ArticleFooter />
    </AntdConfig>
  );
}

export const getServerSideProps = async (ctx) => {
  const { query, params, locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  if (!slug) {
    return { notFound: true };
  }

  const page = getPageFromQuery(query?.page);

  const [topics, messages] = await Promise.all([
    getTopics(lc),
    getTmsMessages({
      project: ['academy', 'error_code', 'footer'],
      entry: import.meta.url,
      locale: lc,
      additions: ['title', 'description']
    })
  ]);

  const topic = topics.find((t) => t.slug === slug);
  if (!topic) {
    return { notFound: true };
  }

  // 封装接口支持按分类 ID 服务端筛选：slug → 分类 id → categories=ID 查询
  const result = await getArticleList({
    locale: lc,
    page,
    pageSize: PAGE_SIZE,
    categories: topic.id != null ? String(topic.id) : undefined
  });
  const articles = result.list;

  return {
    props: {
      topic,
      topics,
      articles,
      total: result.total,
      locale: lc,
      locales,
      messages,
      title: `${topic.name} - ${messages.title}`,
      description: messages.description,
      ogImage: '/static/image/ogImage.jpeg',
      path: `${getSiteOrigin()}/${lc}/academy/topic/${slug}/`
    }
  };
};

export default withLayout(Page);
