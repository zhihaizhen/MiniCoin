module.exports = {
  forward: {
    desktop: {
      // swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/\.map$/, /asset-manifest\.json$/, /index.html/],
      // importWorkboxFrom: 'local',
      // navigateFallback: publicUrl + '/index.html',
      navigateFallbackDenylist: [
        // Exclude URLs starting with /_, as they're likely an API call
        new RegExp('^/_'),
        // Exclude any URLs whose last part seems to be a file extension
        // as they're likely a resource and not a SPA route.
        // URLs containing a "?" character won't be blacklisted as they're likely
        // a route with query params (e.g. auth callbacks).
        new RegExp('/[^/?]+\\.[^/]+$'),
      ],
      inlineWorkboxRuntime: false,
      sourcemap: false,
      navigationPreload: true,
      runtimeCaching: [
        // tradingview静态资源
        {
          urlPattern: /tradingview/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'tradingview',
            expiration: {
              // maxEntries: 5,
              maxAgeSeconds: 6000,
            },
            fetchOptions: {
              mode: 'no-cors',
            },
          },
        },
        // 开发测试环境翻译资源
        {
          urlPattern: /^/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'translations',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 线上测翻译资源
        {
          urlPattern: /translations/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'translations',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 测试图片资源
        {
          urlPattern: /^\/assets\/image/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'images',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 线上图片资源
        {
          urlPattern: /^\/assets\/image/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'images',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // index.html
        {
          urlPattern: /trade\/usdt\/\w{0,}(\/){0,}$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'index.html',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
  reverse: {
    desktop: {
      // swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/\.map$/, /asset-manifest\.json$/, /index.html/],
      // importWorkboxFrom: 'local',
      // navigateFallback: publicUrl + '/index.html',
      navigateFallbackDenylist: [
        // Exclude URLs starting with /_, as they're likely an API call
        new RegExp('^/_'),
        // Exclude any URLs whose last part seems to be a file extension
        // as they're likely a resource and not a SPA route.
        // URLs containing a "?" character won't be blacklisted as they're likely
        // a route with query params (e.g. auth callbacks).
        new RegExp('/[^/?]+\\.[^/]+$'),
      ],
      inlineWorkboxRuntime: false,
      sourcemap: false,
      navigationPreload: true,
      runtimeCaching: [
        // tradingview静态资源
        {
          urlPattern: /tradingview/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'tradingview',
            expiration: {
              // maxEntries: 5,
              maxAgeSeconds: 6000,
            },
            fetchOptions: {
              mode: 'no-cors',
            },
          },
        },
        // 开发测试环境翻译资源
        {
          urlPattern: /^https:\/\/tms\.ffe390afd658c19dcbf707e0597b846d\.de/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'translations',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 线上测翻译资源
        {
          urlPattern: /translations/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'translations',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 测试图片资源
        {
          urlPattern: /^\/assets\/image/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'images',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // 线上图片资源
        {
          urlPattern: /^\/assets\/image/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'images',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // index.html
        {
          urlPattern: /trade\/inverse\/\w{0,}(\/){0,}$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'index.html',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
};
