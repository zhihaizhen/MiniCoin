import React from 'react';
import Marquee from 'react-fast-marquee';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const IMG = `${basePath}/images/`;

const CARDS = [
  { img: `${IMG}/card-ai.png`, titleKey: 'ucard-why-1-title', descKey: 'ucard-why-1-desc' },
  { img: `${IMG}/card-digital.png`, titleKey: 'ucard-why-2-title', descKey: 'ucard-why-2-desc' },
  { img: `${IMG}/card-shopping.png`, titleKey: 'ucard-why-3-title', descKey: 'ucard-why-3-desc' },
  { img: `${IMG}/card-ads.png`, titleKey: 'ucard-why-4-title', descKey: 'ucard-why-4-desc' },
  { img: `${IMG}/card-games.png`, titleKey: 'ucard-why-5-title', descKey: 'ucard-why-5-desc' },
  { img: `${IMG}/card-travel.png`, titleKey: 'ucard-why-6-title', descKey: 'ucard-why-6-desc' },
  { img: `${IMG}/card-daily.png`, titleKey: 'ucard-why-7-title', descKey: 'ucard-why-7-desc' }
];

const WhyChoose: React.FC = () => {
  const t = useFm();

  return (
    <section className={styles.section}>
      <img
        className={styles.starBg}
        src={`${IMG}/ucards-star.png`}
        alt=""
        aria-hidden="true"
      />
      <div className={styles.head}>
        <p className={styles.eyebrow}>{t('ucard-why-eyebrow')}</p>
        <h2 className={styles.title}>{t('ucard-why-title')}</h2>
        <p className={styles.desc}>{t('ucard-why-desc')}</p>
      </div>

      <div className={styles.marqueeContainer}>
        <Marquee speed={40} gradient={false} pauseOnHover className={styles.marquee}>
          {CARDS.map((card, i) => (
            <div key={i} className={styles.card}>
              <img src={card.img} alt="" aria-hidden="true" className={styles.cardImg} />
              <div className={styles.cardMask} />
              <div className={styles.cardContent}>
                <h4 className={styles.cardTitle}>{t(card.titleKey)}</h4>
                <p className={styles.cardDesc}>{t(card.descKey)}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default WhyChoose;
