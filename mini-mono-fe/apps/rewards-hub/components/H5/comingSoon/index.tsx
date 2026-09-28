import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { handleAppExit } from '@better-bit-fe/app-bridge';
import styles from './index.module.less';

const ComingSoon = () => {
    useGlobalWidget();
    const t = useFm();

    const handleGoHome = () => {
        handleAppExit();
    };

    return (
        <div className={styles.comingSoonSection}>
            <div className={styles.container}>
                <div className={styles.iconContainer}>
                    <div className={styles.icon} />
                </div>
                <div className={styles.title}>{t('comingSoonTitle')}</div>
                <div className={styles.subtitle}>{t('comingSoonSubtitle')}</div>
                <div className={styles.description}>
                    {t('comingSoonDescription')}
                </div>
                <div className={styles.illustration} />
                <div className={styles.buttonGroup}>
                    <button className={styles.secondaryBtn} onClick={handleGoHome}>
                        {t('backToHome')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;