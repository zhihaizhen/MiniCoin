import React, { useState, useEffect } from 'react';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getReferralInfo } from '~/api';
import Banner from '~/components/couponCenter/banner';
import CouponTabs, { CouponTabType } from '~/components/couponCenter/couponTabs';
import CouponList from '~/components/couponCenter/couponList';
import PCReferralShareModal from '~/components/PC/referralShareModal';
import H5ReferralShareModal from '~/components/H5/referralShareModal';
import { isPC } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const CouponCenterContainer = () => {
  useGlobalWidget();
  const { isLogin } = useUserInfo();
  const [activeTab, setActiveTab] = useState<CouponTabType>(CouponTabType.PENDING);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralInfo, setReferralInfo] = useState(null);

  useEffect(() => {
    if (isLogin === true) {
      getReferralInfo().then(setReferralInfo).catch(() => {});
    }
  }, [isLogin]);

  return (
    <div className={styles.container}>
      <Banner isLogin={isLogin} couponCount={counts[CouponTabType.PENDING] ?? 0} openShareModal={() => setShowShareModal(true)} />
      <div className={styles.main}>
        <CouponTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
        <CouponList
          activeTab={activeTab}
          isLogin={isLogin}
          onCountsChange={setCounts}
          onViewUsed={() => setActiveTab(CouponTabType.USED)}
        />
      </div>
      {isPC()
        ? <PCReferralShareModal referralInfo={referralInfo} modalOpen={showShareModal} onClose={() => setShowShareModal(false)} />
        : <H5ReferralShareModal referralInfo={referralInfo} modalOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      }
    </div>
  );
};

export default CouponCenterContainer;
