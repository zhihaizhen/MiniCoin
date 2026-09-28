//@ts-ignore
import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { formatThousandDigit } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import { ReactComponent as UserIcon } from '~/public/images/homePage/user.svg';
import { TendChart } from '@better-bit-fe/base-ui';

interface TraderCardProps {
    trader: {
        id: number;
        logo_url: string;
        dealer_name: string;
        max_copy_user: string;
        current_copy_user: string;
        total_position_value: string;
        pnl_percent_last30day: string;
        smart_chart_last30day: any;
    },
    handleFollowClick: () => void;
}

const TraderCard: React.FC<TraderCardProps> = ({ trader, handleFollowClick }) => {
    const t = useFm();
    //     [4154.237, 4154.653, 4168.81, 4150.301, 4151.012, 4138.897, 4160.852, 4161.55, 4161.225, 4160, 4159.588, 4160.783, 4161.237, 4167.435, 4163.371, 4162.518, 4150.515, 4139.466, 4142.499, 4147.011, 4143.853, 4152.496, 4154.435, 4161.542, 4151.75]
    const lineData = trader.smart_chart_last30day?.split(',')
    // (30) ['0', '0', '0', '-88.62', '-201.2', '-201.2', '-201.2', '-201.2', '-178.29', '-331.71', '-918.43', '-918.43', '-918.43', '-918.43', '-918.43', '-918.43', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37', '786.37']


    return (
        <div className={styles.traderCard}>
            <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                    <img src={trader.logo_url || '/images/homePage/default-avatar.svg'} alt={trader.dealer_name} />
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{trader.dealer_name}</div>
                    <div className={styles.rating}>
                        <UserIcon className={styles.starIcon} />
                        <span className={styles.winRate}>
                            {trader.current_copy_user}
                            <span className={styles.winRateDivider}>/</span>
                            <span className={styles.winRateTotal}>{trader.max_copy_user}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('copyOrderSize')}</span>
                    <span className={styles.statValue}>
                      {isNaN(Number(trader?.total_position_value)) ? '-' : `$${formatThousandDigit( trader?.total_position_value)}`}
                    </span>
                </div>

                <div className={styles.returnRow}>
                  <div className={styles.returnValue}>
                    {isNaN(Number(trader.pnl_percent_last30day))
                      ? '-'
                      : `${Number(trader.pnl_percent_last30day) > 0 ? '+' : ''}${trader.pnl_percent_last30day}%`
                      }
                    </div>
                    <div className={styles.returnLabel}>{t('pnlLast30')}</div>
                </div>

                {/* 图表占位 */}
                <div className={styles.chart}>
                    <TendChart chartDataList={lineData} isUp={true} width={212} height={48} />
                </div>
            </div>

            <button className={styles.followBtn} onClick={handleFollowClick}>
                {t('follow')}
            </button>
        </div>
    );
};

export default TraderCard;

