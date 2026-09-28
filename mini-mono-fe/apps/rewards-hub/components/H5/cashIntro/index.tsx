import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const TRIAL_CASH_INTRO_LIST = [
    'trial-cash-info-1',
    'trial-cash-info-2',
    'trial-cash-info-3',
    'trial-cash-info-4',
    'trial-cash-info-5',
    'trial-cash-info-6',
    'trialCashInfoUrl',
]

const DEDUCT_CASH_INTRO_LIST = [
    'deduct-cash-info-1',
    'deduct-cash-info-2',
    'deduct-cash-info-3',
    'deduct-cash-info-4',
    'deduct-cash-info-5',
    'deductCashInfoUrl',
]

const FaqItem = ({ question, answer }) => {
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };
    return (
        <div className={`${styles.faqItem} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.question} onClick={toggleCollapse}>
                {question}
                <span className={styles.toggleIcon}>{collapsed ? '+' : '-'}</span>
            </div>
            <div className={styles.answer} style={{ display: collapsed ? 'none' : 'block' }}>
                {answer.map((answerStr, ansIndex) => (
                    <p key={ansIndex}>{answerStr}</p>
                ))}
            </div>
        </div>
    );
}

const CashIntro = () => {
    const t = useFm();

    return (
        <div className={styles.cashIntroSection}>
            <div className={styles.title}>{t('trial-deduct-cash-title')}</div>
            <div className={styles.introItem}>
                <div className={styles.introTitle}>{t('trial-cash')}</div>
                <div className={styles.introContent}>
                    {TRIAL_CASH_INTRO_LIST.map((item, index) => (
                        <div key={index} className={styles.introListItem}>
                            <div className={styles.introListItemCount}>{index + 1}</div>
                            <div className={styles.introListItemContent} dangerouslySetInnerHTML={{ __html: t(item) }} />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.introItem}>
                <div className={styles.introTitle}>{t('deduct-cash')}</div>
                <div className={styles.introContent}>
                    {DEDUCT_CASH_INTRO_LIST.map((item, index) => (
                        <div key={index} className={styles.introListItem}>
                            <div className={styles.introListItemCount}>{index + 1}</div>
                            <div className={styles.introListItemContent} dangerouslySetInnerHTML={{ __html: t(item) }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CashIntro;