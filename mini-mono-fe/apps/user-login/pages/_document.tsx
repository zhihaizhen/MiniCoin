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
          <script
            async
            src={`/global-widget/global-widget.js?_=${new Date().getTime()}`}
            type="module"
          ></script>
        </Head>

        <body>
          <Main />
          <NextScript />
          <Script
            src="/static/common/base/css/index.js"
            strategy="beforeInteractive"
          />
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

          {/* <Script
            src="https://accounts.google.com/gsi/client"
            strategy="lazyOnload"
          />
          <Script
            src="https://apis.google.com/js/api.js"
            strategy="lazyOnload"
          /> */}
          {/*
          <Script
            strategy="lazyOnload"
            src="https://telegram.org/js/telegram-widget.js?22"
          ></Script> */}
        </body>
      </Html>
    );
  }
}
