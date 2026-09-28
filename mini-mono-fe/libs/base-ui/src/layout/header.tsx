import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { LayoutContainerProps } from './container';
// import { getJsBridgeCdn, getUniFrameCdn } from '../cdn';
import { getMetasAndLinks } from '../seo-meta';

interface Props extends LayoutContainerProps {
  locales: string[];
  // hasLoadUniFrame: Boolean;
  // hasLoadJsBridge: Boolean;
}

export function Header(props: Props) {
  const {
    locale,
    title,
    ogTitle,
    ogImage,
    ogType,
    locales,
    description,
    canonical,
    path = 'https://www.easicoin.io'
    // hasLoadUniFrame = false,
    // hasLoadJsBridge = false
  } = props;
  // const { asPath } = useRouter();
  // const pathname = asPath.split('?')[0];
  // const basePath = 'https://www.easicoin.io';
  // let seoPath = asPath.split('?')[0];
  // if (!seoPath.includes(basePath)) {
  //   // For build time
  //   seoPath = `${basePath}${pathname}`;
  // }
  // if (!seoPath.endsWith('/')) {
  //   seoPath = `${seoPath}/`;
  // }
  const hasLoadCSP = false;
  return (
    <Head>
      <title>{title}</title>
      {getMetasAndLinks({
        locale,
        locales,
        title,
        description,
        ogImage,
        ogTitle,
        ogType,
        canonical,
        // host: getHost(),
        path
      })}

      {/* {hasLoadCSP && (
        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        ></meta>
      )} */}

      {/* {hasLoadUniFrame && (
        <link rel="preload" href={getUniFrameCdn()} as="script" />
      )}
      {hasLoadJsBridge && (
        <link rel="preload" href={getJsBridgeCdn()} as="script" />
      )} */}
    </Head>
  );
}
