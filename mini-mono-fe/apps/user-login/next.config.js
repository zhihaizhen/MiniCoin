const withNx = require('@nrwl/next/plugins/with-nx');
const withLess = require('@nrwl/next/plugins/with-less');
const { withSentryConfig } = require('@sentry/nextjs');

// 用于分析依赖，tms解析需要用的包
// const WebpackDependencyListPlugin =
//   require('webpack-dependency-list-plugin').default;
const {
  genBaseConfig,
  getNxCmdInfo
} = require('../../config/next.config.base');

const isMock = false;

const { env } = getNxCmdInfo();
// Environment Variables
const envConfig = {
  ...require(`./env/${env}`),
  USE_MOCK: env === 'local' && isMock
};

const { BASE_PATH } = envConfig;

// 以下语言包不加载
const filterLocals = ['zh-MY', 'es-419', 'es-MX', 'es-AR', 'hi-IN'];

const baseConfig = genBaseConfig({
  envConfig,
  filterLocals
  // plugins: [new WebpackDependencyListPlugin()]
});

const nextConfig = {
  ...baseConfig,
  lessLoaderOptions: {
    additionalData: `@BASE_PATH: ${!BASE_PATH ? "''" : BASE_PATH};`
  },
  publicRuntimeConfig: {
    staticFolder: BASE_PATH //动态路径
  }
};

const wrapNextConfig = withLess(withNx(nextConfig));

module.exports = withSentryConfig(wrapNextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'sre-3h',
  project: 'fe-mono',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
  // Pass the auth token
  authToken: process.env.SENTRY_AUTH_TOKEN
});
