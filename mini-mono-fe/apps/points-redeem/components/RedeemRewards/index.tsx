import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as RightArrow } from '~/public/images/right-arrow.svg';
import {
  getPrivateAwardList,
  getPublicAwardList,
  postExchangeRewards
} from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { AwardItem, CampaignDetail } from '~/interface';
import CustomSkeleton from '~/components/CustomSkeleton';
import RewardCard from '~/components/RewardCard';
import RedeemDialog from '~/components/RedeemDialog';
import RedeemConfirmDialog from '~/components/RedeemConfirmDialog';
import { goPage } from '@better-bit-fe/base-utils';
import { message } from 'antd';
import RecordsDialog from '~/components/RecordsDialog';
import EmptyState from '~/components/EmptyState';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';
import { CampaignStatus } from '~/enums';

interface RedeemRewardsProps {
  campaignDetail: CampaignDetail;
  callback: () => void;
}

const RedeemRewards: React.FC<RedeemRewardsProps> = ({
                                                       campaignDetail,
                                                       callback
                                                     }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [loading, setLoading] = useState(true);
  const [awardList, setAwardList] = useState<AwardItem[]>([]);
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowConfirmDialog, setIsShowConfirmDialog] = useState(false);
  const [isShowRecordsDialog, setIsShowRecordsDialog] = useState(false);
  const [redeemAward, setRedeemAward] = useState<AwardItem>();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const prevIsLogin = useRef<boolean | undefined>(undefined);

  const campaignNo = campaignDetail?.campaign_no;

  const fetchAwards = useCallback(async (shouldShowLoading = true) => {
    if (!campaignNo || isLogin === undefined) return;
    if (shouldShowLoading) setLoading(true);
    try {
      const fetchApi = isLogin === true ? getPrivateAwardList : getPublicAwardList;
      const res = await fetchApi({ campaign_no: campaignNo });
      setAwardList(res || []);
    } catch (e) {
      console.error('fetchAwards error:', e);
    } finally {
      setLoading(false);
    }
  }, [campaignNo, isLogin]);

  useEffect(() => {
    // 只有在没有数据时才显示 loading 骨架屏，避免二次加载时的闪烁
    const shouldShowLoading = awardList.length === 0;

    // 避免重复请求：如果从 undefined 变到 false，说明之前已经请求过公共接口了
    if (prevIsLogin.current === undefined && isLogin === false && awardList.length > 0) {
      prevIsLogin.current = isLogin;
      return;
    }

    void fetchAwards(shouldShowLoading);
    prevIsLogin.current = isLogin;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAwards, isLogin]);

  const handleRedeem = (award: AwardItem) => {
    const isOngoing = campaignDetail?.campaign_status === CampaignStatus.Ongoing;
    if (award?.is_close || isRedeeming || !isOngoing) return;
    if (!isLogin) return goPage('login');

    setRedeemAward(award);
    setIsShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!redeemAward || isRedeeming) return;

    setIsRedeeming(true);
    try {
      await postExchangeRewards({
        prize_id: redeemAward.id,
        campaign_no: campaignNo
      });
      setIsShowConfirmDialog(false);
      setIsShowDialog(true);
      void fetchAwards(false);
      callback();
    } catch (e: any) {
      void message.error(t(e?.code || 'unknown-error'));
    } finally {
      setIsRedeeming(false);
    }
  };


  const renderContent = () => {
    if (loading) return <CustomSkeleton type="rewards" />;
    if (!awardList.length) return <EmptyState />;

    return (
      <div className="grid gap-x-3 grid-cols-2 gap-y-[90px] pt-[60px] md:grid-cols-4 md:gap-y-[120px] mt-8 md:mt-14">
        {awardList.map((reward, index) => (
          <div key={reward.id} className={index >= 8 && !isExpanded ? 'hidden' : ''}>
            <RewardCard
              award={reward}
              onRedeem={handleRedeem}
              status={campaignDetail?.campaign_status}
              priority={index < 8}
              highlightText={index === awardList.length - 1}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-16 md:mt-[200px] px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <h1 className="text-text-primary font-semibold text-2xl md:text-[40px]">
          {t('redeem-rewards')}
        </h1>
        {isLogin && (
          <div
            className="flex h-8 md:h-12 min-w-32 md:min-w-[180px] px-3 bg-fill-button-tertiary-default rounded-lg md:rounded-xl items-center justify-center hover:bg-fill-button-tertiary-hover gap-2 cursor-pointer"
            onClick={() => setIsShowRecordsDialog(true)}
          >

            <span className="text-text-primary text-xs md:text-sm">
              {t('view-rewards')}
            </span>
            <div className="text-text-primary text-xs md:text-sm">
              <RightArrow />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-text-primary text-sm md:text-lg font-medium mt-6 md:mt-4">
        <span>{t('my-score')}</span>
        <span className="text-text-brand-default-web">
          {isLogin ? campaignDetail?.user_sum_points : '--'}
        </span>
      </div>

      {renderContent()}

      {awardList.length > 8 && (
        <div
          className="flex justify-center items-center text-text-primary text-base mt-[70px] cursor-pointer gap-1 hover:text-text-brand-default-web"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              {t('less')} <LessIcon className="text-xl" />
            </>
          ) : (
            <>
              {t('more')} <MoreIcon className="text-xl" />
            </>
          )}
        </div>
      )}

      <RedeemDialog
        award={redeemAward}
        open={isShowDialog}
        close={() => setIsShowDialog(false)}
      />
      <RedeemConfirmDialog
        award={redeemAward}
        open={isShowConfirmDialog}
        close={() => setIsShowConfirmDialog(false)}
        onConfirm={handleConfirmRedeem}
        loading={isRedeeming}
      />
      <RecordsDialog
        campaign_no={campaignNo}
        open={isShowRecordsDialog}
        close={() => setIsShowRecordsDialog(false)}
      />
    </div>
  );
};

export default RedeemRewards;
