import React from 'react';
import Document, { Html, Main, Head, NextScript } from 'next/document';
import { HtmlProps } from 'next/dist/shared/lib/html-context';
export default class CustomDocument extends Document<HtmlProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html className="theme-dex">
        <Head>
          <link rel="apple-touch-icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
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
        </body>
      </Html>
    );
  }
}
