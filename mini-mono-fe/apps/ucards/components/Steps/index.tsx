import React, { useState } from 'react';
import cls from 'classnames';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const IMG = `${basePath}/images/`;

const STEPS = [1, 2, 3].map((n) => ({
  img: `${IMG}/section4-step-${n}.png`,
  titleKey: `ucard-steps-${n}-title`,
  descKey: `ucard-steps-${n}-desc`
}));

const Steps: React.FC = () => {
  const t = useFm();
  const [active, setActive] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <span className={styles.eyebrow}>{t('ucard-steps-eyebrow')}</span>
          {t('ucard-steps-title')}
        </h2>

        <div className={styles.body}>
          <div className={styles.preview}>
            {STEPS.map((step, i) => (
              <img
                key={i}
                className={cls(styles.previewImg, {
                  [styles.previewActive]: i === active
                })}
                src={step.img}
                alt={t(step.titleKey)}
              />
            ))}
          </div>

          <div className={styles.divider}>
            <span
              className={styles.dividerThumb}
              style={{ top: `${(active / STEPS.length) * 100}%` }}
            />
          </div>

          <ul className={styles.list}>
            {STEPS.map((step, i) => (
              <li
                key={i}
                className={cls(styles.item, { [styles.itemActive]: i === active })}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className={styles.num}>{i + 1}</span>
                <div className={styles.itemContent}>
                  <h4 className={styles.itemTitle}>{t(step.titleKey)}</h4>
                  <p className={styles.itemDesc}>{t(step.descKey)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Steps;
