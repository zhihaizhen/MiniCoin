//@ts-ignore
import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useState } from 'react';
import { formatThousandDigit } from '@better-bit-fe/base-utils';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { getCopyTradingDealers } from '~/api';
import { ReactComponent as ArrowRightSVG } from '~/public/images/homePage/arrow-right.svg';
import styles from './index.module.less';
import TraderCard from './traderCard';


const CopyTrading = () => {
    const t = useFm();
    const { locale } = useRouter();
    const [traders, setTraders] = useState([]);

    useEffect(() => {
        getCopyTradingDealersData();
    }, []);

    const getCopyTradingDealersData = async () => {
        const res = await getCopyTradingDealers();
        setTraders(res.records)
    }


    const handleMoreClick = () => {
        window.location.href = `/${locale}/downloadApp`;
    };

    return (
        <section className={cls(styles.CopyTrading)}>
            <div className={styles.coreContent}>
                <h2 className={styles.title}>{t('exploreProducts')}</h2>
                <div className={styles.mainContent}>
                    {/* 左侧信息区域 */}
                    <div className={styles.leftSection}>
                        <div className={styles.infoBlock}>
                            <h3 className={styles.subTitle}>{t('copyTradingTitle')}</h3>
                            <p className={styles.desc}> {t('copyTradingDesc')}</p>
                        </div>

                        <div className={styles.statsBlock}>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>1,450+</div>
                                <div className={styles.statLabel}>{t('tradingExperts')}</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>$21.59M</div>
                                <div className={`${styles.statLabel} text-right`}>{t('totalPnl')}</div>
                            </div>
                        </div>

                        <button className={styles.moreBtn} onClick={handleMoreClick}>
                            <span>{t('more')}</span>
                            <ArrowRightSVG className={styles.arrowIcon} />
                        </button>
                    </div>

                    {/* 右侧交易专家卡片区域 */}
                    <div className={styles.rightSection}>
                        <div className={styles.traderCards}>
                            {traders.map((trader) => (
                                <TraderCard key={trader.id} trader={trader} handleFollowClick={handleMoreClick} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CopyTrading;

