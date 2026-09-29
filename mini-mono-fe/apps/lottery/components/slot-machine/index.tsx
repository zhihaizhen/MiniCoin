import React, { useState, useCallback } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { getPublicCampaignDetails } from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';
import RecordsView from '~/components/common/RecordsView';
import dynamic from 'next/dynamic';
import { useCampaignInfo } from '~/hooks/useCampaignInfo';
import { useRegistration } from '~/hooks/useRegistration';
import { Rules } from '@better-bit-fe/base-ui';

const LuckyMachine = dynamic(() => import('~/components/common/LuckyDraw'), {
  loading: () => <div className="w-full h-full" />,
  ssr: false,
});

const RecordMarquee = dynamic(() => import('~/components/common/RecordMarquee'), {
  loading: () => <div className="w-full h-full" />,
  ssr: false,
});

const Share = dynamic(() => import('~/components/common/Share'), {
  loading: () => <div className="w-full h-full" />,
  ssr: false,
});

const MainWrapper = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  // 用户剩余抽奖次数
  const [positionCount, setPositionCount] = useState(0);
  // 通知表格刷新
  const [luckNoticeNum, setLuckNoticeNum] = useState(0);

  const [mainTitle, setMainTitle] = useState<string>('');

  const { activeTime, shareTime, actState, campaignNo, loading, setLoading } = useCampaignInfo(isLogin, getPublicCampaignDetails);
  const { registerState, onRegister } = useRegistration(isLogin, campaignNo);

  // 更新抽奖次数
  const updateLuckyNum = useCallback((num: number) => {
    setPositionCount(num);
    setLoading(false);
  }, [setLoading]);

  // 抽奖结束回调
  const onLuckyEnd = useCallback(() => {
    setLuckNoticeNum((prev) => prev + 1);
  }, []);


  return (
    <>
      <div className="relative w-full h-[486px] md:h-[1000px] overflow-hidden">
        <div className="relative h-full w-full px-4 w-[1440px] mx-auto flex flex-col items-center justify-start z-10 mt-10 md:mt-[64px]">
          <h1 className="text-white text-center text-[28px] md:text-5xl font-semibold">
            {mainTitle}
          </h1>
          <div className="w-auto h-8 md:h-auto md:min-w-[442px] md:min-h-11 text-white text-center md:text-right border border-line-border-default rounded-2xl text-xs md:text-lg px-4 py-[7px] mt-[18px] md:mt-[32px] text-nowrap">
            {activeTime}
          </div>
          <LuckyMachine
            registerState={registerState}
            register={onRegister}
            actState={actState}
            luckyEnd={onLuckyEnd}
            luckyCount={positionCount}
            loading={loading}
            campaignNo={campaignNo}
            isBlock={true}
          />
        </div>

        <RecordMarquee campaignNo={campaignNo} />

      </div>

      <RecordsView
        campaignNo={campaignNo}
        luckNoticeNum={luckNoticeNum}
        updateLuckyNum={updateLuckyNum}
        isBlock={false}
      />

      <Share title={mainTitle} activeTime={shareTime} />

      <Rules
        className="w-full md:w-[960px] mx-auto mb-14 md:mb-[120px] mt-[56px] md:mt-[100px] px-4 md:px-0"
        type={"collapseBorder"}
        headTitle={t('activtiy-rule')}
        campaignCode='slot-machine'
        onLoad={(res) => {
          setMainTitle(res.mainTitle);
        }}
      />
    </>
  );
};

export default MainWrapper;
