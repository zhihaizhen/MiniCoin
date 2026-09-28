import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { goPage } from '@better-bit-fe/base-utils';
import { basePath } from '~/env';
import { ReactComponent as IconShare } from '~/public/icon/share.svg';
import styles from './index.module.less';
import { WebmAnimation } from '@better-bit-fe/base-ui';

interface BannerProps {
  isLogin?: boolean;
  rebateRate?: string;
  isAffiliate?: boolean;
  affiliateUrl?: string;
  onShare?: () => void;
}

const Banner: React.FC<BannerProps> = ({
  isLogin,
  rebateRate = '30',
  isAffiliate,
  affiliateUrl,
  onShare
}) => {
  const t = useFm();

  const handleAffiliate = () => {
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank');
    }
  };

  const titleTemplate = t('banner-title') || '邀请好友，最高得 {rate}% 返佣';
  const [titlePrefix, titleSuffix] = titleTemplate.split('{rate}');
  const titleNode = (
    <>
      {titlePrefix}
      <span className={styles.highlight}>{rebateRate}{titleSuffix}</span>
    </>
  );

  const handleLogin = () => {
    goPage('login');
  };

  const handleInvite = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    onShare?.();
  };

  /* ─── PC 按钮 ─── */
  const renderPCButtons = () => {
    if (isLogin === undefined) {
      return (
        <div className={styles.buttonGroup}>
          <div className={`${styles.skeleton} ${styles.skeletonPrimary}`} />
          <div className={`${styles.skeleton} ${styles.skeletonShare}`} />
        </div>
      );
    }

    if (!isLogin) {
      return (
        <div className={styles.buttonGroup}>
          <button className={styles.primaryButton} onClick={handleLogin}>
            {t('login-register') || '登录/注册'}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.buttonGroup}>
        <button className={styles.primaryButton} onClick={handleInvite}>
          {t('invite-friends') || '邀请好友'}
        </button>
        {isAffiliate && (
          <button className={styles.affiliateButton} onClick={handleAffiliate}>
            {t('affiliate-dashboard') || '合伙人管理后台'}
          </button>
        )}
        <button className={styles.shareButton} onClick={onShare}>
          <IconShare width={20} height={20} />
        </button>
      </div>
    );
  };

  /* ─── H5 按钮 ─── */
  const renderH5Buttons = () => {
    if (isLogin === undefined) {
      return (
        <div className={styles.h5ButtonGroup}>
          <div className={`${styles.skeleton} ${styles.skeletonH5Primary}`} />
        </div>
      );
    }

    if (!isLogin) {
      return (
        <div className={styles.h5ButtonGroup}>
          <button className={styles.h5PrimaryButton} onClick={handleLogin}>
            {t('login-register') || '登录/注册'}
          </button>
        </div>
      );
    }

    if (isAffiliate) {
      return (
        <div className={`${styles.h5ButtonGroup} ${styles.h5ButtonGroupColumn}`}>
          <button className={`${styles.h5PrimaryButton} ${styles.h5PrimaryButtonFull}`} onClick={handleInvite}>
            {t('invite-friends') || '邀请好友'}
          </button>
          <div className={styles.h5AffiliateRow}>
            <button className={styles.affiliateButton} onClick={handleAffiliate}>
              {t('affiliate-dashboard') || '合伙人管理后台'}
            </button>
            <button className={styles.h5ShareButton} onClick={onShare}>
              <IconShare width={20} height={20} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.h5ButtonGroup}>
        <button className={styles.h5PrimaryButton} onClick={handleInvite}>
          {t('invite-friends') || '邀请好友'}
        </button>
        <button className={styles.h5ShareButton} onClick={onShare}>
          <IconShare width={20} height={20} />
        </button>
      </div>
    );
  };

  return (
    <section className={styles.banner}>
      {/* ===== PC Layout ===== */}
      <div className={styles.pcInner}>
        <div className={styles.pcContent}>
          <h1 className={styles.pcTitle}>{titleNode}</h1>
          {renderPCButtons()}
        </div>
        <WebmAnimation
          className={styles.pcIllustration}
          loopSrc={`${basePath}/image/hero.mp4`}
        />
      </div>

      {/* ===== H5 Layout ===== */}
      <div className={styles.h5Inner}>
        <WebmAnimation
          className={styles.h5Illustration}
          loopSrc={`${basePath}/image/hero.mp4`}
        />
        <h1 className={styles.h5Title}>{titleNode}</h1>
        {renderH5Buttons()}
      </div>
    </section>
  );
};

export default Banner;
