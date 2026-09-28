/**
 * 按需再生成接口（On-Demand ISR）
 *
 * 内容发布后由后端/CMS webhook 调用，立即让对应页面在所有语言下重新生成，
 * 而不必等待 revalidate 时间窗。仅在 Node server 形态（output: 'standalone'）下可用。
 *
 * 用法示例：
 *   POST /api/revalidate
 *   header: x-revalidate-secret: <ACADEMY_REVALIDATE_SECRET>
 *   body:   { "type": "article", "slug": "xxx" }
 *           { "type": "topic", "slug": "defi" }
 *           { "type": "home" }
 *
 * 注意：Next i18n 下每种语言是独立路径，需要逐一 revalidate。
 * 这里的路径是 Next 路由路径（不含外部 ingress 的 /academy 前缀），
 * 形如 /{locale}/article/{slug}；默认占位 locale ed-ED 不参与内容再生成。
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import ALL_LOCALES from '../../../../config/locales';


// 与 next.config 中 filterLocals 保持一致 + 排除占位默认语言 ed-ED
const FILTER_LOCALES = ['zh-MY', 'es-419', 'es-MX', 'es-AR', 'hi-IN', 'ed-ED'];
const LOG_PREFIX = '[academy revalidate]';



function contentLocales(input?: string[]): string[] {
  if (input?.length) return input;
  return ALL_LOCALES.filter((l) => !FILTER_LOCALES.includes(l));
}

function buildPaths(
  type: string,
  slug: string | undefined,
  locales: string[]
): string[] {
  return locales.map((locale) => {
    const prefix = `/${locale}`;
    switch (type) {
      case 'article':
        return `${prefix}/article/${slug}`;
      case 'topic':
        return `${prefix}/topic/${slug}`;
      case 'home':
      default:
        return `${prefix}`;
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.info(LOG_PREFIX, 'incoming request', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent'],
    hasHeaderSecret: Boolean(req.headers['x-revalidate-secret']),
    hasQuerySecret: Boolean(req.query.secret)
  });

  if (req.method !== 'POST') {
    console.warn(LOG_PREFIX, 'method not allowed', { method: req.method });
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const secret =
    (req.headers['x-revalidate-secret'] as string) ||
    (req.query.secret as string);
  // const configuredSecret = process.env.ACADEMY_REVALIDATE_SECRET;
  // if (
  //   !configuredSecret ||
  //   secret !== configuredSecret
  // ) {
  //   console.warn(LOG_PREFIX, 'invalid token', {
  //     hasConfiguredSecret: Boolean(configuredSecret),
  //     hasRequestSecret: Boolean(secret)
  //   });
  //   return res.status(401).json({ message: 'Invalid token' });
  // }

  const { type = 'home', slug, locales } = (req.body || {}) as {
    type?: string;
    slug?: string;
    locales?: string[];
  };

  console.info(LOG_PREFIX, 'validated payload', { type, slug, locales });

  if ((type === 'article' || type === 'topic') && !slug) {
    console.warn(LOG_PREFIX, 'missing slug', { type });
    return res.status(400).json({ message: 'slug is required for ' + type });
  }

  const paths = buildPaths(type, slug, contentLocales(locales));
  const revalidated: string[] = [];
  const failed: { path: string; error: string }[] = [];

  console.info(LOG_PREFIX, 'start revalidate', {
    type,
    slug,
    pathCount: paths.length,
    paths
  });

  await Promise.all(
    paths.map(async (p) => {
      try {
        await res.revalidate(p);
        revalidated.push(p);
        console.info(LOG_PREFIX, 'revalidate success', { path: p });
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : String(e);
        failed.push({ path: p, error });
        console.error(LOG_PREFIX, 'revalidate failed', { path: p, error });
      }
    })
  );

  console.info(LOG_PREFIX, 'finished', {
    status: failed.length ? 207 : 200,
    revalidatedCount: revalidated.length,
    failedCount: failed.length
  });

  return res.status(failed.length ? 207 : 200).json({
    revalidated,
    failed
  });
}
