import React from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import { WebmAnimation, DownloadQrcode } from '@better-bit-fe/base-ui';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const VIDEO = `${basePath}/video`;

const CtaBanner: React.FC = () => {
  const t = useFm();
  return (
    <section className={styles.section}>
      <div className={styles.media} aria-hidden="true">
        <WebmAnimation
          className={styles.video}
          loopSrc={`${VIDEO}/scene.mp4`}
          loopClassName="object-cover"
        />
        <div className={styles.mediaOverlay} />
      </div>

      <div className={styles.inner}>
        <div className={styles.text}>
          <h2 className={styles.title}>{t('ucard-cta-title')}</h2>
          <p className={styles.desc}>{t('ucard-cta-desc1')}</p>
          <p className={styles.desc2}>{t('ucard-cta-desc2')}</p>
          <div className={styles.btnWrap}>
            <div className={styles.qrcodePopover} aria-hidden="true">
              <p className={styles.qrcodeTitle}>{t('ucard-hero-qrcode-title')}</p>
              <DownloadQrcode width="120px" height="120px" size={108} radius="8px" />
              <div className={styles.storeBadges}>
                <img
                  src={`${basePath}/images/apple.png`}
                  alt="Download on the App Store"
                  className={styles.storeBadge}
                />
                <span className={styles.badgeDivider} />
                <img
                  src={`${basePath}/images/google.png`}
                  alt="Get it on Google Play"
                  className={styles.storeBadge}
                />
              </div>
            </div>
            <button className={styles.btn}>
              {t('ucard-cta-apply')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
