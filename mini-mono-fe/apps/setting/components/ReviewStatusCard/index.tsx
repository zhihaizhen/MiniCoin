import React, { useMemo } from 'react';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import type { KycStatus } from '~/types';


interface Country {
    code?: string;
    name?: string;
    area_code?: string;
    name_en?: string;
    name_zh_cn?: string;
    label?: string;
    value?: string;
}

interface ReviewStatusCardProps {
    kyc_status?: KycStatus;
    country: string;
    first_name: string;
    last_name: string;
    identity_number: string;
    className?: string;
    countries: Country[];
}

const ReviewStatusCard: React.FC<ReviewStatusCardProps> = ({
    kyc_status,
    country,
    first_name = '',
    last_name = '',
    identity_number = '',
    className = '',
    countries = []
}) => {
    const t = useFm();

    const statusConfig = {
        passed: {
            icon: basePath + '/images/kyc/passed.png',
            title: t('setting.authPass'),
        },
        pending: {
            icon: basePath + '/images/kyc/pending.png',
            title: t('setting.auditing'),
        },

    };

    const lang = getLang() || 'en-US';
    // 处理名字显示，只保留第一个字符，其余用星号代替
    const maskName = (str: string): string => {
        if (!str) return '';
        return str.charAt(0) + '*'.repeat(str.length - 1);
    };

    // 处理证件号码显示，保留前后各4位，中间用星号代替
    const maskIdNumber = (id: string): string => {
        if (!id) return '';
        if (id.length <= 4) {
            // 对于短证件号码，保留前后各1位，中间用星号替换
            if (id.length <= 2) return id; // 长度小于等于2时直接返回原值
            const prefix = id.charAt(0);
            const suffix = id.charAt(id.length - 1);
            const middleLength = id.length - 2;
            return `${prefix}${'*'.repeat(middleLength)}${suffix}`;
        }

        const prefix = id.substring(0, 2);
        const suffix = id.substring(id.length - 2);
        const middleLength = id.length - 4;

        return `${prefix}${'*'.repeat(middleLength)}${suffix}`;
    };

    const config = statusConfig[kyc_status];

    const name = lang == 'en-US' ? maskName(first_name + last_name) : maskName(last_name + first_name);
    const maskedIdNumber = maskIdNumber(identity_number);

    const countryName = useMemo(() => {
        return countries.find(item => item.value == country)?.label;
    }, [countries, country]);

    return (
        <div className={`${styles.cardContainer} ${className}`}>
            <div className={styles.reviewStatusContainer}>
                <img src={config?.icon} className={styles.iconWrapper} />
                <div className={styles.statusTitle}>{config?.title}</div>
            </div>
            <div className={styles.infoList}>
                <div className={styles.infoItem}>
                    <span className={styles.label}>{t('setting.country')}：</span>
                    <span className={styles.value}>{countryName}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.label}>{t('setting.fullName')}：</span>
                    <span className={styles.value}>{name}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.label}>{t('setting.docNum')}：</span>
                    <span className={styles.value}>{maskedIdNumber}</span>
                </div>
            </div>
        </div >
    );
};

export default ReviewStatusCard;