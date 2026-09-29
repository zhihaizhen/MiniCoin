import React from 'react';
// import { LayoutOptions } from '.';
// import { Body } from './body';
import { Header } from './header';
import { Body } from './newbody';
import { LocalesInfo } from '@better-bit-fe/base-provider';

// export interface LayoutContainerProps extends LayoutOptions {
//   locale: string;
//   children: React.ReactNode;
//   // seo
//   title: string;
//   description: string;
//   // 社媒
//   ogTitle?: string;
//   ogImage?: string;
// }

export interface LayoutContainerProps {
  locale: string;
  children: React.ReactNode;
  // seo
  title: string;
  description: string;
  // 社媒
  ogTitle?: string;
  ogImage?: string;
  ogType?: string;
  locales?: string[];
  path?: string;
  canonical?: string;
}

export function LayoutContainer(props: LayoutContainerProps) {
  const { locales } = LocalesInfo.useContainer();

  return (
    <>
      <Header {...props} locales={locales} />
      <Body {...props} locales={locales} />
    </>
  );
}
