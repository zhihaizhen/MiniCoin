// @ts-nocheck
import React from 'react';
import Document, { Html, Main, Head, NextScript } from 'next/document';
import Script from 'next/script';
import { isProduction, isTestnet } from '@better-bit-fe/base-utils';
import { HtmlProps } from 'next/dist/shared/lib/html-context';
import getConfig from 'next/config';

const { staticFolder } = getConfig().publicRuntimeConfig;
export default class CustomDocument extends Document<HtmlProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render() {
    return (
      <Html className="theme-dex theme-dark">
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
          <link href="https://fonts.googleapis.com" rel="preconnect" />
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: `{
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "CollectionPage",
                    "@id": "https://www.easicoin.io/",
                    "url": "https://www.easicoin.io/",
                    "name": "Easicoin - Global Cryptocurrency Trading Platform",
                    "isPartOf": {
                      "@id": "https://www.easicoin.io/#website"
                    },
                    "description": "EasiCoin  is a leading crypto exchange, backed by strong financial support, top reputation, and regulatory compliance. Your gateway to the future of finance.",
                    "breadcrumb": {
                      "@id": "https://www.easicoin.io/#breadcrumb"
                    }
                  },
                  {
                    "@type": "BreadcrumbList",
                    "@id": "https://www.easicoin.io/#breadcrumb",
                    "itemListElement": [
                      {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Easicoin"
                      }
                    ]
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://www.easicoin.io/#website",
                    "url": "https://www.easicoin.io/",
                    "name": "Easicoin",
                    "description": "EasiCoin  is a leading crypto exchange, backed by strong financial support, top reputation, and regulatory compliance. Your gateway to the future of finance.",
                    "publisher": {
                      "@id": "https://www.easicoin.io/#organization"
                    }
                  },
                  {
                    "@type": "Organization",
                    "@id": "https://www.easicoin.io/#organization",
                    "name": "Easicoin",
                    "url": "https://www.easicoin.io/",
                    "logo": {
                      "@type": "ImageObject",
                      "@id": "https://www.easicoin.io/#logo",
                      "url": "https://www.easicoin.io/brand.png",
                      "contentUrl": "https://www.easicoin.io/static/image/brand/ogImage.png",
                      "width": 1280,
                      "height": 720,
                      "caption": "Easicoin - Trade Digital Assets with Ease"
                    },
                    "image": {
                      "@id": "https://www.easicoin.io/#logo"
                    },
                    "sameAs": [
                      "https://x.com/EasiCoin_EN",
                      "https://t.me/EasiCoin_ZH",
                      "https://www.facebook.com/profile.php?id=61581140750334",
                      "https://www.instagram.com/easi_coin/",
                      "https://discord.gg/kfSyjuw9",
                      "https://medium.com/@easicoin402",
                      "https://apps.apple.com/us/app/easicoin-buy-btc-crypto/id6747739506",
                      "https://play.google.com/store/apps/details?id=io.easiex.app"
                    ]
                  }
                ]
              }`
            }}

          />
        </Head>

        <body>
          <div
            id="widget_header"
            style={{
              height: '65px', background: 'var(--bg-primary, #070808)', position: 'sticky',
              top: 0,
              zIndex: 999,
              borderBottom: '1px solid var(--line-border-default, #28292A)'

            }}
          />
          <Main />
          <div id="widget_footer" />
          <NextScript />
          {/* {isProduction && (
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-W6JZZQSWR1"
            ></script>
          )}
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8LNK8S8D50');
          `}
          </Script> */}
          {/* {isProduction && (
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
