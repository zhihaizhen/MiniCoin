import axios from 'axios';
import { Env } from '@region-lib/env';
import type {
  Article,
  ArticleDetail,
  ArticleListQuery,
  ArticleListResult,
  RawArticle,
  Topic
} from '~/types/academy';
import { toWpLang, ACADEMY_CONTENT_LOCALES } from './locale';

const { API_HOST } = Env;


/**
 * 解析封装接口域名（运维封装后的对外域名）。
 * 服务端按 ENVIRONMENT 选 host（参考 trading-challenges）；浏览器端用 Env.API_HOST。
 * 可用 ACADEMY_WP_HOST 覆盖。环境域名待运维提供后填入下表。
 */
function resolveApiHost(): string {
  if (process.env.ACADEMY_WP_HOST) {
    return process.env.ACADEMY_WP_HOST;
  }
  if (typeof window !== 'undefined') {
    return API_HOST;
  }
  const env = process.env.ENVIRONMENT || 'test';
  const hosts: Record<string, string> = {
    production: 'https://www.easicoin.io/mapi',
    testnet: 'https://www.test.bitrunfinance.com/mapi',
    test: 'https://www.test.bitrunfinance.com/mapi',
    dev: 'https://www.test.bitrunfinance.com/mapi',
    local: 'https://www.test.bitrunfinance.com/mapi'
  };
  return hosts[env] || hosts.test;
}

/** 封装接口前缀（学院技术方案 PDF 接口列表） */
function apiBaseUrl(): string {
  return `${resolveApiHost()}/commom-public/index/public/v1/wordpress-paper`;
}

/**
 * 封装接口统一响应外壳：{ data, code, message, time }，code===0 为成功。
 */
interface ApiEnvelope<T> {
  data: T;
  code: number;
  message: string;
  time: string;
}

/** 分类接口返回项 */
interface WpCategory {
  id: number;
  name: string;
  slug: string;
}

/** 文章列表/详情返回项（post/list 的 records[]） */
interface WpPostRecord {
  id: number;
  slug: string;
  title: string;
  content: string;
  description?: string;
  excerpt?: string;
  link: string;
  categories: number[];
  web_image_url: string;
  app_image_url: string;
  redirect_url: string;
  app_jump_url?: string;
  featured_image_url?: string;
  date: string;
  modified: string;
}

