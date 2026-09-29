import { getTmsMessages } from '@better-bit-fe/lang';
import { withLayout } from '@better-bit-fe/base-ui';
import React, { useState, useEffect } from 'react';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getLang } from '@better-bit-fe/base-utils';
import { urlInfo } from '@region-lib/env';
import getConfig from 'next/config';
import { goPage, isMobile } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { debounce, handleLoginJumpWithReturnPage } from '~/utils';
import styles from './index.module.less';

const { staticFolder } = getConfig().publicRuntimeConfig;

function OpenApiPage() {
  const t = useFm();
  const { isLogin } = useUserInfo();

  useGlobalWidget();

  useEffect(() => {
    if (isMobile()) {
      goPage('download');
    }
  }, []);

  const getApiDocsUrl = () => {
    const { env } = urlInfo;
    const lang = getLang();
    let path = '';

    if (lang === 'zh-CN' || lang === 'zh-TW' || lang === 'zh-HK') {
      path = '/api-doc/zh-CN/common/Info';
    } else {
      path = '/api-doc/common/Info';
    }

    if (env === 'prod') {
      // 生产环境使用当前域名
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.bitrunfinance.com';
      return `${origin}${path}`;
    }
    // test 和 testnet 环境都使用测试环境链接
    return `https://www.test.bitrunfinance.com${path}`;
  };

  const handleLogin = debounce(() => {
    handleLoginJumpWithReturnPage();
  }, 500);

  const handleCreateApiKey = () => {
    if (isLogin) {
      const lang = getLang();
      window.location.href = `/${lang}/setting/newapi`;
    } else {
      handleLogin();
    }
  };

  const handleViewApiDocs = () => {
    const url = getApiDocsUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section
        className={`${styles.heroSection} banner-theme-dark`}
      >
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>EasiCoin API</h1>
            <p className={styles.heroDescription}>{t('hero-description')}</p>
            <div className={styles.heroButtons}>
              <button className={styles.primaryButton} onClick={handleCreateApiKey}>
                {t('create-api-key')}
              </button>
              <button className={styles.secondaryButton} onClick={handleViewApiDocs}>
                {t('view-api-docs')}
              </button>
            </div>
          </div>
          <img
            src={`${staticFolder}/images/api.png`}
            alt="api"
            className={styles.symbolImage}
          />
        </div>
      </section>
      <section className={styles.apiSection}>
        <h2 className={styles.apiTitle}>{t('api-section-title')}</h2>
        <p className={styles.apiSubTitle}>{t('api-section-sub-title')}</p>
        <div className={styles.apiContainer}>
          <div className={styles.apiHeader}>
            <p className={styles.apiDescription}>
              <span>{t('api-section-description')}</span>
            </p>
          </div>
          <div className={styles.apiFlow}>
            <div className={styles.flowItem}>
              <div className={styles.flowIcon}>
                <img
                  src={`${staticFolder}/images/user-icon.png`}
                  alt="user"
                  className={styles.iconImage}
                />
              </div>
              <div className={styles.flowLabel}>{t('api-flow-user')}</div>
            </div>
            <div className={styles.flowArrow}>
              <div className={styles.arrowLine} />
              <div className={styles.arrowText}>{t('api-flow-step1')}</div>
            </div>
            <div className={styles.flowItem}>
              <div className={styles.flowIcon}>
                <img
                  src={`${staticFolder}/images/api-icon.png`}
                  alt="api"
                  className={styles.iconImage}
                />
              </div>
              <div className={styles.flowLabel}>API</div>
            </div>
            <div className={styles.flowArrow}>
              <div className={styles.arrowLine} />
              <div className={styles.arrowText}>{t('api-flow-step2')}</div>
            </div>
            <div className={styles.flowItem}>
              <div className={styles.flowIcon}>
                <img
                  src={`${staticFolder}/images/logo-icon.png`}
                  alt="easicoin"
                  className={styles.iconImage}
                />
              </div>
              <div className={styles.flowLabel}>EasiCoin API</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['footer', 'open-api', 'gitbook-url'],
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
      ogImage: '/static/image/brand/ogImage.png',
      path: `/${locale}/open-api/`
    }
  };
};

export default withLayout(OpenApiPage);
