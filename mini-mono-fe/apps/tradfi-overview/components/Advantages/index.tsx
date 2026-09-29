import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useFm } from '@better-bit-fe/base-hooks';
import { WebmAnimation } from 'libs/base-ui/src/WebmAnimation';
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const CARDS = [
  { icon: `${basePath}/images/advantage-1.png`, titleKey: 'advantages-card-1-title', descKey: 'advantages-card-1-desc' },
  { icon: `${basePath}/images/advantage-2.png`, titleKey: 'advantages-card-2-title', descKey: 'advantages-card-2-desc' },
  { icon: `${basePath}/images/advantage-3.png`, titleKey: 'advantages-card-3-title', descKey: 'advantages-card-3-desc' },
  { icon: `${basePath}/images/advantage-4.png`, titleKey: 'advantages-card-4-title', descKey: 'advantages-card-4-desc' }
];

const Advantages: React.FC = () => {
  const t = useFm();

  return (
    <section className={styles.section}>
      <WebmAnimation
        className={styles.bgImage}
        loopSrc={`${basePath}/images/advantages-bg.mp4`}
      />
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <FormattedMessage
            id="advantages-title"
            values={{
              highlight: (text) => <span className={styles.highlight}>{text}</span>
            }}
          />
        </h2>
        <div className={styles.cards}>
          {CARDS.map((card, i) => (
            <div key={i} className={styles.card}>
              <img className={styles.cardIcon} src={card.icon} alt={t(card.titleKey)} />
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{t(card.titleKey)}</h3>
                <p className={styles.cardDesc}>{t(card.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