/** 文章列表分页结构（post/list 的 data） */
interface WpPostListData {
  records: WpPostRecord[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

type ApiParamValue = string | number | boolean | null | undefined;
type ApiParams = Record<string, ApiParamValue>;

/**
 * 统一 GET：用 axios 直连封装后的 public 接口，解析 {data,code,message,time} 外壳。
 * code!==0 视为失败抛错，由调用方兜底。
 */
async function apiGet<T>(path: string, params?: ApiParams): Promise<T> {
  const url = `${apiBaseUrl()}${path}`;
  console.log('apiBaseUrl →', apiBaseUrl());
  const resp = await axios.get<ApiEnvelope<T>>(url, { params });
  const body = resp.data;
  if (!body || body.code !== 0) {
    throw new Error(
      `[academy.api] ${path} 返回异常: code=${body?.code} message=${body?.message}`
    );
  }
  return body.data;
}

// ----------------------------- 工具：HTML 处理 -----------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
  '#39': '\''
};

/** 解码常见 HTML 实体（标题/摘要里可能输出 &#8220; 等） */
function decodeEntities(input: string): string {
  if (!input) return '';
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/&([a-zA-Z#0-9]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

/** 去标签取纯文本 */
function stripTags(html: string): string {
  if (!html) return '';
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

// ----------------------------- 工具：字段映射 -----------------------------

function mapSummary(post: WpPostRecord): Article {
  return {
    id: post.id,
    slug: post.slug,
    title: decodeEntities(post.title || ''),
    content: post.content || '',
    description: stripTags(post.description || post.excerpt || ''),
    categories: post.categories || [],
    web_image_url: post.web_image_url || '',
    app_image_url: post.app_image_url || '',
    redirect_url: post.redirect_url || '',
    app_jump_url: post.app_jump_url || `/academy/${post.slug}`,
    featured_image_url: post.featured_image_url || post.web_image_url || '',
    date: post.date || post.modified || '',
    modified: post.modified || ''
  };
}

function mapDetail(post: WpPostRecord): ArticleDetail {
  return {
    ...mapSummary(post),
    // 后端不提供 available_languages，hreflang 取前端写死的 CMS 内容语种列表
    availableLocales: ACADEMY_CONTENT_LOCALES
  };
}

function mapMockSummary(article: RawArticle): Article {
  return {
    id: article.id,
    slug: article.slug,
    title: decodeEntities(article.title || ''),
    content: article.content || '',
    description: stripTags(article.description || ''),
    categories: article.categories || [],
    web_image_url: article.web_image_url || '',
    app_image_url: article.app_image_url || '',
    redirect_url: article.redirect_url || '',
    app_jump_url: article.app_jump_url || `/academy/${article.slug}`,
    featured_image_url:
      article.featured_image_url || article.web_image_url || '',
    date: article.date || article.modified || '',
    modified: article.modified || ''
  };
}

function mapMockDetail(article: RawArticle): ArticleDetail {
  return {
    ...mapMockSummary(article),
    availableLocales: undefined
  };
}

// ----------------------------- 主题 / 分类 -----------------------------

/**
 * 获取全部主题（首页主题导航 / 分类页筛选使用）。
 * 对应封装接口：GET /categories（不传 slug 取全部），slug 作多语言 key。
 */
export async function getTopics(_locale: string): Promise<Topic[]> {
  try {
    const data = await apiGet<WpCategory[]>('/categories');
    return (data || []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name
    }));
  } catch (e) {
    console.error('[academy.getTopics] 失败，回退空列表:', e);
    return [];
  }
}

// ----------------------------- 文章列表 -----------------------------

/**
 * 获取文章列表（首页精选、列表页分页/搜索/分类筛选通用）。
 * 服务端（getStaticProps）与客户端（CSR 分页/筛选）都可调用。
 * 对应封装接口：GET /post/list，分页在 body（total/size/current/pages）。
 */
export async function getArticleList(
  query: ArticleListQuery
): Promise<ArticleListResult> {
  const {
    locale,
    search,
    slug,
    categories,
    page = 1,
    pageSize = 15,
    orderby = 'date',
    order = 'desc'
  } = query;


  try {
    const data = await apiGet<WpPostListData>('/post/list', {
      page,
      per_page: pageSize,
      orderby,
      order,
      search: search || undefined,
      slug: slug || undefined,
      categories: categories || undefined,
      language: locale
    });
    return {
      list: (data?.records || []).map(mapSummary),
      total: data?.total || 0,
      page: data?.current || page,
      pageSize: data?.size || pageSize
    };
  } catch (e) {
    console.error('[academy.getArticleList] 失败，回退空列表:', e);
    return { list: [], total: 0, page, pageSize };
  }
}

// ----------------------------- 文章详情 -----------------------------

/**
 * 获取文章详情（文章详情页 getStaticProps 使用）。
 * 无独立详情端点：用 slug + language 调 post/list，取 records[0]；无结果返回 null。
 */
export async function getArticleDetail(
  slug: string,
  locale: string
): Promise<ArticleDetail | null> {
  try {
    const data = await apiGet<WpPostListData>('/post/list', {
      slug,
      per_page: 1,
      language: locale
    });
    const post = data?.records?.[0];
    return post ? mapDetail(post) : null;
  } catch (e) {
    console.error('[academy.getArticleDetail] 失败:', e);
    return null;
  }
}

// ----------------------------- 构建期预热 -----------------------------

/**
 * 构建期预渲染用：仅返回最新 N 篇用于 getStaticPaths 预热，
 * 其余文章由 fallback: 'blocking' 在首次访问时按需生成。
 */
export async function getHotArticlesForBuild(
  locale = 'en-US'
): Promise<Article[]> {
  try {
    const data = await apiGet<WpPostListData>('/post/list', {
      orderby: 'date',
      order: 'desc',
      per_page: 50,
      language: toWpLang(locale)
    });
    return (data?.records || []).map(mapSummary);
  } catch (e) {
    console.error('[academy.getHotArticlesForBuild] 失败，跳过预热:', e);
    return [];
  }
}
