import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import type { Article, Topic } from '~/types/academy';
import { getArticleList } from '~/api';
import { formatPublishedAt } from '~/utils/format';
import { TopicNav } from './TopicNav';
import { ReactComponent as RefreshIcon } from '~/public/images/refresh.svg';
import { ReactComponent as GridIcon } from '~/public/images/grid.svg';
import { ReactComponent as ListIcon } from '~/public/images/list.svg';
import { ReactComponent as EmptyIcon } from '~/public/images/empty.svg';
import { basePath } from '@better-bit-fe/base-utils';
import { Pagination } from 'antd';


interface Props {
  articles: Article[];
  topics?: Topic[];
  activeSlug?: string;
  title?: string;
  total?: number;
  pageSize?: number;
  defaultViewMode?: ViewMode;
  showDescription?: boolean;
  hideTopics?: boolean;
}

type ViewMode = 'grid' | 'list';

function EmptyCover() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1b1c1c]">
      <div className="absolute left-1/2 top-1/2 h-[62%] w-[58%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="absolute left-[8%] top-[14%] rounded-[6px] border border-[#6fb722] bg-[#b7ff3b] px-[9px] py-[3px] text-[18px] font-black leading-none text-[#071004] shadow-[0_0_18px_rgba(167,242,40,0.45)]">
          BUY
        </div>
        <div
          className="absolute bottom-[6%] left-[10%] h-[44%] w-[13%] rounded-[3px] bg-gradient-to-b from-[#d7ff51] to-[#61b70d]" />
        <div
          className="absolute bottom-[12%] left-[31%] h-[61%] w-[9%] rounded-[3px] border border-[#9da4a3] bg-[#101412]" />
        <div
          className="absolute bottom-[10%] left-[50%] h-[42%] w-[13%] rounded-[3px] border border-[#8fa28d] bg-[#121714]" />
        <div
          className="absolute right-[12%] top-[2%] h-[58%] w-[14%] rounded-[3px] bg-gradient-to-b from-[#cfff37] to-[#64b90e]" />
        <div
          className="absolute bottom-[4%] right-[4%] h-[36%] w-[36%] rounded-full border-[5px] border-[#9ee82c] bg-[linear-gradient(110deg,#0f1711_0_48%,#cfd4cf_48%_62%,#454b48_62%)] opacity-90" />
      </div>
    </div>
  );
}

