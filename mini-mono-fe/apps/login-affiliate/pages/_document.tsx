// @ts-nocheck
import React from 'react';
import Document, { Html, Main, Head, NextScript } from 'next/document';
import Script from 'next/script';
import { HtmlProps } from 'next/dist/shared/lib/html-context';
export default class CustomDocument extends Document<> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render() {
    return (
      <Html className="theme-dex theme-dark">
        <Head>
          {/* <link
            rel="canonical"
            href="https://v8u7k50ylv0nzegojr867a.xyzk/zh-CN/"
          />
          <link
            rel="alternate"
            href="https://v8u7k50ylv0nzegojr867a.xyz/zh-CN/"
            hrefLang="x-default"
          /> */}
          {/* <link type="image/x-icon" rel="shortcut icon" href="/" /> */}
          <script
            async
            src={`/global-widget/global-widget.js?_=${new Date().getTime()}`}
            type="module"
          ></script>
        </Head>

        <body>
          <Main />
          <NextScript />
          {/* <Script
            src="/static/common/base/js/index.js"
            strategy="beforeInteractive"
          /> */}
          {/* <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-8LNK8S8D50"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8LNK8S8D50');
          `}
          </Script>
          <Script
            strategy="lazyOnload"
            src="https://telegram.org/js/telegram-widget.js?22"
          ></Script> */}
        </body>
      </Html>
    );
  }
}
