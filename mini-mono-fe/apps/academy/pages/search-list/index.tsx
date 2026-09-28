import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { withLayout, AntdConfig } from '@better-bit-fe/base-ui';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { ArticleGrid } from '~/components';
import { getArticleList, getTopics } from '~/api';
import { getSiteOrigin } from '~/utils/site';
import type { Article, Topic } from '~/types/academy';
import { ReactComponent as SearchIcon } from '~/public/images/search.svg';
import { ReactComponent as SearchLeftIcon } from '~/public/images/bg-search-left.svg';
import { ReactComponent as SearchRightIcon } from '~/public/images/bg-search-right.svg';

import styles from '../index.module.less';
import Link from 'next/link';
import { basePath, goPage } from '@better-bit-fe/base-utils';

interface PageProps {
  articles: Article[];
  topics: Topic[];
  total: number;
  search: string;
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

function Page({ articles, topics, total, search }: PageProps) {
  useGlobalWidget();
  const router = useRouter();
  const [keyword, setKeyword] = useState(search);
  const t = useFm();
  const maxKeywordLength = 20;

  const handleSearch = () => {
    const nextSearch = keyword.trim();
    if (!nextSearch) return;
    router.push({
      pathname: `${basePath}/search-list`,
      query: { search: nextSearch, page: 1 }
    });
  };

  return (
    <AntdConfig className={styles.page}>
      <section className="relative overflow-hidden bg-bg-secondary px-4 py-12 md:py-[70px]">
        <div className="pointer-events-none absolute left-[9%] top-0 hidden h-full w-[280px] opacity-30 md:block">
          <SearchLeftIcon/>
        </div>
        <div className="pointer-events-none absolute right-0 top-[84px] hidden h-full w-[300px] opacity-30 md:block">
          <SearchRightIcon/>
        </div>

        <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center">
          <p className="text-center text-[20px] font-bold text-text-brand-default-web">
             {t('header.subtitle')}
          </p>
          <h1
            className="mt-4 text-center text-[32px] font-bold leading-[40px] text-text-primary md:text-[48px] md:leading-[60px]">
            {t('search-article')}
          </h1>
          <div
            className="mt-10 flex h-12 w-full max-w-[320px] items-center justify-between rounded-xl bg-bg-primary py-2 pl-4 pr-2 border hover:border-line-border-hover">
            <input
              className="h-full w-full bg-transparent text-base text-text-primary outline-none"
              type="text"
              placeholder="BTC"
              value={keyword}
              maxLength={maxKeywordLength}
              onChange={(e) => setKeyword(e.target.value.trim().slice(0, maxKeywordLength))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <div
              className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg bg-text-primary text-bg-primary"
              role="button"
              tabIndex={0}
              onClick={handleSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            >
              <SearchIcon />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-0 md:py-10">
        <nav className="flex items-center gap-1 text-xs text-text-secondary">
           <Link
            href="/"
            className="hover:text-white transition-colors"
            onClick={(event) => {
              event.preventDefault();
              goPage('home');
            }}
          >
            {t('home-page')}
          </Link>
          <span>/</span>
          <Link
            href="/academy"
            className="hover:text-white transition-colors"
            onClick={(event) => {
              event.preventDefault();
              goPage('academy');
            }}
          >
            {t('academy')}
          </Link>
          <span>/</span>
          <span className="text-text-primary">{t('search')}</span>
        </nav>
        <h2 className="my-4 md:mb-14 text-2xl font-semibold md:font-bold text-text-primary md:text-[32px] md:leading-[40px]">
          {t('search-sum',{search: search || keyword, total})}
        </h2>
        <ArticleGrid
          topics={topics}
          articles={articles}
          total={total}
          pageSize={PAGE_SIZE}
          defaultViewMode="list"
          showDescription
          hideTopics={true}
        />
      </main>
    </AntdConfig>
  );
}

export const getServerSideProps = async (ctx) => {
  const { query, locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const page = getPageFromQuery(query.page);

  const [articleResult, topics, messages] = await Promise.all([
    search
      ? getArticleList({ locale: lc, page, pageSize: PAGE_SIZE, search })
      : Promise.resolve({ list: [], total: 0, page: 1, pageSize: PAGE_SIZE }),
    getTopics(lc),
    getTmsMessages({
      project: ['academy', 'error_code', 'footer'],
      entry: import.meta.url,
      locale: lc,
      additions: ['title', 'description']
    })
  ]);

  return {
    props: {
      articles: articleResult.list,
      total: articleResult.total,
      topics,
      search,
      locale: lc,
      locales,
      messages,
      title: search ? `${search} - ${messages.title}` : messages.title,
      description: messages.description,
      ogImage: '/static/image/ogImage.jpeg',
      path: `${getSiteOrigin()}/${lc}/academy/search-list/`
    }
  };
};

export default withLayout(Page);
