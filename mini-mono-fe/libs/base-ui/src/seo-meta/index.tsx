interface ISEOMeta {
  locale?: string;
  locales?: string[];
  title?: string;
  ogTitle?: string;
  ogImage?: string;
  ogType?: string; // og:type，默认 'website'；文章等详情页可传 'article'
  description?: string;
  keywords?: string;
  host?: string;
  path?: string;
  // canonical/og:url 覆盖：默认取 path（自指）。当页面是其他 URL 的重复内容
  // （如回退英文的非内容语种）时，传入规范页 URL 以避免重复内容。
  canonical?: string;
  ignoreLocale?: boolean; // For builder pages with single locale
  isFromBuilder?: boolean;
}

/**
 * Since current locale from business in nextjs is not match HTML lang-locale standard, we do some process for compatible with standard
 * ref: https://c1ey4wdv9g.larksuite.com/wiki/wikusCtEHKf3q4qR3VAHE16tBVe
 * @param locale current locale from nextjs
 * @param isFromBuilder
 * @returns format lang
 */
export const getSeoFormatLang = (locale: string, isFromBuilder = false) => {
  let formatLocale = locale || '';
  if (formatLocale.toLowerCase() === 'fil-ph') {
    formatLocale = 'tl';
  }
  if (formatLocale.toLowerCase() === 'es-419') {
    formatLocale = 'es';
  }
  return isFromBuilder ? formatLocale.toLowerCase() : formatLocale;
};

export const getMetasAndLinks = ({
  locale,
  locales,
  title,
  ogTitle,
  ogImage,
  ogType = 'website',
  description,
  keywords,
  host,
  path,
  canonical,
  isFromBuilder = false,
  ignoreLocale = false
}: ISEOMeta) => {
  locales = (locales || []).filter((item) => item !== 'ed-ED'); // remove ed-ED locale
  // Common links
  const links = [
    {
      rel: 'canonical',
      href: canonical || path || `https://www.easicoin.io/${locale || 'en-US/'}`,
      hrefLang: locale || 'en-US'
    },
    {
      rel: 'alternate',
      href: path.replace(`${locale}`, 'en-US'),
      hrefLang: 'x-default'
    }
  ];

  // alternate links
  const alternateLinks = locales
    ?.filter((item) => item !== locale)
    ?.map((item) => ({
      rel: 'alternate',
      href: path.replace(`${locale}`, `${item}`),
      hrefLang: item
    }));

  // Common metas
  const metas = [
    {
      name: 'viewport',
      content:
        'width=device-width, user-scalable=no, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover',
      key: 'viewport'
    },
    {
      name: 'renderer',
      content: 'webkit',
      key: 'renderer'
    },
    // {
    //   name: 'robots',
    //   content:
    //     banSpiderRoutes.indexOf(path) === -1 &&
    //     (host || '').indexOf(banSpiderHost) === -1
    //       ? 'index,follow'
    //       : 'noindex',
    //   key: 'robots'
    // },
    {
      name: 'description',
      content: description || title,
      key: 'description'
    },
    {
      name: 'keywords',
      content: keywords || title,
      key: 'keywords'
    },
    {
      property: 'og:type',
      content: ogType || 'website',
      key: 'og:type'
    },
    {
      property: 'og:site_name',
      content: 'Easicoin',
      key: 'og:site_name'
    },
    {
      property: 'og:title',
      content: ogTitle || title,
      key: 'og:title'
    },
    {
      property: 'og:description',
      content: description || title,
      key: 'og:description'
    },
    {
      property: 'og:url',
      content: canonical || path || `https://easicoin.io/${locale || 'en-US/'}`,
      key: 'og:url'
    },
    {
      // hid: 'og:locale',
      property: 'og:locale',
      content: getSeoFormatLang(locale, isFromBuilder).replace(/-/g, '_'),
      key: 'og:locale'
    },
    {
      property: 'twitter:title',
      content: ogTitle || title,
      key: 'twitter:title'
    },
    {
      property: 'twitter:description',
      content: description || title,
      key: 'twitter:description'
    },
    {
      property: 'twitter:site',
      content: 'Easicoin',
      key: 'twitter:site'
    },
    {
      property: 'twitter:creator',
      content: 'Easicoin',
      key: 'twitter:creator'
    },
    // {
    //   name: 'facebook-domain-verification',
    //   content: '562817e58c38d16a', //
    //   key: 'facebook-domain-verification'
    // },
    // {
    //   name: 'yandex-verification',
    //   content: '562817e58c38d16a', //
    //   key: 'yandex-verification'
    // },
    // {
    //   name: 'google-site-verification',
    //   content: 'DeywfHpuCx0eiNzI9_EvZr7_SlEwtWYfXYxO2dTlR3g', //
    //   key: 'google-site-verification'
    // },

    // {
    //   name: 'naver-site-verification',
    //   content: '8cc5dd924ce164a6430383e6aade45773429fbcb', //
    //   key: 'naver-site-verification'
    // },
    // {
    //   name: 'baidu-site-verification',
    //   content: 'YMDABwHltA', //
    //   key: 'baidu-site-verification'
    // }
  ];
  metas.push(
    ...locales.map((lang) => {
      return {
        // hid: `og:locale:alternate-${getSeoFormatLang(lang, isFromBuilder)}`,
        property: 'og:locale:alternate',
        content: getSeoFormatLang(lang, isFromBuilder).replace(/-/g, '_'),
        key: `og:locale:alternate-${lang}`
      };
    })
  );

  // links.push(
  //   ...locales
  //     .filter((lang) => lang !== 'ed-ED')
  //     .map((lang) => {
  //       return {
  //         hid: `alternate-hreflang-${getSeoFormatLang(lang, isFromBuilder)}`,
  //         rel: 'alternate',
  //         href: `${linkHost}${getLocaleStr(lang, ignoreLocale, isFromBuilder)}${
  //           path || ''
  //         }`,
  //         hrefLang: getSeoFormatLang(lang, isFromBuilder)
  //       };
  //     })
  // );

  // Add image while share
  if (ogImage) {
    metas.push({
      property: 'og:image',
      content: ogImage,
      key: ogImage
    });
    metas.push({
      property: 'twitter:image',
      content: ogImage,
      key: `${ogImage}-twitter`
    });
    metas.push({
      property: 'twitter:image:src',
      content: ogImage,
      key: `${ogImage}-twitter-src`
    });
    metas.push({
      name: 'image',
      content: ogImage,
      key: `${ogImage}-image`
    });
    metas.push({
      property: 'twitter:card',
      content: 'summary_large_image',
      key: `${ogImage}-card`
    });
  }
  return (
    <>
      {metas.map((m, index) => (
        <meta key={index} {...m} />
      ))}
      {links.map((l, index) => (
        <link key={l.href + index} {...l} />
      ))}
      {alternateLinks.map((l, index) => (
        <link key={l.href + index} {...l} />
      ))}
    </>
  );
};
