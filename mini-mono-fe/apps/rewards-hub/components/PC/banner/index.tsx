import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as IconShare } from '~/public/images/PC/ic_share.svg';
import { ReactComponent as IconArrow } from '~/public/images/PC/chevron-right2.svg';
import { useRouter } from 'next/router';
import styles from './index.module.less';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { basePath, goPage } from '@better-bit-fe/base-utils';

const Banner = ({ isLogin, couponCount = 0, openShareModal }) => {
  const t = useFm();
  const router = useRouter();
  const { locale } = router;

  const handleLogin = () => {
    goPage('login');
  };

  const handleCouponClick = () => {
    if (!isLogin) {
      handleLogin();
      return;
    }
    const localePrefix = locale ? `/${locale}` : '';
    window.location.href = `${localePrefix}${basePath}/coupon-center`;
  };

  const message = t('swapMaxUsdt');

  return (
    <div className={styles.bannerSection}>
      <div className={styles.content}>
        <div className={styles.title}>{t('rewardsHub')}</div>
        <div className={styles.desc} dangerouslySetInnerHTML={{ __html: message }}></div>
        <div className={styles.couponRow} onClick={handleCouponClick}>
          <span className={styles.couponLabel}>{t('availableCoupon')}</span>
          <span className={styles.couponCount}>{couponCount}</span>
          <span className={styles.couponArrow}><IconArrow /></span>
        </div>
        <div className={styles.btnWrapper}>
          {isLogin === false && <button className={styles.btn} onClick={handleLogin}>{t('loginOrSign')}</button>}
          {isLogin === true && <button className={styles.btn} onClick={() => openShareModal?.()}>{t('share')}<IconShare /></button>}
        </div>
      </div>
      <div className={styles.rightHero}>
        <WebmAnimation
          className={styles.heroVideo}
          loopSrc={`${basePath}/images/coupon/hero2.mp4`}
        />
      </div>
    </div>
  );
};

export default Banner;