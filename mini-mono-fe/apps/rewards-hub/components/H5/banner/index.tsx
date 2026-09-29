import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { toThousands } from '@unified/helpers';
import { ReactComponent as IconShare } from '~/public/images/H5/ic_share.svg';
import { ReactComponent as IconArrow } from '~/public/images/PC/chevron-right2.svg';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { useRouter } from 'next/router';
import styles from './index.module.less';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { basePath } from '@better-bit-fe/base-utils';

const Banner = ({ isLogin, couponCount = 0, openShareModal }) => {
  const t = useFm();
  const router = useRouter();
  const { locale } = router;

  const message = t('swapMaxUsdt');

  const handleLogin = () => {
    handleGoAppPage('loginpage', 'rewardsHub');
  };

  const handleCouponClick = () => {
    if (!isLogin) {
      handleLogin();
      return;
    }
    const localePrefix = locale ? `/${locale}` : '';
    window.location.href = `${localePrefix}${basePath}/coupon-center`;
  };

  return (
    <div className={styles.bannerSection}>
      <WebmAnimation
        className={styles.h5Kv}
        loopSrc={`${basePath}/images/coupon/hero2.mp4`}
      />
      <div className={styles.content}>
        <div className={styles.title}>{t('rewardsHub')}</div>
        <div className={styles.desc} dangerouslySetInnerHTML={{ __html: message }}></div>
        <div className={styles.couponRow} onClick={handleCouponClick}>
          <span className={styles.couponLabel}>{t('availableCoupon')}</span>
          <span className={styles.couponCount}>{couponCount}</span>
          <span className={styles.couponArrow}><IconArrow /></span>
        </div>
        {isLogin === false && <button className={styles.btn} onClick={handleLogin}>{t('loginOrSign')}</button>}
        {isLogin === true && <button className={`${styles.btn} ${styles.btnGlass}`} onClick={() => openShareModal?.()}>{t('share')}<IconShare /></button>}
      </div>
    </div>
  );
};

export default Banner;