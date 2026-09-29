import React from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { SymbolConfigProvider } from 'libs/ws-service';
import AnimatedSection from '~/components/AnimatedSection';
import Hero from '~/components/Hero';
import GlobalAssets from '~/components/GlobalAssets';
import Advantages from '~/components/Advantages';
import CommodityMarket from '~/components/CommodityMarket';
import TradingExperience from '~/components/TradingExperience';
import FirstTrade from '~/components/FirstTrade';
import FAQ from '~/components/FAQ';
import Partners from '~/components/Partners';
import RegisterBanner from '~/components/RegisterBanner';
import styles from './index.module.less';
import { isApp } from '@better-bit-fe/base-utils';

function Page() {
  useGlobalWidget({ isHideHeader: isApp() });

  return (
    <AntdConfig className={styles.page}>
      <SymbolConfigProvider>
        <AnimatedSection>
          <Hero />
        </AnimatedSection>
        <AnimatedSection>
          <GlobalAssets />
        </AnimatedSection>
        <AnimatedSection>
          <Advantages />
        </AnimatedSection>
        <AnimatedSection>
          <CommodityMarket />
        </AnimatedSection>
        <AnimatedSection>
          <TradingExperience />
        </AnimatedSection>
        <AnimatedSection>
          <FirstTrade />
        </AnimatedSection>
        <AnimatedSection>
          <FAQ />
        </AnimatedSection>
        <AnimatedSection>
          <Partners />
        </AnimatedSection>
        <RegisterBanner />
        <Chat />
      </SymbolConfigProvider>
    </AntdConfig>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['tradfi-overview', 'error_code', 'tradfi-symbol'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/promotion/tradfi-overview/`
    }
  };
};

export default withLayout(Page);
