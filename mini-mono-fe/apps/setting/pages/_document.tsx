// @ts-nocheck
import React from 'react';
import Document, { Html, Main, Head, NextScript } from 'next/document';
import Script from 'next/script';
import { isProduction, isTestnet } from '@better-bit-fe/base-utils';
import { HtmlProps } from 'next/dist/shared/lib/html-context';
export default class CustomDocument extends Document<HtmlProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render() {
    return (
      <Html className="theme-dex theme-light">
        <Head>
          {(isProduction || isTestnet) && (
            <meta
              httpEquiv="Content-Security-Policy"
              content="upgrade-insecure-requests"
            />
          )}
          <link rel="apple-touch-icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            href="https://fonts.gstatic.com"
            rel="preconnect"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            rev="stylesheet"
            type="text/css"
            media="screen"
            href="/static/common/base/css/index.css"
          ></link>
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

          {/* <Script
            strategy="lazyOnload"
            src="https://telegram.org/js/telegram-widget.js?22"
          ></Script> */}
        </body>
      </Html>
    );
  }
}
