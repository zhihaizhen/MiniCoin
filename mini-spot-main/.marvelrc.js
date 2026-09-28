const forwardMockPort = 8003;

/**
 * 公共代理
 */

const preUrl = 'https://www.test.bitrunfinance.com/'

const urlInfoByBusiness = {
  publicUrl: '/spot',
  buiness: 'forward',
  buildDest: 'app/forward/desktop',
};


const commonProxy = {
  '/tradingview': {
    target: preUrl,
    changeOrigin: true,
  },
  '/global-widget': {
    target: preUrl,
    changeOrigin: true,
  },
  '/static': {
    target: preUrl,
    changeOrigin: true,
  },
  '/mapi': {
    target: preUrl,
    changeOrigin: true,
  },
  '/icon': {
    target: preUrl,
    changeOrigin: true,
  },
};

module.exports = {
  MARVEL_CLI_VERSION: '0.0.18',
  forward: {
    desktop: {
      buildDest: urlInfoByBusiness?.buildDest, // build后资源定制输出 path
      htmlDest: '', // html定制输出 path, 如果不需要向额外的目录输出buid后的html文件，此项留空即可
      publicPath: urlInfoByBusiness?.publicUrl, // 静态资源公共地址(构建用)
      templateRoot: `@@/template/${urlInfoByBusiness?.buiness}/desktop/public`, // 定制index.html以及public资源所在文件夹

      port: 8001,
      // mockServer 监听端口, 可在.marvelrc-native.js中进行覆盖定制
      mockPort: forwardMockPort,
      proxy: {
        test: {
          '/realtime_w': {
            target: `ws://localhost:${forwardMockPort}`,
            ws: true,
          },
          ...commonProxy,
        }, // 测试环境
        dev: {
          '/mapi': {
            target: preUrl,
            changeOrigin: true,
          },
        }, // 联调环境
      },
      active: 'test', // 被激活的proxy环境
      https: false, // 是否开启https
    },
  },

  // uniframe: {
  //   desktop: {
  //     buildDest: '', // build后资源定制输出 path
  //     htmlDest: '', // html定制输出 path, 如果不需要向额外的目录输出buid后的html文件，此项留空即可
  //     publicPath: '/uniframe', // 静态资源公共地址(构建用)
  //     templateRoot: '@@/template/uniframe/desktop/public', // 定制index.html以及public资源所在文件夹
  //     port: 8008,
  //     mockPort: 8007,
  //     proxy: {
  //       mock: {}, // 本地mock环境
  //       test: {}, // 测试环境
  //       dev: {}, // 联调环境
  //     },
  //     active: 'mock', // 被激活的proxy环境
  //     https: false, // 是否开启https
  //   },
  // },
};
