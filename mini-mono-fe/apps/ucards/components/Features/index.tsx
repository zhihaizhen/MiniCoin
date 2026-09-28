import React from 'react';
import cls from 'classnames';
import { useRouter } from 'next/router';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const IMG = `${basePath}/images/`;
const EN_SUFFIX_INDEXES = new Set([1, 4]);

const Features: React.FC = () => {
  const t = useFm();
  const { locale } = useRouter();
  const isZh = locale?.startsWith('zh');

  const FEATURES = [1, 2, 3, 4].map((n) => {
    const useEn = !isZh && EN_SUFFIX_INDEXES.has(n);
    return {
      img: `${IMG}/section5-feature-${n}${useEn ? '-en' : ''}.png`,
      tagKey: `ucard-feature-${n}-tag`,
      titleKey: `ucard-feature-${n}-title`,
      descKey: `ucard-feature-${n}-desc`
    };
  });

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>{t('ucard-feature-eyebrow')}</p>
          <h2 className={styles.title}>{t('ucard-feature-title')}</h2>
        </div>

        <div className={styles.list}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={cls(styles.row, { [styles.reverse]: i % 2 === 1 })}
            >
              <div className={styles.text}>
                <span className={styles.tag}>{t(f.tagKey)}</span>
                <h3 className={styles.featTitle}>{t(f.titleKey)}</h3>
                <p className={styles.featDesc}>{t(f.descKey)}</p>
              </div>
              <div className={styles.media}>
                <img src={f.img} alt={t(f.titleKey)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
