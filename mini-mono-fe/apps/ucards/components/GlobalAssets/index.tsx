import React from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const IMG = `${basePath}/images/`;
const VIDEO = `${basePath}/video`;

interface FeatureItem {
  iconMain: string;
  iconOverlay?: string;
  iconCls?: string;
  titleKey: string;
  descKey: string;
}

const ROW1: FeatureItem[] = [
  {
    iconMain: `${IMG}/ic-no-fee-card.svg`,
    iconCls: styles.iconNoFee,
    titleKey: 'ucard-global-feat1-title',
    descKey: 'ucard-global-feat1-desc'
  },
  {
    iconMain: `${IMG}/ic-fee.svg`,
    iconCls: styles.iconZeroFee,
    titleKey: 'ucard-global-feat2-title',
    descKey: 'ucard-global-feat2-desc'
  },
  {
    iconMain: `${IMG}/ic-recharge.svg`,
    titleKey: 'ucard-global-feat3-title',
    descKey: 'ucard-global-feat3-desc'
  }
];

const ROW2: FeatureItem[] = [
  {
    iconMain: `${IMG}/ic-shopping.svg`,
    titleKey: 'ucard-global-feat4-title',
    descKey: 'ucard-global-feat4-desc'
  },
  {
    iconMain: `${IMG}/ic-payment.svg`,
    titleKey: 'ucard-global-feat5-title',
    descKey: 'ucard-global-feat5-desc'
  }
];

interface FeatureCardProps extends FeatureItem {
  t: (key: string) => string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  iconMain,
  iconOverlay,
  iconCls,
  titleKey,
  descKey,
  t
}) => (
  <div className={styles.featureCard}>
    <div className={styles.cardHead}>
      <div className={[styles.iconBox, iconCls].filter(Boolean).join(' ')}>
        <img src={iconMain} alt="" aria-hidden="true" className={styles.iconMain} />
      </div>
      <h3 className={styles.cardTitle}>{t(titleKey)}</h3>
    </div>
    <p className={styles.cardDesc}>{t(descKey)}</p>
  </div>
);

const GlobalAssets: React.FC = () => {
  const t = useFm();

  return (
    <section className={styles.section}>
      <WebmAnimation
        className={styles.bg}
        loopSrc={`${VIDEO}/earth.mp4`}
        loopClassName="object-cover object-top"
      />
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('ucard-global-title')}</h2>
        <div className={styles.features}>
          <div className={styles.row}>
            {ROW1.map((f) => (
              <FeatureCard key={f.titleKey} {...f} t={t} />
            ))}
          </div>
          <div className={styles.row}>
            {ROW2.map((f) => (
              <FeatureCard key={f.titleKey} {...f} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalAssets;
