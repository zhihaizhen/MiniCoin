/**
 * 文章详情页（ISR）
 * getStaticPaths 仅预热热门/最新文章，其余靠 fallback: 'blocking' 首访按需生成；
 * getStaticProps 返回 revalidate 做后台再生成，并支持 /api/revalidate 按需触发。
 */
import React, { useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import sanitizeHtml from 'sanitize-html';
import { withLayout, AntdConfig } from '@better-bit-fe/base-ui';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { getArticleDetail, getHotArticlesForBuild, getTopics } from '~/api';
import { ACADEMY_CONTENT_LOCALES } from '~/api/locale';
import { getSiteOrigin } from '~/utils/site';
import type { ArticleDetail, Topic } from '~/types/academy';
import { formatPublishedAt } from '~/utils/format';
import styles from './[slug].module.less';
import Link from 'next/link';
import { Medias } from '~/components';
import { goPage, isApp } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';

interface PageProps {
  article: ArticleDetail;
  topics: Topic[];
  locale: string;
  locales: string[];
  messages: any;
  title: string;
  description: string;
  ogImage: string;
  ogType: string;
  /** 结构化数据（Article + BreadcrumbList）的 JSON 字符串数组，已在服务端构建 */
  jsonLd: string[];
  canonical: string;
}

function Page({
  article,
  jsonLd,
  topics,
  canonical,
  title,
  description,
  ogImage,
  ogType,
  locale
}: PageProps) {
  const isMb = isApp();
  useGlobalWidget({
    isHideHeader: isMb,
    isHideFooter: isMb
  });
  const t = useFm();
  const router = useRouter();
  const { isLogin } = useUserInfo();
  const topicNameById = useMemo(() => {
    return new Map(
      topics
        ?.filter((topic): topic is Topic & { id: number } => typeof topic.id === 'number')
        .map((topic) => [topic.id, topic.slug])
    );
  }, [topics]);

  // fallback: 'blocking' 下不会出现 isFallback，但保留兜底
  if (router.isFallback) {
    return (
      <AntdConfig>
        <div className="py-[120px] text-center text-[#8f9499]">
          {t('loading')}
        </div>
      </AntdConfig>
    );
  }

  return (
    <AntdConfig>
      <div className="w-full bg-bg-secondary">
        <div className="max-w-[960px] px-4 md:px-[100px] py-6 md:py-10 mx-auto bg-bg-primary text-text-primary">
        {/* 结构化数据：内容由服务端用文章字段构造（非用户输入），并已转义 '<'，
          满足 frontend-security 对 dangerouslySetInnerHTML 的来源可信要求 */}
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={canonical} />

          <meta property="og:type" content={ogType} />
          <meta property="og:title" content={article?.title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={canonical} />
          <meta property="og:image" content={article?.web_image_url } />
          <meta property="og:image:secure_url" content={article?.web_image_url } />
          <meta property="og:site_name" content="Easicoin Academy" />
          <meta property="og:locale" content={locale} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={article?.title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={article?.web_image_url} />

          {jsonLd?.map((ld, i) => (
            <script
              // eslint-disable-next-line react/no-danger
              key={i}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: ld.replace(/</g, '\\u003c') }}
            />
          ))}
        </Head>

        {!isMb && (
          <nav
            className="flex items-center gap-1 text-xs text-text-secondary md:border-b border-solid border-line-border-default md:pb-8 md:mb-8">
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
            <span className="text-text-primary max-w-[200px] truncate inline-block align-bottom">{article?.title}</span>
          </nav>
        )}

        <article className={styles.article}>

          <h1 className="text-[24px] md:text-[32px] font-medium md:font-bold leading-tight">
            {article?.title}
          </h1>
          <div className="my-6 flex items-center justify-between gap-[8px] text-xs md:text-sm text-text-secondary">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                {article.categories.map(item => {
                  const categoryName = topicNameById.get(item) || item;
                  return (
                    <div key={item} className="flex items-center gap-1 bg-[#ABE12726] px-2 py-1 rounded">
                      <span className="text-xs text-text-brand-default-web">{t(String(categoryName))}</span>
                    </div>
                  );
                })}
              </div>
              <span>{formatPublishedAt(article?.date)}</span>
            </div>

            <div className="md:block hidden">
              <Medias article={article} url={canonical} />
            </div>
          </div>
          {article?.web_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article?.web_image_url}
              alt={article?.title}
              className="h-[180px] md:h-[420px] w-full object-cover "
            />
          ) : ''}
          {/* 正文来自 CMS(WordPress content.rendered)，已在 getStaticProps 服务端经
              DOMPurify 净化，此处直接渲染净化后的 HTML */}
          <div
            className="mt-6 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article?.content }}
          />

          {!isMb && (
            <div className="md:hidden">
              <Medias article={article} url={canonical} />
            </div>
          )}
        </article>
      </div>
      </div>

      {
        isLogin === false &&
        <div className="w-full h-[50px] text-sm bg-text-brand-default-web flex items-center justify-center gap-4">
          {t('register-tips')}
          <button
            className="text-white text-text-white-to-black bg-[#101112] rounded-md px-3 py-2 cursor-pointer text-xs"
            onClick={() => {
              goPage('register');
            }}
          >{t('register')}</button>
        </div>
      }

    </AntdConfig>
  );
}

