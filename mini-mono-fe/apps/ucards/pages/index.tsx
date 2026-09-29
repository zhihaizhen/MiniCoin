/**
 * Index pages
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withLayout, AntdConfig, Chat, ReferralShareModal, Partners } from '@better-bit-fe/base-ui';
import { useGlobalWidget, useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getTmsMessages } from '@better-bit-fe/lang';
import { isApp, basePath, goPage } from '@better-bit-fe/base-utils';
import AnimatedSection from '~/components/AnimatedSection';
import Hero from '~/components/Hero';
import GlobalAssets from '~/components/GlobalAssets';
import WhyChoose from '~/components/WhyChoose';
import Steps from '~/components/Steps';
import Features from '~/components/Features';
import CtaBanner from '~/components/CtaBanner';
import FAQ from '~/components/FAQ';
import { getConfigPublic, getConfigPrivate, getReferralInfo } from '~/api';
import type { ReferralConfig, ReferralInfo } from '~/types/referral';
import styles from './index.module.less';

function Page() {
  useGlobalWidget({ isHideHeader: isApp() });

  const t = useFm();
  const { isLogin } = useUserInfo();
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [config, setConfig] = useState<ReferralConfig | null>(null);

  useEffect(() => {
    if (isLogin === undefined) return;
    const fetcher = isLogin ? getConfigPrivate : getConfigPublic;
    fetcher().then(setConfig).catch(console.error);
  }, [isLogin]);

  useEffect(() => {
    if (isLogin !== true) return;
    getReferralInfo().then(setReferralInfo).catch(console.error);
  }, [isLogin]);

  const handleShare = useCallback(() => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    setShowShareModal(true);
  }, [isLogin]);

  return (
    <AntdConfig className={styles.page}>
      <AnimatedSection>
        <Hero handleShare={handleShare} />
      </AnimatedSection>
      <AnimatedSection>
        <GlobalAssets />
      </AnimatedSection>
      <div ref={whyChooseRef}>
        <AnimatedSection>
          <WhyChoose />
        </AnimatedSection>
      </div>
      <AnimatedSection>
        <Steps />
      </AnimatedSection>
      <AnimatedSection>
        <Features />
      </AnimatedSection>
      <AnimatedSection>
        <CtaBanner />
      </AnimatedSection>
      <AnimatedSection>
        <FAQ />
      </AnimatedSection>
      <AnimatedSection>
        <Partners />
      </AnimatedSection>
      <Chat />
      <ReferralShareModal
        modalOpen={showShareModal}
        referralInfo={referralInfo}
        basePath={basePath}
        shareTextContent={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px', letterSpacing: '-0.24px', color: 'var(--text-brand-default-web, #abe127)' }}>
              EasiCoin Card
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, lineHeight: '36px', letterSpacing: '-0.24px', color: 'var(--text-primary, #f5f5f5)' }}>
              {t('ucard-share-title-sub')}
            </span>
          </div>
        }
        onClose={() => setShowShareModal(false)}
      />
    </AntdConfig>
  );
}

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，加载的语言内容最终会被打包生成到html中
 *
 * @param ctx
 * @returns
 */
export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['u-card', 'error_code'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: 'EasiCoin Card',
      description: messages.description,
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/promotion/ucards/`
    }
  };
};

export default withLayout(Page);
