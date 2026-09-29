import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import NewUserBenefits from '~/components/PC/newUserBenefits';
import Tasks from '~/components/PC/tasks';
import EventTab, { EventType } from './eventTab';
import styles from './index.module.less';

const EventContainer = ({
    isLogin,
    registerTime,
    needReload,
    resetTaskReload,
    openShareModal,
    refreshCouponCount
}) => {
    const t = useFm();
    const { query } = useRouter();
    const { event } = query;
    const [activeTab, setActiveTab] = useState<EventType>(EventType.NEW_COMER_TASKS);

    useEffect(() => {
        if (event === `${EventType.DAILY_TASKS}`) {
            setActiveTab(EventType.DAILY_TASKS);
        } else if (event === `${EventType.NEW_COMER_TASKS}`) {
            setActiveTab(EventType.NEW_COMER_TASKS);
        }
    }, [event]);

    return (
        <div className={styles.eventContainer}>
            <EventTab activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === EventType.NEW_COMER_TASKS && <NewUserBenefits openShareModal={openShareModal} isLogin={isLogin} registerTime={registerTime} refreshCouponCount={refreshCouponCount} />}
            {activeTab === EventType.DAILY_TASKS && <Tasks openShareModal={openShareModal} isLogin={isLogin} needReload={needReload} resetTaskReload={resetTaskReload} refreshCouponCount={refreshCouponCount} />}
        </div>
    );
};

export default EventContainer;