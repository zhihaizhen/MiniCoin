import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { Rules } from '@better-bit-fe/base-ui';
import { getConfigPublic, getConfigPrivate, getReferralInfo } from '~/api';
import type { ReferralConfig, ReferralInfo } from '~/types';
import Banner from '~/components/Banner';
import DataOverview from '~/components/DataOverview';
import InviteList from '~/components/InviteList';
import RebateRecords from '~/components/RebateRecords';
import InviteSteps from '~/components/InviteSteps';
import CtaBanner from '~/components/CtaBanner';
import ShareModal from '~/components/ShareModal';
import styles from './index.module.less';

const ReferralContainer: React.FC = () => {
  const { isLogin } = useUserInfo();
  console.log('isLogin', isLogin);
  const t = useFm();
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const fetcher = isLogin ? getConfigPrivate : getConfigPublic;
      const res = await fetcher();
      setConfig(res);
    } catch (err) {
      console.error('fetchConfig error', err);
    }
  }, [isLogin]);

  const fetchReferralInfo = useCallback(async () => {
    if (!isLogin) return;
    try {
      const res = await getReferralInfo();
      setReferralInfo(res);
    } catch (err) {
      console.error('fetchReferralInfo error', err);
    }
  }, [isLogin]);

  useEffect(() => {
    if (isLogin !== undefined) {
      fetchConfig();
    }
  }, [fetchConfig, isLogin]);

  useEffect(() => {
    if (isLogin === true) {
      fetchReferralInfo();
    }
  }, [isLogin, fetchReferralInfo]);

  const rebateRate = config?.inviter_rebate_rate || '30';

  return (
    <div className={styles.container}>
      <Banner
        isLogin={isLogin}
        rebateRate={rebateRate}
        isAffiliate={config?.is_affiliate}
        affiliateUrl={config?.affiliate_web_url}
        onShare={() => setShowShareModal(true)}
      />
      {isLogin && (
        <div className={styles.mainContent}>
          <DataOverview />
          <InviteList />
          <RebateRecords />
        </div>
      )}
      <div className={`${styles.sectionWrap}${isLogin === false ? ` ${styles.sectionWrapLoggedOut}` : ''}`}>
        <InviteSteps />
      </div>
      <CtaBanner isLogin={isLogin} />
      <ShareModal
        modalOpen={showShareModal}
        referralInfo={referralInfo}
        invitationRewardAmount={rebateRate}
        rewardToken="%"
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default ReferralContainer;
