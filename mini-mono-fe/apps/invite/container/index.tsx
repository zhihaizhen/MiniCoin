import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { Rules } from '@better-bit-fe/base-ui';
import {
  getReferralInfo,
  getCampaignDetailPublic,
  getCampaignDetailPrivate,
  enrollActivity,
  receiveAward
} from '~/api';
import type { CampaignDetail, TaskItem } from '~/types/campaign';
import { TASK_EVENT } from '~/types/campaign';
import Banner from '~/components/banner';
import RewardCards from '~/components/rewardCards';
import MyRewards from '~/components/myRewards';
import ShareModal from '~/components/shareModal';
import ClaimSuccessModal from '~/components/claimSuccessModal';
import styles from './index.module.less';

const InviteContainer: React.FC = () => {
  const { isLogin } = useUserInfo();
  const t = useFm();
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetail | null>(null);
  const [campaignLoaded, setCampaignLoaded] = useState(false);
  const [referralLoaded, setReferralLoaded] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimedAward, setClaimedAward] = useState<{
    amount: string;
    token: string;
    name: string;
    productType: string;
  } | null>(null);

  const taskOnce = useMemo(
    () => campaignDetail?.task_items?.find(
      (item) => item.task_event === TASK_EVENT.ONCE_BE_INVITED
    ) ?? null,
    [campaignDetail]
  );

  const taskCounter = useMemo(
    () => campaignDetail?.task_items?.find(
      (item) => item.task_event === TASK_EVENT.COUNTER_INVITE_TRADE
    ) ?? null,
    [campaignDetail]
  );

  const rewardAmount = campaignDetail?.campaign_reward || '0';
  const invitationRewardAmount = campaignDetail?.invitation_reward || '0';
  const rewardToken = campaignDetail?.reward_token || 'USDT';

  const fetchCampaignDetail = useCallback(async () => {
    try {
      const fetcher = isLogin ? getCampaignDetailPrivate : getCampaignDetailPublic;
      const res = await fetcher();
      setCampaignDetail(res);
      if (isLogin) {
        setIsEnrolled(res?.is_register === '1');
      }
    } catch (err) {
      console.error('fetchCampaignDetail error', err);
    } finally {
      setCampaignLoaded(true);
    }
  }, [isLogin]);

  const fetchReferralInfo = useCallback(async () => {
    try {
      const res = await getReferralInfo();
      setReferralInfo(res);
    } catch (err) {
      console.error('fetchReferralInfo error', err);
    } finally {
      setReferralLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCampaignDetail();
  }, [fetchCampaignDetail]);

  useEffect(() => {
    if (isLogin === true) {
      fetchReferralInfo();
    } else if (isLogin === false) {
      setReferralLoaded(true);
    }
  }, [isLogin, fetchReferralInfo]);

  const dataReady = campaignLoaded && referralLoaded;

  const handleEnroll = useCallback(async () => {
    if (!campaignDetail?.campaign_no) return;
    await enrollActivity(campaignDetail.campaign_no);
    fetchCampaignDetail();
  }, [campaignDetail, fetchCampaignDetail]);

  const handleClaimReward = useCallback(async () => {
    if (!campaignDetail?.campaign_no) return;
    setClaiming(true);
    try {
      await receiveAward({
        campaign_no: campaignDetail.campaign_no,
        task_event: TASK_EVENT.COUNTER_INVITE_TRADE
      });
      const rewardItem = taskCounter?.reward_items?.[0];
      const {award_volume, award_token, coupon_type, reward_product_type} = rewardItem || {};
      setClaimedAward({
        amount: award_volume || '0',
        token: award_token || rewardToken,
        name: coupon_type || '',
        productType: reward_product_type || ''
      });
      setShowClaimModal(true);
    } catch (err) {
      console.error('receiveAward error', err);
    } finally {
      setClaiming(false);
    }
  }, [campaignDetail, taskCounter, rewardAmount, rewardToken]);

  return (
    <div className={styles.container}>
      <Banner
        isLogin={isLogin}
        isEnrolled={isEnrolled}
        campaignStatus={dataReady ? campaignDetail?.campaign_status : undefined}
        beginTime={campaignDetail?.campaign_begin_time}
        endTime={campaignDetail?.campaign_end_time}
        totalRewardAmount={rewardAmount}
        rewardToken={rewardToken}
        onEnroll={handleEnroll}
        onShare={() => setShowShareModal(true)}
      />
      <RewardCards
        taskOnce={taskOnce}
        taskCounter={taskCounter}
      />
      <MyRewards
        taskCounter={taskCounter}
        isLogin={isLogin}
        claiming={claiming}
        onInvite={() => setShowShareModal(true)}
        onClaimReward={handleClaimReward}
      />
      <div className={styles.rulesSection}>
        <Rules
          className={styles.rules}
          headTitle={t('activity-rules') || '活动规则'}
          campaignCode="invite"
        />
      </div>
      <ShareModal
        referralInfo={referralInfo}
        invitationRewardAmount={invitationRewardAmount}
        rewardToken={rewardToken}
        modalOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
      <ClaimSuccessModal
        visible={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          fetchCampaignDetail();
        }}
        claimedAward={claimedAward}
      />
    </div>
  );
};

export default InviteContainer;
