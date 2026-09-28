import React, { useState, useEffect } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const BANNER_HEIGHT = 60;

const RegisterBanner: React.FC = () => {
  const { isLogin } = useUserInfo();
  const t = useFm();
  const [visible, setVisible] = useState(true);

  const shouldShow = !isLogin && visible;

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (shouldShow && !isMobile) {
      document.body.style.paddingBottom = `${BANNER_HEIGHT}px`;
    } else {
      document.body.style.paddingBottom = '';
    }
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [shouldShow]);

  const handleRegister = () => {
    goPage('register')
  };

  if (!shouldShow) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <img className={styles.giftIcon} src={`${basePath}/images/gift-icon.png`} alt="" />
        <span className={styles.text}>{t('register-banner-text')}</span>
        <button className={styles.regBtn} onClick={handleRegister}>{t('register-banner-btn')}</button>
      </div>
      <button className={styles.closeBtn} onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  );
};

export default RegisterBanner;
