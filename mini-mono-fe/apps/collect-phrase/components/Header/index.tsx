import React from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import WebmAnimation from '~/components/WebmAnimation';
import { ReactComponent as StarIcon } from '~/public/images/star.svg';
import { ReactComponent as SubTitleIcon } from '~/public/images/subTitle.svg';
import { CampaignDetail } from '~/interface';
import { CampaignStatus } from '~/enums';
import ExportedImage from 'next-image-export-optimizer';
import CountDownClock from '~/components/CountDownClock';
import CollectGather from '~/components/CollectGather';
import useCampaignTimeData from '~/hooks/useCampaignTimeData';

interface HeaderProps {
  userCollects: any;
  campaignDetail: CampaignDetail;
  callback?: () => void;
}

const BannerImage: React.FC = () => (
  <>
    <div className="page-header hidden md:block w-full h-[810px]">
      <div className="flex relative justify-center items-center overflow-hidden">
        <div className="hidden 2xl:block absolute w-[1920px] h-[810px] z-1 animotion-bg" />
        <WebmAnimation
          className="relative"
          videoClassName="w-[1920px]! h-[810px]! object-cover object-top"
          loopSrc={`${basePath}/images/bannerMax.mp4`}
        />
      </div>
      <div className={'absolute bottom-0 w-full h-[132px] z-10'}>
        <ExportedImage
          className="object-cover object-bottom"
          src={`${basePath}/images/borderBottomMask.svg`}
          alt="borderBottomMask"
          fill
          loading="lazy"
        />
      </div>
    </div>
    <div className="md:hidden w-full min-h-[780px] relative">
      <ExportedImage
        src={`${basePath}/images/banner-h5.png`}
        alt="banner-h5"
        fill
        priority
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg=="
        sizes="100vw"
      />
    </div>
  </>
);

const TitleSection: React.FC<{ dateRangeStr: string }> = ({ dateRangeStr }) => {
  const t = useFm();
  return (
    <>
      <div
        className="flex items-center gap-3.5 text-2xl md:text-[48px] font-semibold leading-8 md:leading-16 bg-[linear-gradient(186deg,#FAF9F9_-20.73%,#FDCB70_113.15%)] bg-clip-text text-transparent">
        <span>{t('header-title-1')}</span>
        <StarIcon />
        <span>{t('header-title-2')}</span>
      </div>
      <div className="flex items-center overflow-hidden w-screen md:w-auto">
        <SubTitleIcon className="h-12 md:h-[86px]" />
      </div>
      <div className="text-text-primary text-xs font-medium mt-2">{dateRangeStr}</div>
    </>
  );
};

const CountdownSection: React.FC<{
  status: CampaignStatus;
  timeTips: string;
  endTime: number;
  beginTime: number;
  callback?: () => void;
}> = ({ status, timeTips, endTime, beginTime, callback }) => (
  <>
    <span className="text-text-white text-xs md:text-base">{timeTips}</span>
    {status !== CampaignStatus.Ended && beginTime > 0 && endTime > 0 && (
      <div className="flex items-center gap-6 text-text-white text-base mt-3 md:mt-0 md:ml-[34px]">
        <CountDownClock endTime={endTime} beginTime={beginTime} callback={callback} />
      </div>
    )}
  </>
);

const Header: React.FC<HeaderProps> = ({ campaignDetail, userCollects, callback }) => {
  const t = useFm();
  const status = campaignDetail?.campaign_status || CampaignStatus.NotStarted;
  const { timeTips, dateRangeStr, countdownEndTime, countdownBeginTime } = useCampaignTimeData(campaignDetail, t);

  return (
    <div className="w-full bg-[#CF2C1A]">
      <div className="w-full flex justify-center mx-auto relative">
        <BannerImage />
        <div className="absolute max-w-[1200px] mx-auto flex flex-col items-center md:gap-4 pt-9 md:pt-12">
          <TitleSection dateRangeStr={dateRangeStr} />
          <div className="md:hidden w-full flex flex-col justify-center items-center mt-80">
            <CollectGather
              campaignDetail={campaignDetail}
              userCollects={userCollects}
              callback={callback}
            />
            {status !== CampaignStatus.Ended && (
              <CountdownSection
                status={status}
                timeTips={timeTips}
                endTime={countdownEndTime}
                beginTime={countdownBeginTime}
                callback={callback}
              />
            )}
          </div>
        </div>
      </div>
      <div className="hidden md:block relative max-w-[1200px] mx-auto z-10">
        {status !== CampaignStatus.Ended && (
          <div className="relative w-full h-[110px] -mt-20">
            <div className="absolute w-full h-full flex items-center justify-center z-10 -top-2">
              <CountdownSection
                status={status}
                timeTips={timeTips}
                endTime={countdownEndTime}
                beginTime={countdownBeginTime}
                callback={callback}
              />
            </div>
            <ExportedImage
              src={`${basePath}/images/timeBg.png`}
              alt="timeBg"
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg=="
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
