import React from 'react';

import { Html, Main } from 'next/document';
import { getSeoFormatLang } from './seo-meta';
// import { getDirection } from '@better-bit-fe/base-utils';
import { HtmlProps } from 'next/dist/shared/lib/html-context';

export function CommonDocument(props: HtmlProps) {
  const { locale, defaultLocale } = props.__NEXT_DATA__;
  const lang = getSeoFormatLang(locale || defaultLocale);

  // 重定向时判断语言环境，更改布局属性
  // useEffect(() => {
  //   document.documentElement.dir = getDirection(lang);
  // }, [lang]);

  return (
    <Html lang={lang}>
      <body>
        <div
          id="widget_header"
          style={{ height: '64px', background: 'var(--bg-primary, #070808)', borderBottom: '1px solid var(--line-border-default, #28292A)' }}
        />
        <Main />
        <div id="widget_footer" />
      </body>
    </Html>
  );
}
