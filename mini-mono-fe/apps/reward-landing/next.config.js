const withNx = require('@nrwl/next/plugins/with-nx');
const withLess = require('@nrwl/next/plugins/with-less');
// 用于分析依赖，tms解析需要用的包
// const WebpackDependencyListPlugin =
//   require('webpack-dependency-list-plugin').default;
const {
  genBaseConfig,
  getNxCmdInfo
} = require('../../config/next.config.base');

const isMock = false;

const { env, campaignId } = getNxCmdInfo();
// Environment Variables
const envConfig = {
  ...require(`./env/${env}`),
  USE_MOCK: env === 'local' && isMock
};

// 从命令行参数获取 campaignId
// const campaignId = overrides?.campaignId;

const { BASE_PATH } = envConfig;

// 以下语言包不加载
const filterLocals = ['zh-MY', 'es-419', 'es-MX', 'es-AR', 'hi-IN'];

const baseConfig = genBaseConfig({
  envConfig,
  filterLocals
  // plugins: [new WebpackDependencyListPlugin()]
});
console.log('ztf-----campaignId', campaignId);
const nextConfig = {
  ...baseConfig,
  lessLoaderOptions: {
    additionalData: `@BASE_PATH: ${!BASE_PATH ? "''" : BASE_PATH};`
  },
  publicRuntimeConfig: {
    campaignId
  },
  env: {
    CAMPAIGN_ID: campaignId
  }
};

module.exports = withLess(withNx(nextConfig));
