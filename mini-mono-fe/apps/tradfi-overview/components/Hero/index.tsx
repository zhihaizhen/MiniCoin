import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { basePath, getLang, goPage, isApp } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import styles from './index.module.less';

const Hero: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const lang = getLang();

  const handleTrade = () => {
    if (isApp()) {
      goPage('blockTrade', `symbol=XAUUSD`);
    } else {
      window.location.href = `/${lang}/tradfi/XAUUSD`;
    }
  };

  return (
    <section className={styles.hero}>
      <img
        className={styles.heroBg}
        src={`${basePath}/images/hero-bg.png`}
        alt=""
        aria-hidden="true"
      />
      <div className={styles.heroContent}>
        <div className={styles.textArea}>
          <div className={styles.textGroup}>
            <div className={styles.brandRow}>
              <div className={styles.logoWrap}>
                <img className={styles.brandIcon} src={`${basePath}/images/logo.png`} alt="EasiCoin" />
                <span className={styles.brandName}>EASICOIN</span>
              </div>
              <span className={styles.tradfiLabel}>TradFi</span>
            </div>
            <h1 className={styles.headline}>{t('hero-headline')}</h1>
          </div>

          {isLogin === undefined ? (
            <div className={styles.ctaSkeleton} />
          ) : isLogin ? (
            <button className={styles.ctaBtn} onClick={handleTrade}>{t('hero-cta-trade')}</button>
          ) : (
            <button className={styles.ctaBtn} onClick={() => goPage('login')}>{t('hero-cta-register')}</button>
          )}
        </div>
        <div className={styles.imageArea}>
          <WebmAnimation
            className={styles.animPC}
            introSrc={`${basePath}/animate/hero-enter.webm`}
            loopSrc={`${basePath}/animate/hero-loop.webm`}
          />
          <WebmAnimation
            className={styles.animH5}
            loopSrc={`${basePath}/animate/hero-loop.webm`}
          />
        </div>
      </div>

    </section>
  );
};

export default Hero;
