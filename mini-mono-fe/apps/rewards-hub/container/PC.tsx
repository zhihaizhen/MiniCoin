
import React, { useState, useEffect } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getReferralInfo, getCouponStatusCount } from '~/api';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import Banner from '~/components/PC/banner';
import EventContainer from '~/components/PC/eventContainer';
import BottomBanner from '~/components/PC/bottomBanner';
import NewUserBenefits from '~/components/PC/newUserBenefits';
import Tasks from '~/components/PC/tasks';
import Activities from '~/components/PC/activities';
import MyBenifits from '~/components/PC/myBenefits';
import Faq from '~/components/PC/faq';
import CashIntro from '~/components/PC/cashIntro';
import ReferralShareModal from '~/components/PC/referralShareModal';
import styles from './pc.module.less';

const PC = () => {
  useGlobalWidget();
  const [taskReload, setTaskReload] = useState(false);
  const { isLogin, userInfo } = useUserInfo();
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralInfo, setReferralInfo] = useState(null);
  const [couponCount, setCouponCount] = useState(0);

  const taskReloadCb = () => {
    setTaskReload(true)
  }

  const resetTaskReload = () => {
    setTaskReload(false)
  }

  const openShareModal = () => {
    setShowShareModal(true)
  }

  const closeShareModal = () => {
    setShowShareModal(false)
  }

  const fetchReferralInfo = async () => {
    try {
      const res = await getReferralInfo();
      setReferralInfo(res);
    } catch { /* ignore */ }
  }

  const refreshCouponCount = () => {
    getCouponStatusCount().then((res) => {
      setCouponCount(res?.init_count ?? 0);
    }).catch(() => {});
  }

  useEffect(() => {
    if (isLogin === true) {
      fetchReferralInfo();
      refreshCouponCount();
    }
  }, [isLogin])


  return (
    <div >
      <Banner isLogin={isLogin} couponCount={couponCount} openShareModal={openShareModal} />
      <div className={styles.page}>
        {/* {isLogin && <MyBenifits />} */}
        <EventContainer
          isLogin={isLogin}
          registerTime={userInfo?.registered_at}
          needReload={taskReload}
          resetTaskReload={resetTaskReload}
          openShareModal={openShareModal}
          refreshCouponCount={refreshCouponCount}
        />
        <Faq />
        {/* <CashIntro /> */}
      </div>
      {!isLogin && <BottomBanner isLogin={isLogin} />}
      <ReferralShareModal referralInfo={referralInfo} modalOpen={showShareModal} onClose={closeShareModal} />
    </div>
  );
}

export default PC;


