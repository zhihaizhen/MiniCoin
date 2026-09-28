import React from 'react';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { WebmAnimation } from 'libs/base-ui/src/WebmAnimation';
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const FirstTrade: React.FC = () => {
  const t = useFm();
  const { locale } = useRouter();
  const isChinese = locale?.startsWith('zh');
  const phoneSrc = isChinese
    ? `${basePath}/images/first-trade-phone.mp4`
    : `${basePath}/images/first-trade-phone-en.mp4`;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('first-trade-title')}</h2>
        <div className={styles.content}>
          <div className={styles.phoneWrap}>
            <WebmAnimation
              className={styles.phoneImg}
              loopSrc={phoneSrc}
            />
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>01</span>
                <span className={styles.stepLabel}>{t('first-trade-step-1-label')}</span>
              </div>
              <p className={styles.stepDesc}>{t('first-trade-step-1-desc')}</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>02</span>
                <span className={styles.stepLabel}>{t('first-trade-step-2-label')}</span>
              </div>
              <p className={styles.stepDesc}>{t('first-trade-step-2-desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirstTrade;
