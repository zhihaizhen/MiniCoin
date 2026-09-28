import React, { useCallback, useEffect, useState } from 'react';
import Header from '~/components/Header';
import Rules from '~/components/Rules';
import { getPrivateCampaignDetail, getPublicCampaignDetail, getUserCollection } from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { CampaignDetail } from '~/interface';
import RewardBox from '~/components/RewardBox';
import Task from '~/components/Tasks';


const MainContent: React.FC = () => {
  const { isLogin } = useUserInfo();
  const [loading, setLoading] = useState(true);
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetail>();

  const [userCollects, setUserCollects] = useState(null);

  const updateCampaignDetail = useCallback(
    (loading = false) => {
      if (isLogin === null || isLogin === undefined) return;
      setLoading(loading);
      if (isLogin) {
        getPrivateCampaignDetail()
          .then((res: CampaignDetail) => {
            setCampaignDetail(res);
          })
          .finally(() => {
            setLoading(false);
          });
        getUserCollection().then((res) => {
          setUserCollects(res);
        });
        return;
      }
      getPublicCampaignDetail()
        .then((res: CampaignDetail) => {
          setCampaignDetail(res);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [isLogin]
  );

  // 初始化活动基本信息状态
  useEffect(() => {
    updateCampaignDetail(true);
  }, [updateCampaignDetail]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header
        campaignDetail={campaignDetail}
        callback={updateCampaignDetail}
        userCollects={userCollects}
      />
      <div className={`relative w-full flex-1 md:flex md:justify-center bg-wave`}>
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-2">
          <RewardBox
            campaignDetail={campaignDetail}
            userCollections={userCollects}
            callback={updateCampaignDetail}
          />
          <Task
            campaignDetail={campaignDetail}
            callback={updateCampaignDetail}
          />
          <Rules />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
