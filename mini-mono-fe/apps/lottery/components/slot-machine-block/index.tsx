import { basePath } from '@better-bit-fe/base-utils';
import React, { useCallback, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import dynamic from 'next/dynamic';
import ExportedImage from 'next-image-export-optimizer';
import RecordsView from '~/components/common/RecordsView';
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
  const [positionCount, setPositionCount] = useState(0);
  const [luckNoticeNum, setLuckNoticeNum] = useState(0);
  const [mainTitle, setMainTitle] = useState<string | undefined>('');

  const { activeTime, shareTime, actState, campaignNo, loading, setLoading } = useCampaignInfo(isLogin);
  const { registerState, onRegister } = useRegistration(isLogin, campaignNo);

  const updateLuckyNum = useCallback((num: number) => {
    setPositionCount(num);
    setLoading(false);
  }, [setLoading]);

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
            bigMarquee={true}
          />
        </div>

        <RecordMarquee campaignNo={campaignNo} />

        {/* 背景装饰层 */}
        <div className="absolute top-0 left-0 z-[-2] w-full flex justify-center items-center">
          <div className="w-full md:w-[1440px] h-[486px] md:h-[1000px]">
            <ExportedImage
              src={`${basePath}/images/stars.png`}
              alt="header"
              fill
            />
          </div>
        </div>
      </div>

      <RecordsView
        campaignNo={campaignNo}
        luckNoticeNum={luckNoticeNum}
        updateLuckyNum={updateLuckyNum}
        isBlock={true}
      />
      <Share title={mainTitle} isBlock={true} activeTime={shareTime} />

      <div className="w-full md:w-[960px] mx-auto mb-14 md:mb-[120px] mt-[56px] md:mt-[100px] px-4 md:px-0">
        <div className="text-text-primary text-[32px] font-semibold mb-6 md:mb-8">{t('activtiy-rule')}</div>
        <Rules
          type={"collapseBorder"}
          campaignCode='slot-machine-block'
          onLoad={(res) => {
            setMainTitle(res.mainTitle);
          }}
        />
      </div>
    </>
  );
};

export default MainWrapper;
