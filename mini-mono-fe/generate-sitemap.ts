import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import * as fse from 'fs-extra';

const baseUrl = 'https://www.easicoin.io';

const locales = require('./config/locales').filter(
  (locale: string) => locale !== 'ed-ED'
);
// 过滤掉不需要的语言
const supportedPaths = [
  '',
  '/downloadApp',
  '/trade/usdt/BTCUSDT',
  // '/trade/inverse/BTCUSD',
  '/spot/exchange/BTC/USDT',
  '/trading-data/position',
  '/trading-data/fundfee',
  '/trading-data/risk-reserve',
  '/trading-data/split-symbol-params',
  '/trading-data/price',
  '/markets'
];
// 定义网站的页面路径
const pages = supportedPaths.flatMap((path) =>
  locales.map((locale: string) => `/${locale}${path}`)
);

async function generateSitemap() {
  try {
    // 创建一个 Sitemap 流
    const smStream = new SitemapStream({ hostname: baseUrl });

    supportedPaths.forEach((path) => {
      // 给每个 URL 生成对应的 hreflang 多语言声明
      // const links = locales.map((l: string) => ({
      //   lang: l,
      //   url: `${baseUrl}/${l}${path}`
      // }));
      locales.forEach((locale: string) => {
        const url = `/${locale}${path}`;

        smStream.write({
          url,
          changefreq: 'monthly',
          priority: 0.7,
          lastmod: new Date().toISOString()
          // links
        });
      });
    });

    // 结束 Sitemap 流
    smStream.end();

    // 将 Sitemap 流转换为 Promise
    const sitemap = await streamToPromise(smStream).then((data) =>
      data.toString()
    );

    await fse.ensureDir('dist');

    // 将 Sitemap 写入文件
    const writeStream = createWriteStream('sitemap.xml');
    writeStream.write(sitemap);
    writeStream.end();

    console.log('Sitemap 生成成功！');
  } catch (error) {
    console.error('生成 Sitemap 时出错：', error);
  }
}

// 调用生成 Sitemap 的函数
generateSitemap();
