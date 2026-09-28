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
const filterLocals = ['zh-MY', 'es-419', 'es-MX', 'es-AR', 'hi-IN'];
const urlPrePath = process.env?.URL_PRE_PATH || ''; //部署平台上配置,原因是测试环境用V2【匹配appfix】，本地和其他环境都不需要

const baseConfig = genBaseConfig({
  envConfig,
  filterLocals
  // plugins: [new WebpackDependencyListPlugin()]
});

const nextConfig = {
  ...baseConfig,
  // assetPrefix: urlPrePath, // 静态资源前缀/v2, 这里复写了env里的设置
  // basePath: BASE_PATH,
  lessLoaderOptions: {
    additionalData: `@BASE_PATH: ${!BASE_PATH ? "''" : BASE_PATH};`
  },
  publicRuntimeConfig: {
    staticFolder: urlPrePath //动态路径
  }
};

// module.exports = withLess(withNx(nextConfig));
module.exports = withTM(withLess(withNx(nextConfig)));