function ArticleItem({
                       article,
                       viewMode,
                       showDescription,
                       topicNameById
                     }: {
  article: Article;
  viewMode: ViewMode;
  showDescription?: boolean;
  topicNameById: Map<number, string>;
}) {
  const isList = viewMode === 'list';
  const fm = useFm();
  return (
    <Link
      href={`${basePath}/article/${article?.slug}`}
      className={`group block text-text-primary ${
        isList
          ? 'grid items-start gap-6 md:gap-14 md:grid-cols-[400px_minmax(0,1fr)]'
          : ''
      }`}
    >
      <div
        className={`overflow-hidden w-full h-[200px] rounded-2xl`}
      >
        {article?.web_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article?.web_image_url}
            alt={article?.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <EmptyCover />
        )}
      </div>
      <div className={isList ? 'mt-0' : ''}>
        <h3
          className={`font-bold group-hover:text-text-brand-default-web ${
            isList ? 'text-lg md:text-[28px] md:leading-[36px] pb-3' : 'my-3 md:my-4 text-lg md:text-xl line-clamp-2'
          }`}
        >
          {article?.title}
        </h3>
        {showDescription && article?.description ? (
          <p className="mb-10 mt-4 line-clamp-2 text-xs md:text-base text-text-secondary">
            {article?.description}
          </p>
        ) : null}
        <div className="flex items-center gap-3 flex-wrap">
          {article.categories.map(item => {
            const categoryName = topicNameById.get(item) || item;
            return (
              <div key={item} className="flex items-center whitespace-nowrap gap-1 rounded bg-[var(--fill-tag-brand-transparent,rgba(171,225,39,0.15))] px-2 py-1 rounded">
                <span className="text-xs text-text-brand-default-web">{fm(String(categoryName))}</span>
              </div>
            )
          })}

          <span className="text-xs md:text-base text-text-secondary whitespace-nowrap">{formatPublishedAt(article?.date)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleGrid({
                              articles,
                              topics,
                              activeSlug,
                              total,
                              pageSize = 12,
                              defaultViewMode = 'grid',
                              showDescription = false,
                              hideTopics = false,
}: Props) {
  const fm = useFm();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [currentArticles, setCurrentArticles] = useState<Article[]>(articles || []);
  const [currentTotal, setCurrentTotal] = useState(total);
  const [loading, setLoading] = useState(false);
  const pageNum = useMemo(() => {
    const pageQuery = Array.isArray(router.query.page) ? router.query.page[0] : router.query.page;
    const page = Number(pageQuery);
    return Number.isInteger(page) && page > 0 ? page : 1;
  }, [router.query.page]);
  const activeTopic = useMemo(() => {
    return topics?.find((topic) => topic.slug === activeSlug);
  }, [activeSlug, topics]);

  useEffect(() => {
    setCurrentArticles(articles || []);
    setCurrentTotal(total);
  }, [articles, total]);

  const handleChangePage = async (page: number) => {
    if (page === pageNum || loading) return;

    setLoading(true);
    try {
      const search = Array.isArray(router.query.search) ? router.query.search[0] : router.query.search;
      const result = await getArticleList({
        locale: router.locale || router.defaultLocale || 'en-US',
        page,
        pageSize,
        search: typeof search === 'string' ? search : undefined,
        categories: activeTopic?.id != null ? String(activeTopic.id) : undefined
      });

      setCurrentArticles(result.list);
      setCurrentTotal(result.total);
      await router.push(
        {
          pathname: `${basePath || ''}${router.pathname}`,
          query: {
            ...router.query,
            page
          }
        },
        undefined,
        { shallow: true, scroll: false }
      );
    } finally {
      setLoading(false);
    }
  };
  const articleCount = useMemo(() => {
    if (typeof currentTotal === 'number') return currentTotal;
    const topicTotal = topics?.reduce(
      (sum, topic) => sum + (topic.count || 0),
      0
    );
    return topicTotal || currentArticles?.length || 0;
  }, [currentArticles?.length, currentTotal, topics]);
  const topicNameById = useMemo(() => {
    return new Map(
      topics
        ?.filter((topic): topic is Topic & { id: number } => typeof topic.id === 'number')
        .map((topic) => [topic.id, topic.slug])
    );
  }, [topics]);
  const showHeader = Boolean(topics?.length);

  return (
    <section>
      {showHeader && !hideTopics ? (
        <>
          <div className="flex items-start justify-between gap-[20px]">
            <h2 className="text-[24px] md:text-[32px] font-bold leading-none text-text-primary">
              {fm('all-articles')}
              <span className="text-sm md:text-[22px] text-text-secondary ml-2 md:ml-3">
                ({articleCount})
              </span>
            </h2>

            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="h-9 w-9 flex items-center justify-center rounded-[7px]
                border-[0.5px] border-line-border-default bg-bg-secondary rounded-lg cursor-pointer hover:bg-bg-tertiary"
                aria-label="refresh"
              >
                <RefreshIcon />
              </button>
              <div className="hidden md:flex h-9 items-center gap-[2px] bg-bg-secondary rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex h-7 w-7 items-center justify-center rounded-sm cursor-pointer ${
                    viewMode === 'grid' ? 'bg-bg-primary' : 'hover:bg-bg-tertiary'
                  }`}
                  aria-label="grid view"
                >
                  <GridIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex h-7 w-7 items-center justify-center rounded-sm cursor-pointer ${
                    viewMode === 'list' ? 'bg-bg-primary' : 'hover:bg-bg-tertiary'
                  }`}
                  aria-label="grid view"
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {topics?.length ? (
            <TopicNav topics={topics} activeSlug={activeSlug} />
          ) : null}
        </>
      ) : null}

      {
        !currentArticles?.length ?
          <div className="w-full flex justify-center items-center flex-col text-text-primary text-[14px] md:px-[44px] py-[64px]">
            <EmptyIcon />
            {fm('empty_articles')}
          </div> :
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-x-6 gap-y-6 md:gap-y-10 md:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-6 md:gap-14'
              }
            >
              {currentArticles.map((a) => (
                <ArticleItem
                  key={a.slug}
                  article={a}
                  viewMode={viewMode}
                  showDescription={showDescription}
                  topicNameById={topicNameById}
                />
              ))}
            </div>
            <div className="my-pagination mt-10 flex justify-center">
              <Pagination
                hideOnSinglePage={true}
                current={pageNum}
                total={currentTotal}
                pageSize={pageSize}
                showSizeChanger={false}
                disabled={loading}
                onChange={handleChangePage}
              />
            </div>
          </>


      }
    </section>
  );
}
