import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

export enum EventType {
    NEW_COMER_TASKS = 1,
    DAILY_TASKS = 2,
}

const EVENT_LIST = [
    {
        titleKey: 'new-comer-tasks',
        type: EventType.NEW_COMER_TASKS,
    },
    {
        titleKey: 'daily-tasks',
        type: EventType.DAILY_TASKS,
    }
]

const EventTab = ({ activeTab, setActiveTab }) => {
    const t = useFm();

    return (
        <div className={styles.eventTab}>
            {EVENT_LIST.map(item => (
                <div
                    key={item.type}
                    className={`${styles.tabItem} ${activeTab === item.type ? styles.active : ''}`}
                    onClick={() => setActiveTab(item.type)}
                >
                    {t(item.titleKey)}
                </div>
            ))}
        </div>
    );
};

export default EventTab;