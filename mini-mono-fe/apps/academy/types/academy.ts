/**
 * 币圈学院领域类型
 * 字段命名参考竞品（主题 / 难度 / 阅读时长），数据源最终接入后端 API/CMS 时只需调整 api/index.ts 的映射。
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Topic {
  /** 用于路由的唯一标识，如 'transaction_basis'（封装接口 slug，作多语言 key） */
  slug: string;
  /** 展示名称 */
  name: string;
  /** 封装接口分类 ID，列表按 categories=ID 服务端筛选时使用 */
  id?: number;
  /** 该主题下文章数量，可选 */
  count?: number;
}

export interface Article {
  /** 文章ID */
  id: number;
  /** 文章别名 */
  slug: string;
  /** 文章标题 */
  title: string;
  /** 文章内容（HTML） */
  content: string;
  /** 文章描述 */
  description: string;
  /** 文章分类ID列表 */
  categories: number[];
  /** Web 端图片地址 */
  web_image_url: string;
  /** App 端图片地址 */
  app_image_url: string;
  /** 跳转地址 */
  redirect_url: string;
  /** App 专用固定跳转后缀，如 /academy/{slug} */
  app_jump_url: string;
  /** 特色图片地址，用于 Web 端分享 */
  featured_image_url: string;
  /** 首次发布时间（ISO 8601），默认按此字段降序排序 */
  date: string;
  /** 更新时间（ISO 8601） */
  modified: string;
}

export interface ArticleDetail extends Article {
  /** 关联推荐文章 */
  related?: Article[];
  /** 该文章实际存在的站点 locale 列表，用于生成 hreflang，仅含已翻译语种 */
  availableLocales?: string[];
}

export interface ArticleListResult {
  list: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArticleListQuery {
  locale: string;
  /** 标题/正文模糊搜索（封装接口 search 参数） */
  search?: string;
  page?: number;
  pageSize?: number;
  /** 排序字段：date / title / id / modified / rand */
  orderby?: string;
  order?: 'asc' | 'desc';
  /** 文章别名（封装接口 slug 参数，详情查询用） */
  slug?: string;
  /** 分类 ID（封装接口 categories 参数，多个用英文逗号分隔） */
  categories?: string;
  difficulty?: Difficulty;
}

/**
 * Mock 原始文章数据接口
 */
export interface RawArticle {
  /** 文章ID */
  id: number;
  /** 文章别名 */
  slug: string;
  /** 文章标题 */
  title: string;
  /** 文章内容（HTML） */
  content: string;
  /** 文章描述 */
  description: string;
  /** 文章分类ID列表 */
  categories: number[];
  /** Web 端图片地址 */
  web_image_url: string;
  /** App 端图片地址 */
  app_image_url: string;
  /** 跳转地址 */
  redirect_url: string;
  /** App 专用固定跳转后缀，如 /academy/{slug} */
  app_jump_url: string;
  /** 特色图片地址，用于 Web 端分享 */
  featured_image_url: string;
  /** 首次发布时间（ISO 8601），默认按此字段降序排序 */
  date: string;
  /** 更新时间（ISO 8601） */
  modified: string;
}
