// @ts-nocheck
import React from 'react';
import Document, { Html, Main, Head, NextScript } from 'next/document';
import Script from 'next/script';
import { HtmlProps } from 'next/dist/shared/lib/html-context';
export default class CustomDocument extends Document<HtmlProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render() {
    return (
      <Html className="theme-dex theme-dark">
        <Head>
          <link
            hid="canonical-lang-zh-CN"
            rel="canonical"
            href="https://easicoin.io/zh-CN/"
          />
          <link
            hid="alternate-hreflang-x-default"
            rel="alternate"
            href="https://easicoin.io/zh-CN/"
            hrefLang="x-default"
          />
          <link rel="apple-touch-icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <script
            async
            src={`/global-widget/global-widget.js?_=${new Date().getTime()}`}
            type="module"
          ></script>
          <script
            async
            src={`https://unpkg.com/vconsole@latest/dist/vconsole.min.js`}
            type="module"
          ></script>
        </Head>

        <body>
          <Main />
          <NextScript />
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
          </Script> */}
        </body>
      </Html>
    );
  }
}
