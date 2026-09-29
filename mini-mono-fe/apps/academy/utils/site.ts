/**
 * 站点对外域名（用于 SEO canonical / og:url / hreflang 的 path 拼接）。
 *
 * 之前各页面写死 https://www.easicoin.io，导致非 prod 环境 canonical 指向线上域名。
 * 这里按 ENVIRONMENT 取对应环境的公开站点域名，与 api/index.ts 的 resolveApiHost 思路一致；
 * 浏览器端直接用当前 origin。可用 ACADEMY_SITE_ORIGIN 覆盖。
 */
export function getSiteOrigin(): string {
  if (process.env.ACADEMY_SITE_ORIGIN) {
    return process.env.ACADEMY_SITE_ORIGIN;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const env = process.env.ENVIRONMENT || 'test';
  const origins: Record<string, string> = {
    production: 'https://www.easicoin.io',
    testnet: 'https://www.test.bitrunfinance.com',
    test: 'https://www.test.bitrunfinance.com',
    dev: 'https://www.test.bitrunfinance.com',
    local: 'https://www.test.bitrunfinance.com'
  };
  return origins[env] || origins.test;
}
