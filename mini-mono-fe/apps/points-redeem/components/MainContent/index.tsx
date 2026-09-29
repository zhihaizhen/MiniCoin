import React, { useCallback, useEffect, useState, useRef } from 'react';
import Header from '~/components/Header';
import Tasks from '~/components/Tasks';
import RedeemRewards from '~/components/RedeemRewards';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { BannerData, CampaignDetail } from '~/interface';
import Broadcast from '~/components/Broadcast';
import PrizePreview from '~/components/PrizePreview';
import { getPrivateCampaignDetail, getPublicCampaignDetail } from '~/api';
import { Rules } from '@better-bit-fe/base-ui';
import { useFm } from '@better-bit-fe/base-hooks';

const MainContent: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [loading, setLoading] = useState(true);
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetail>();
  const prevIsLogin = useRef<boolean | undefined>(undefined);

  const [bannerData, setBannerData] = useState<BannerData>({
    mainTitle: '',
    subTitle: '',
    entryVideoUrl: '',
    loopVideoUrl: '',
    loopVideoUrlH5: '',
  });

  const fetchCampaignDetail = useCallback(async () => {
    const fetchFn = isLogin === true ? getPrivateCampaignDetail : getPublicCampaignDetail;
    try {
      const res = await fetchFn();
      setCampaignDetail(res);
    } catch (e) {
      console.error('fetchCampaignDetail error:', e);
    }
  }, [isLogin]);

  const updateCampaignDetail = useCallback(
    (shouldShowLoading = false) => {
      if (shouldShowLoading) setLoading(true);
      fetchCampaignDetail().finally(() => setLoading(false));
    },
    [fetchCampaignDetail]
  );

  useEffect(() => {
    // 只有在没有数据时才展示 skeleton loading，避免二次刷新的闪烁
    const shouldShowLoading = !campaignDetail;

    // 避免重复请求：如果从 undefined 变到 false，说明之前已经请求过公共接口了
    if (prevIsLogin.current === undefined && isLogin === false && campaignDetail) {
      prevIsLogin.current = isLogin;
      return;
    }

    updateCampaignDetail(shouldShowLoading);
    prevIsLogin.current = isLogin;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateCampaignDetail, isLogin]);


  return (
    <div className="max-w-[1200px] mx-auto">
      <Header
        bannerData={bannerData}
        campaignDetail={campaignDetail}
        loading={loading}
        callback={updateCampaignDetail}
      />
      <Broadcast />
      <PrizePreview />
      <Tasks
        bannerData={bannerData}
        campaignDetail={campaignDetail}
        loading={loading}
        callback={updateCampaignDetail}
      />
      <RedeemRewards
        campaignDetail={campaignDetail}
        callback={updateCampaignDetail}
      />

      <Rules
        className="w-full md:max-w-[1200px] mx-auto mb-14 px-4 md:px-0 mt-10 md:mt-[100px] md:mb-[100px]"
        type="simple"
        headTitle={t('rules')}
        campaignCode='points-redeem'
        onLoad={(res) => {
          setBannerData({
            mainTitle: res?.mainTitle,
            subTitle: res?.subTitle,
            entryVideoUrl: res?.web_entry_video_url || res?.web_loop_video_url,
            loopVideoUrl: res?.web_loop_video_url || res?.web_entry_video_url,
            loopVideoUrlH5: res?.h5_loop_video_url || res?.h5_entry_video_url || res?.web_loop_video_url || res?.web_entry_video_url,
            picUrl: res?.pic_web_url,
            picH5Url: res?.pic_h5_url || res?.pic_web_url,
          });
        }}
      />
    </div>
  );
};

export default MainContent;