export const getStaticPaths = async ({ locales }) => {
  try {
    const hot = await getHotArticlesForBuild();
    const paths = [];
    hot.forEach((a) => {
      locales.forEach((locale) => {
        paths.push({ params: { slug: a.slug }, locale });
      });
    });
    return {
      paths,
      // 关键：未预热的文章在首次访问时服务端阻塞生成并缓存
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('[article.getStaticPaths] 预热失败:', error);
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps = async (ctx) => {
  const { params, locale, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const { slug } = params;

  // 该 locale 无内容直接 404（对齐竞品：文章只在已翻译语种存在，不回退默认语言）
  const article = await getArticleDetail(slug, lc);
  if (!article) {
    return { notFound: true, revalidate: 60 };
  }

  // 文章配置了跳转地址时直接跳转，不渲染空壳（对应封装接口 redirect_url）
  if (article?.redirect_url) {
    return {
      redirect: { destination: article?.redirect_url, permanent: false },
      revalidate: 3600
    };
  }

  // 正文来自 CMS 原生 HTML，服务端净化一次后再下发（构建/ISR 期净化一次，客户端不重复跑）。
  // 使用 sanitize-html（基于 htmlparser2，无 jsdom/undici 依赖）：
  // 早期用 isomorphic-dompurify 会拉起 jsdom→undici，在 Next 13 server 运行时
  // 因 undici 被 Next 干扰（DecoratorHandler 缺失）而崩溃，故改用此方案。
  article.content = sanitizeHtml(article?.content || '', {
    // 在默认放行标签基础上，补充正文常见的富文本标签
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'figure',
      'figcaption'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      // 放行 Tailwind 原子类（竞品正文用到）与通用 class
      '*': ['class', 'id', 'style'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading']
    },
    // 外链统一补 rel，避免反向标签注入
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    }
  });

  const [messages, topics] = await Promise.all([
    getTmsMessages({
      project: ['academy', 'error_code', 'footer'],
      entry: import.meta.url,
      locale: lc,
      additions: ['title', 'description']
    }),
    getTopics(lc)
  ]);

  // hreflang：仅输出 CMS 实际维护内容的语种（前端写死的 ACADEMY_CONTENT_LOCALES，
  // 后端不提供 available_languages）。ko/id/zh-cn/zh-tw/en 之外的站点语言回退 en 内容。
  const availableLocales = Array.isArray(article?.availableLocales)
    ? article.availableLocales
    : [];
  const hreflangLocales = availableLocales.length
    ? availableLocales
    : ACADEMY_CONTENT_LOCALES;

  const origin = getSiteOrigin();
  const articleUrl = `${origin}/${lc}/academy/article/${slug}/`;
  const academyUrl = `${origin}/${lc}/academy/`;
  const description = article?.description || messages.description;
  const ogImage = article?.featured_image_url || article?.web_image_url || `${origin}/static/image/ogImage.jpeg`;

  // 非 CMS 内容语种（回退英文渲染）的页面是 en-US 的重复内容，
  // canonical 指向 en-US 规范页，避免重复内容；内容语种则 canonical 自指。
  const canonical = ACADEMY_CONTENT_LOCALES.includes(lc)
    ? articleUrl
    : `${origin}/en-US/academy/article/${slug}/`;

  // 结构化数据（参考竞品）：Article + BreadcrumbList。JSON.stringify 会自动剔除 undefined。
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article?.title,
    description,
    image: article?.featured_image_url
      ? [article?.featured_image_url]
      : undefined,
    datePublished: article?.date || undefined,
    dateModified: article?.modified || article?.date || undefined,
    author: [
      { '@type': 'Organization', name: 'Easicoin Academy', url: academyUrl }
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Easicoin',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/static/image/ogImage.jpeg`
      }
    }
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'home',
        item: `${origin}/${lc}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: messages.title || 'Academy',
        item: academyUrl
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article?.title,
        item: articleUrl
      }
    ]
  };

  // Next 的 getStaticProps 不允许 props 里出现 undefined 值。
  // article 中 availableLocales 等可选字段在 mock 或接口无对应字段时为 undefined，
  // 这里通过 JSON 序列化剔除所有 undefined 键。
  const serializableArticle = JSON.parse(JSON.stringify(article));

  return {
    props: {
      article: serializableArticle,
      topics,
      locale: lc,
      locales: hreflangLocales,
      messages,
      title: article?.title || messages.title,
      description,
      ogImage,
      ogType: 'article',
      jsonLd: [JSON.stringify(articleLd), JSON.stringify(breadcrumbLd)],
      canonical
    },
    // ISR: 文章详情 5分钟后台再生成（叠加按需 revalidate）
    revalidate: 300
  };
};

export default withLayout(Page);
