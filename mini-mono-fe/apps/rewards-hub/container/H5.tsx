
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { getReferralInfo, getCouponStatusCount } from '~/api';
import Banner from '~/components/H5/banner';
import EventContainer from '~/components/H5/eventContainer';
import BottomBanner from '~/components/H5/bottomBanner';
import NewUserBenefits from '~/components/H5/newUserBenefits';
import Tasks from '~/components/H5/tasks';
import Activities from '~/components/H5/activities';
import MyBenifits from '~/components/H5/myBenefits';
import Faq from '~/components/H5/faq';
import CashIntro from '~/components/H5/cashIntro';
import ReferralShareModal from '~/components/H5/referralShareModal';
import styles from './h5.module.less';
import { isApp } from '@better-bit-fe/base-utils';

const H5 = () => {
  useGlobalWidget({
    isHideHeader: isApp(),
  });

  const { locale } = useRouter();
  const [taskReload, setTaskReload] = useState(false);
  const { isLogin, userInfo } = useUserInfo();
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralInfo, setReferralInfo] = useState(null);
  const [couponCount, setCouponCount] = useState(0);

  const handleLogin = () => {
    const isAppPlatform = isApp();

    if (isAppPlatform) {
      handleGoAppPage('loginpage', 'rewardsHub')
    } else {
      window.location.href = `/${locale}/account/login`
    }
  }

  const taskReloadCb = () => {
    setTaskReload(true)
  }

  const resetTaskReload = () => {
    setTaskReload(false)
  }

  const openShareModal = () => {

    const isAppPlatform = isApp();
    if (isAppPlatform) {
      handleGoAppPage('referral', 'rewardsHub')
    }
    else {
      setShowShareModal(true)
    }
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
        {/* <NewUserBenefits isLogin={isLogin} registerTime={userInfo?.registered_at} />
        {isLogin && <Tasks needReload={taskReload} resetTaskReload={resetTaskReload} />} */}
        {/* <Activities isLogin={isLogin} taskReloadCb={taskReloadCb} /> */}
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

export default H5;

