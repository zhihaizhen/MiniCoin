import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { ReactComponent as ArrowRightSVG } from '~/public/images/homePage/arrow-right.svg';
import { ReactComponent as CollapsedIcon } from '~/public/images/homePage/collapsed.svg';
import { ReactComponent as ExpandedIcon } from '~/public/images/homePage/expanded.svg';
import { normalizeLocale } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const FAQ_LIST = [
    { questionKey: 'faq-q-what', answerKeys: ['faq-a-what'] },
    { questionKey: 'faq-q-has-products', answerKeys: ['faq-a-has-products'] },
    { questionKey: 'faq-q-how-buy', answerKeys: ['faq-a-how-buy'] },
    { questionKey: 'faq-q-how-track', answerKeys: ['faq-a-how-track'] },
    { questionKey: 'faq-q-how-trade', answerKeys: ['faq-a-how-trade'] },
    { questionKey: 'faq-q-is-safety', answerKeys: ['faq-a-is-safety'] },
    { questionKey: 'faq-q-products-support', answerKeys: ['faq-a-products-support'] },

]

const FaqItem = ({ question, answer }) => {
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };



    return (
        <div className={`${styles.faqItem} ${collapsed ? '' : styles.expanded}`}>
            <div className={styles.question} onClick={toggleCollapse}>
                {question}
                <span className={styles.toggleIcon}>
                    {collapsed ? <CollapsedIcon /> : <ExpandedIcon />}
                </span>
            </div>
            <div className={styles.answer} style={{ display: collapsed ? 'none' : 'block' }}>
                {answer.map((answerStr, ansIndex) => (
                    <div key={ansIndex} dangerouslySetInnerHTML={{ __html: answerStr }} />
                ))}
            </div>
        </div>
    );
}

const Faq = () => {
    const t = useFm();
    const { locale } = useRouter();

    const gotoHelpCenter = () => {
        const lang = normalizeLocale(locale);
        window.open(`https://easicoin.zendesk.com/hc/${lang}`);
    }
    return (
        <div className={styles.faqSection}>
            <div className={styles.coreContent}>
                <div className={styles.title}>{t('commonQuestion')}</div>
                <div className={styles.faqList}>
                    {FAQ_LIST.map((item, index) => (
                        <FaqItem key={index} question={t(item.questionKey)} answer={item.answerKeys.map(key => t(key))} />
                    ))}
                </div>
                <div className={styles.help} onClick={gotoHelpCenter}>
                    {t('helpCenter')}
                    <ArrowRightSVG />
                </div>
            </div>
        </div>
    );
};

export default Faq;