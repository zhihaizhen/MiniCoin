const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

const locales = require('./locales');
const DefaultEnv = 'dev';
// const DefaultPipelineEnv = 'test-better-dex-1';
const DefaultPipelineEnv = 'test';

// 获取环境
function getNxCmdInfo() {
  const argv = process.argv.slice();
  // console.log('argv', argv);
  // 对应project.json的信息
  // project: projectName, target: build | server, configuration: dev | test | testnet | production
  if (argv?.length < 3) {
    return {
      env: 'local'
    };
  }
  const { targetDescription: nxInfo, overrides: argInfo } = JSON.parse(argv[2]);
  const env = nxInfo.configuration || DefaultEnv;
  const pipelineEnv = argInfo.pipelineEnv || argInfo['pipeline-env'];
  return {
    pipelineEnv: env.match(/testnet|production/)
      ? env
      : pipelineEnv === 'undefined'
      ? DefaultPipelineEnv
      : pipelineEnv || DefaultPipelineEnv,
    env: nxInfo.target === 'serve' ? 'local' : env,
    campaignId: argInfo.campaignId || argInfo['campaign-id']
  };
}
exports.getNxCmdInfo = getNxCmdInfo;

/**
 *
 * @param {Object} envConfig: environment-variables
 * @param {Array} plugin: webpack plugins
 * @param {Array} filterLocals: 用来过滤不需要上线的语言
 * @returns
 */
function genBaseConfig({ envConfig = {}, plugins = [], filterLocals = [] }) {
  const { env, pipelineEnv } = getNxCmdInfo();
  envConfig = {
    ...envConfig,
    ENVIRONMENT: env,
    PIPELINE_ENV: pipelineEnv
  };
  // 解决为了防止跳转到默认地址，比如原始地址：xxx.com/en-US/xxx/?xxx，输入浏览器中，会变成xxx.com/xxx/?xxx
  const defaultLocale = 'ed-ED';
  const { BASE_PATH } = envConfig;
  console.log('environment-variables文件BASE_PATH ', BASE_PATH, envConfig);
  return withBundleAnalyzer({
    images: {
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      deviceSizes: [768, 1080, 1200],
      domains: ['cdn.easicoin.io', 'www.test.bitrunfinance.com']
    },
    // transpilePackages: ['next-image-export-optimizer'], // nextJs 13.1 开始支持
    // https://nextjs.org/docs/advanced-features/compiler#minification
    swcMinify: true,
    nx: {
      // Set this to true if you would like to to use SVGR
      // See: https://github.com/gregberge/svgr
      svgr: true
    },

    // https://nextjs.org/docs/api-reference/next.config.js/environment-variables
    env: {
      ...envConfig,
      // 原始图片所在文件夹
      nextImageExportOptimizer_imageFolderPath: 'public/images',
      // 构建后图片输出到 （或你指定的路径）
      nextImageExportOptimizer_exportFolderPath: 'public',
      // 图片质量
      nextImageExportOptimizer_quality: '75',
      // 是否生成 webp
      nextImageExportOptimizer_storePicturesInWEBP: 'true',
      // 是否生成模糊占位图
      nextImageExportOptimizer_generateAndUseBlurImages: 'true',
      // 远程图片缓存时间（秒），0 表示不缓存
      nextImageExportOptimizer_remoteImageCacheTTL: '0'
    },
    // https://nextjs.org/docs/api-reference/next.config.js/exportPathMap#adding-a-trailing-slash
    // /about变成 /about/index.html
    trailingSlash: true,
    i18n: {
      locales: [
        ...new Set([
          ...locales.filter((k) => !filterLocals.find((fl) => k === fl)),
          defaultLocale
        ])
      ],
      defaultLocale,
      localeDetection: false
    },
    // https://nextjs.org/docs/api-reference/next.config.js/cdn-support-with-asset-prefix
    assetPrefix: `${BASE_PATH || '/'}`,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // 只有production才会生成source-map，需要给sentry使用
      if (env === 'production') {
        config.devtool = 'source-map';
      }
      if (plugins.length > 0) {
        config.plugins = config.plugins.concat(plugins);
      }
      // config.output = {
      //   crossOriginLoading: 'anonymous'
      // };
      // config.plugins = config.plugins.concat([
      //   new SubresourceIntegrityPlugin()
      // ]);

      return config;
    }
  });
}
exports.genBaseConfig = genBaseConfig;
