const withNx = require('@nrwl/next/plugins/with-nx');
const withLess = require('@nrwl/next/plugins/with-less');
const withTM = require('next-transpile-modules')(['antd-mobile']);

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
const filterLocals = []; // 以下语言包不加载

const baseConfig = genBaseConfig({
  envConfig,
  filterLocals
  // plugins: [new WebpackDependencyListPlugin()]
});

const nextConfig = {
  ...baseConfig,
  assetPrefix: BASE_PATH, //保持和url一致
  publicRuntimeConfig: {
    staticFolder: BASE_PATH //动态路径
  },
  lessLoaderOptions: {
    additionalData: `@BASE_PATH: ${!BASE_PATH ? "''" : BASE_PATH};`
  }
};

module.exports = withTM(withLess(withNx(nextConfig)));
