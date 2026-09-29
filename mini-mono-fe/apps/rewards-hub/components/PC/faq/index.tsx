import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

const FAQ_LIST = [
    { questionKey: 'faq-ques-a', answerKeys: ['faq-ans-a'] },
    { questionKey: 'faq-ques-b', answerKeys: ['faq-ans-b-1', 'faq-ans-b-2', 'faq-ans-b-3'] },
    { questionKey: 'faq-ques-c', answerKeys: ['faq-ans-c'] },
    { questionKey: 'faq-ques-d', answerKeys: ['faq-ans-d'] },
    { questionKey: 'faq-ques-e', answerKeys: ['faq-ans-e'] },
    { questionKey: 'faq-ques-f', answerKeys: ['faq-ans-f'] },
    { questionKey: 'faq-ques-g', answerKeys: ['faq-ans-g-0', 'faq-ans-g-1', 'faq-ans-g-2', 'faq-ans-g-3', 'faq-ans-g-4'] },
    { questionKey: 'faq-ques-h', answerKeys: ['faq-ans-h-1', 'faq-ans-h-2', 'faq-ans-h-3', 'faq-ans-h-6', 'faq-ans-h-7'] },
    { questionKey: 'faq-ques-i', answerKeys: ['faq-ans-i'] },
    { questionKey: 'faq-ques-j', answerKeys: ['faq-ans-j'] },
    { questionKey: 'faq-ques-k', answerKeys: ['trialCashInfoUrl'] },
    { questionKey: 'faq-ques-l', answerKeys: ['deductCashInfoUrl'] },
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
                    <p key={ansIndex} dangerouslySetInnerHTML={{ __html: answerStr }} />
                ))}
            </div>
        </div>
    );
}

const Faq = () => {
    const t = useFm();

    return (
        <div className={styles.faqSection}>
            <div className={styles.title}>{t('faq-title')}</div>
            <div className={styles.faqList}>
                {FAQ_LIST.map((item, index) => (
                    <FaqItem key={index} question={t(item.questionKey)} answer={item.answerKeys.map(key => t(key))} />
                ))}
            </div>
        </div>
    );
};

export default Faq;