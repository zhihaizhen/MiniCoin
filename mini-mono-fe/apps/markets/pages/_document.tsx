// @ts-nocheck
import React from 'react';
import { isProduction, isTestnet } from '@better-bit-fe/base-utils';
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
          <link rel="apple-touch-icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="stylesheet"
            rev="stylesheet"
            type="text/css"
            media="screen"
            href="/static/common/base/css/index.css"
          />
          <script
            async
            src={`/global-widget/global-widget.js?_=${new Date().getTime()}`}
            type="module"
          ></script>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: `{
                  "@context": "https://schema.org", 
                  "@type": "WebSite", 
                   "name": "EasiCoin",
                  "url": "https://easicoin.io/"
                }`
            }}
          />
        </Head>

        <body>
          <Main />
          <NextScript />
          {/* {isProduction && (
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-W6JZZQSWR1"
            ></script>
          )}
          {isProduction && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-W6JZZQSWR1');
              `
              }}
            />
          )} */}
        </body>
      </Html>
    );
  }
}
