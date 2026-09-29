import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const ComingSoon = () => {
    useGlobalWidget();
    const t = useFm();
    const { locale } = useRouter();

    const handleGoHome = () => {
        window.location.href = `/${locale}/`;
    };

    return (
        <div className={styles.comingSoonSection}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.iconContainer}>
                        <div className={styles.icon} />
                    </div>
                    <div className={styles.title}>{t('comingSoonTitle')}</div>
                    <div className={styles.subtitle}>{t('comingSoonSubtitle')}</div>
                    <div className={styles.description}>
                        {t('comingSoonDescription')}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.secondaryBtn} onClick={handleGoHome}>
                            {t('backToHome')}
                        </button>
                    </div>
                </div>
                <div className={styles.illustration} />
            </div>
        </div>
    );
};

export default ComingSoon;