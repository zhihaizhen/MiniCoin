/**
 * 站点 locale 与封装接口 language 入参（WP Bogo lang code）的映射 —— 前端写死配置。
 *
 * 背景：后端不提供 available_languages 字段，CMS 实际只维护以下语言的学院内容，
 * 其余站点语言统一回退英文（en）。该映射由前端固定维护：
 *   韩国    ko-KR -> ko
 *   印尼    id-ID -> id
 *   简体中文 zh-CN -> zh-cn
 *   繁体中文 zh-TW -> zh-tw
 *   其他语言       -> en
 *
 * 调用封装接口时统一用 toWpLang() 转换 language 入参；文章 hreflang 只列
 * ACADEMY_CONTENT_LOCALES 中真实存在内容的语种。
 */

/** CMS 实际维护内容的站点 locale -> 封装接口 language（WP Bogo lang code） */
const CONTENT_LOCALE_TO_WP_LANG: Record<string, string> = {
  'ko-KR': 'ko',
  'id-ID': 'id',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'en-US': 'en'
};

/** 其余站点语言统一回退的 language */
const DEFAULT_WP_LANG = 'en';

/**
 * CMS 实际存在内容的站点 locale 列表，用于文章页生成 hreflang（只列这些真实语种），
 * 也作为缺省 availableLocales。
 */
export const ACADEMY_CONTENT_LOCALES: string[] = Object.keys(
  CONTENT_LOCALE_TO_WP_LANG
);

/** WP lang code -> 站点 locale（反查） */
const WP_LANG_TO_LOCALE: Record<string, string> = Object.entries(
  CONTENT_LOCALE_TO_WP_LANG
).reduce<Record<string, string>>((acc, [locale, lang]) => {
  acc[lang] = locale;
  return acc;
}, {});

/**
 * 站点 locale -> 封装接口 language。
 * 命中固定配置优先；其余语言统一回退 en。
 */
export function toWpLang(locale: string): string {
  const lc = locale || 'en-US';
  return CONTENT_LOCALE_TO_WP_LANG[lc] || DEFAULT_WP_LANG;
}

/**
 * WP lang code -> 站点 locale。未命中返回 undefined（调用方自行过滤）。
 */
export function toSiteLocale(wpLang: string): string | undefined {
  if (!wpLang) return undefined;
  return WP_LANG_TO_LOCALE[wpLang.toLowerCase()];
}
