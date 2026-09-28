import React from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import { WebmAnimation, DownloadQrcode } from '@better-bit-fe/base-ui';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const VIDEO = `${basePath}/video`;

interface HeroProps {
  handleShare?: () => void;
}

const Hero: React.FC<HeroProps> = ({ handleShare }) => {
  const t = useFm();

  return (
    <section className={styles.hero}>
      <WebmAnimation
        className={styles.bg}
        loopSrc={`${VIDEO}/hero.mp4`}
        loopClassName="object-cover"
      />
      <div className={styles.gradient} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            <span className={styles.titleBrand}>{t('ucard-hero-title-brand')}</span>
            <br />
            <span className={styles.titleSub}>{t('ucard-hero-title-sub')}</span>
          </h1>
          <p className={styles.desc}>{t('ucard-hero-desc')}</p>
          <div className={styles.actions}>
            <div className={styles.applyWrap}>
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
              <button className={styles.btnBrand}>
                {t('ucard-hero-apply')}
              </button>
            </div>
            <button className={styles.btnWhite} onClick={handleShare}>
              {t('ucard-hero-share')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
