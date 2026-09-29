import React, { useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { toThousands } from '@unified/helpers';
import { useRouter } from 'next/router';
import styles from './index.module.less';

const BottomBanner = ({ isLogin }) => {
  const t = useFm();
  const { locale } = useRouter();
  const handleLogin = () => {
    window.location.href = `/${locale}/account/login`
  }

  const message = t('swapMaxUsdt');

  return (
    <div className={styles.bottomBannerSection}>
      <div className={styles.content}>
        <div className={styles.desc} dangerouslySetInnerHTML={{ __html: message }}></div>
        {!isLogin && <button className={styles.btn} onClick={handleLogin}>{t('loginOrSign')}</button>}
      </div>
    </div>
  );
};

export default BottomBanner;