// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { debounce, handleLoginJumpWithReturnPage } from '~/utils';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { isMobile, isApp } from '@better-bit-fe/base-utils';
import getConfig from 'next/config';
import ReferralShareModal from './referralShareModal';
import QrCodeModal from './qrCodeModal';
import styles from './index.module.less';
import { getReferralInfo } from '~/api';

const { staticFolder } = getConfig().publicRuntimeConfig;

export function referralPage() {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  const t = useFm();
  const { locale } = useRouter();
  const { isLogin, userInfo, updateUserInfo } = useUserInfo();
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrcodeModal, setShowQrcodeModal] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const isLoginRef = useRef(isLogin);
  useEffect(() => {
    isLoginRef.current = isLogin;
  }, [isLogin]);

  useEffect(() => {
    if (isLogin !== undefined) return;
    updateUserInfo().catch(() => { });
  }, [isLogin]);

  const handleLoginRef = useRef(
    debounce(() => {
      const isAppPlatform = isApp();
      if (isAppPlatform) {
        handleGoAppPage('loginpage', 'referral');
      } else {
        handleLoginJumpWithReturnPage();
      }
    }, 500)
  );

  const openShareModal = useCallback(() => {
    if (isLoginRef.current === true) {
      setShowShareModal(true);
    } else if (isLoginRef.current === false) {
      handleLoginRef.current();
    }
  }, []);

  const openQrcodeModal = useCallback(() => {
    if (isLoginRef.current === true) {
      setShowQrcodeModal(true);
    } else if (isLoginRef.current === false) {
      handleLoginRef.current();
    }
  }, []);

  const closeShareModal = () => {
    setShowShareModal(false)
  }

  const closeQrcodeModal = () => {
    setShowQrcodeModal(false)
  }

  const fetchReferralInfo = async () => {
    setReferralLoading(true);
    try {
      const res = await getReferralInfo();
      setReferralInfo(res);
    } catch (err) {
      console.error('fetchReferralInfo error', err);
    } finally {
      setReferralLoading(false);
    }
  }

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (isLogin === true) {
      fetchReferralInfo();
    }
  }, [isLogin])

  const btnLoading = isLogin === undefined || referralLoading;

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroImageWrapper}>
            <img
              src={`${staticFolder}/images/referral/hero-bg.png`}
              alt="Referral Hero"
              className={styles.heroImage}
            />
          </div>

          <div className={styles.heroLeft}>
            <div className={styles.heroContent}>
              {isMobileDevice ? (
                <div className={styles.heroTitleWrapper}>
                  <h1 className={styles.heroTitle}>{t('hero-title-line1')}</h1>
                  <h1 className={styles.heroTitle}>{t('hero-title-line2')}</h1>
                </div>
              ) : (
                <h1 className={styles.heroTitle}>{t('hero-title')}</h1>
              )}
              <p className={styles.heroDescription}>{t('hero-description')}</p>
            </div>

            <div className={styles.buttonGroup}>
              {btnLoading ? (
                <>
                  <div className={`${styles.skeleton} ${styles.skeletonPrimary}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonSecondary}`} />
                </>
              ) : (
                <>
                  <button
                    className={styles.primaryButton}
                    onClick={openShareModal}
                  >
                    {t('invite-friend')}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={openQrcodeModal}
                  >
                    <img
                      src={`${staticFolder}/images/referral/qrcode-icon.png`}
                      alt="Share"
                      width={24}
                      height={24}
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          <img
            src={`${staticFolder}/images/referral/hero-bg.png`}
            alt="Referral Hero"
            className={styles.heroImageRight}
          />
        </div>
      </section>

      <section className={styles.referralSection}>
        <div className={styles.inviteBannerCard}>
          <div className={styles.inviteBannerContent}>
            <div className={styles.inviteBannerTextGroup}>
              <h3
                className={styles.inviteBannerTitle}
                dangerouslySetInnerHTML={{
                  __html: t('invite-banner-title', { amount: `<span class="${styles.highlight}">600 USDT</span>` }) || `参与邀请好友活动赚 <span class="${styles.highlight}">600 USDT</span> 奖励`
                }}
              />
              <p className={styles.inviteBannerSubtitle}>
                {t('invite-banner-subtitle')}
              </p>
            </div>
            <button
              className={styles.inviteBannerBtn}
              onClick={() => {
                if (isLoginRef.current === true) {
                  window.location.href = `/${locale}/activity-center/invite`;
                } else if (isLoginRef.current === false) {
                  handleLoginRef.current();
                }
              }}
            >
              {t('invite-banner-btn')}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.benefitsContainer}>
          <div className={styles.benefitsHeader}>
            <img
              src={`${staticFolder}/images/referral/left-shadow.png`}
              alt=""
              className={styles.decorLineLeft}
            />
            <h2 className={styles.benefitsTitle}>{t('benefits-title')}</h2>
            <img
              src={`${staticFolder}/images/referral/right-shadow.png`}
              alt=""
              className={styles.decorLineRight}
            />
          </div>

          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <img
                src={`${staticFolder}/images/referral/benefit-icon-1.png`}
                alt="1对1客服服务"
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>{t('benefit-1-title')}</h3>
            </div>

            <div className={styles.benefitCard}>
              <img
                src={`${staticFolder}/images/referral/benefit-icon-2.png`}
                alt="行业最优的返佣体系"
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>{t('benefit-2-title')}</h3>
            </div>

            <div className={styles.benefitCard}>
              <img
                src={`${staticFolder}/images/referral/benefit-icon-3.png`}
                alt="丰富的线上线下活动"
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>{t('benefit-3-title')}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.recruitSection}>
        <div className={styles.recruitContainer}>
          <h2 className={styles.recruitTitle}>{t('recruit-title')}</h2>
          <p className={styles.recruitDescription}>{t('recruit-description')}</p>
        </div>
      </section>
      <ReferralShareModal referralInfo={referralInfo} modalOpen={showShareModal} onClose={closeShareModal} />
      <QrCodeModal referralInfo={referralInfo} modalOpen={showQrcodeModal} onClose={closeQrcodeModal} />
    </div>
  );
}
