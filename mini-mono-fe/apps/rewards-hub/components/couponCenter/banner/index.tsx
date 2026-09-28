import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as IconShare } from '~/public/images/H5/ic_share.svg';
import { ReactComponent as IconCoupon } from '~/public/images/coupon/h5CouponIcon.svg';
import { useRouter } from 'next/router';
import styles from './index.module.less';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { basePath } from '@better-bit-fe/base-utils';

interface BannerProps {
  isLogin: boolean;
  couponCount?: number;
  openShareModal?: () => void;
}

const Banner = ({ isLogin, couponCount = 0, openShareModal }: BannerProps) => {
  const t = useFm();
  const router = useRouter();

  const handleGoRewardsHub = () => {
    const localePrefix = router.locale ? `/${router.locale}` : '';
    window.location.href = `${localePrefix}${basePath}/`;
  };

  return (
    <div className={styles.bannerSection}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbLink} onClick={handleGoRewardsHub}>
              {t('rewardsHub')}
            </span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{t('couponCenter')}</span>
          </div>
          <div className={styles.subtitle}>{t('couponCenter')}</div>
          <div className={styles.title}>{t('couponCenterDesc')}</div>
          <div className={styles.pcActions}>
            <div className={styles.pcCouponBtn}>
              <IconCoupon className={styles.pcCouponIcon} />
              <span className={styles.pcCouponLabel}>{t('availableCoupon')}</span>
              <span className={styles.pcCouponCount}>{couponCount}</span>
            </div>
            <button className={styles.pcShareBtn} onClick={() => openShareModal?.()}>
              <IconShare className={styles.pcShareIcon} />
            </button>
          </div>
        </div>
        <div className={styles.rightHero}>
          <WebmAnimation
            className={styles.heroVideo}
            loopSrc={`${basePath}/images/coupon/hero.mp4`}
          />
        </div>
      </div>
      {/* H5 专属布局 */}
      <div className={styles.h5Inner}>
        <WebmAnimation
          className={styles.h5Kv}
          loopSrc={`${basePath}/images/coupon/hero.mp4`}
        />
        <div className={styles.h5Content}>
          <div className={styles.h5Subtitle}>{t('couponCenter')}</div>
          <div className={styles.h5Title}>{t('couponCenterDesc')}</div>
          <div className={styles.h5Actions}>
            <div className={styles.h5CouponBtn}>
              <IconCoupon className={styles.h5CouponIconWrap} />
              <span className={styles.h5CouponLabel}>{t('availableCoupon')}</span>
              <span className={styles.h5CouponCount}>{couponCount}</span>
            </div>
            <button className={styles.h5ShareBtn} onClick={() => openShareModal?.()}>
              <IconShare className={styles.h5ShareIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
