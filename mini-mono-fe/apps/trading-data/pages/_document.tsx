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
      <Html className="theme-dex theme-light">
        <Head>
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
