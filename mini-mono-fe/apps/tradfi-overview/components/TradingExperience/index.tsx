import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useFm } from '@better-bit-fe/base-hooks';
import { WebmAnimation } from 'libs/base-ui/src/WebmAnimation';
import { basePath, getLang, isApp, goPage } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const FEATURES = [
  { titleKey: 'trading-exp-feature-1-title', descKey: 'trading-exp-feature-1-desc' },
  { titleKey: 'trading-exp-feature-2-title', descKey: 'trading-exp-feature-2-desc' },
  { titleKey: 'trading-exp-feature-3-title', descKey: 'trading-exp-feature-3-desc' }
];

const TradingExperience: React.FC = () => {
  const t = useFm();
  const lang = getLang();

  const handleTrade = () => {
    if (isApp()) {
      goPage('blockTrade', 'symbol=XAUUSD');
    } else {
      window.location.href = `/${lang}/tradfi/XAUUSD`;
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <FormattedMessage
            id="trading-exp-title"
            values={{
              line1: (text) => <span className={styles.titleLine1}>{text}</span>,
              line2: (text) => <span className={styles.titleLine2}>{text}</span>,
              highlight: (text) => <span className={styles.highlight}>{text}</span>
            }}
          />
        </h2>
      </div>
      <WebmAnimation
        className={styles.bgImage}
        introSrc={`${basePath}/images/trading-experience-bg.mp4`}
        loopSrc={`${basePath}/images/trading-experience-bg-loop.mp4`}
      />
      <div className={styles.inner}>
        <div className={styles.features}>
          {FEATURES.map((item, i) => (
            <div key={i} className={styles.feature}>
              <h3 className={styles.featureTitle}>{t(item.titleKey)}</h3>
              <p className={styles.featureDesc}>{t(item.descKey)}</p>
            </div>
          ))}
        </div>
        <div className={styles.ctaWrap}>
          <button className={styles.ctaBtn} onClick={handleTrade}>{t('trading-exp-cta')}</button>
        </div>
      </div>
    </section>
  );
}

export default TradingExperience;
