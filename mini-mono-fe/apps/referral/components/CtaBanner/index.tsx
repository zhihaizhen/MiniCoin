import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { goPage } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

interface CtaBannerProps {
  isLogin?: boolean;
  maxReward?: string;
}

const CtaBanner: React.FC<CtaBannerProps> = ({ isLogin, maxReward = '600 USDT' }) => {
  const t = useFm();
  const { locale } = useRouter();

  // 用 ref 保存最新登录态，避免点击时读到旧闭包值
  const isLoginRef = useRef(isLogin);
  useEffect(() => {
    isLoginRef.current = isLogin;
  }, [isLogin]);

  const handleClick = () => {
    if (isLoginRef.current === true) {
      window.location.href = `/${locale}/activity-center/invite`;
    } else if (isLoginRef.current === false) {
      goPage('login');
    }
  };

  const titleHtml =
    t('invite-banner-title', { amount: `<span class="${styles.highlight}">${maxReward}</span>` }) ||
    `参与邀请好友活动，赚取最高 <span class="${styles.highlight}">${maxReward}</span> 奖励`;

  return (
    <section className={styles.ctaBanner}>
      <div className={styles.inner}>
        <p
          className={styles.title}
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
        <button className={styles.ctaButton} onClick={handleClick}>
          {t('invite-banner-btn') || '立即参与'}
        </button>
      </div>
    </section>
  );
};

export default CtaBanner;
