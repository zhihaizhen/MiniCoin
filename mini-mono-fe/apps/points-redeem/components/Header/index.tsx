import React, { useMemo, useState, useCallback } from 'react';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import CustomSkeleton from '~/components/CustomSkeleton';
import { ReactComponent as ShareIcon } from '~/public/images/share.svg';
import CountDownClock from '~/components/CountDownClock';
import { BannerData, CampaignDetail } from '~/interface';
import dayjs from 'dayjs';
import { CampaignStatus, RegisterStatus } from '~/enums';
import { getUserRegister } from '~/api';
import { message } from 'antd';
import ReferralShareModal from '~/components/ReferralShareModal';
import classNames from 'classnames';
import { WebmAnimation } from '@better-bit-fe/base-ui';

interface HeaderProps {
  loading: boolean;
  bannerData: BannerData;
  campaignDetail: CampaignDetail;
  callback?: () => void;
}

const Header: React.FC<HeaderProps> = ({bannerData, loading, campaignDetail, callback }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isOpenShare, setIsOpenShare] = useState(false);

  const {
    campaign_status: status = CampaignStatus.NotStarted,
    is_register: regStatus = RegisterStatus.NotRegistered,
    campaign_begin_time: beginTime,
    campaign_end_time: endTime,
    campaign_no: campaignNo
  } = campaignDetail || {};

  const isEnded = status === CampaignStatus.Ended;
  const isRegistered = regStatus === RegisterStatus.Registered;
  const canRegister = !isEnded && !isRegistered;

  const activityTimeRange = useMemo(() => {
    const format = (t?: string) => dayjs.unix(+(t || 0)).utc().format('YYYY-MM-DD HH:mm:ss');
    return `${format(beginTime)} ~ ${format(endTime)}`;
  }, [beginTime, endTime]);

  const handleRegister = useCallback(async () => {
    if (!isLogin) return goPage('login');
    if (isRegistering || !canRegister) return;

    setIsRegistering(true);
    try {
      await getUserRegister({ campaign_no: campaignNo });
      void message.success(t('register-success'));
      callback?.();
    } catch (e: any) {
      void message.error(t(e?.code || 'unknown-error'));
    } finally {
      setIsRegistering(false);
    }
  }, [isLogin, isRegistering, canRegister, campaignNo, t, callback]);

  const buttonText = useMemo(() => {
    if (isRegistered) return t('registered');
    if (isEnded) return t('ended');
    return t('register-now');
  }, [isRegistered, isEnded, t]);

  const handleShare = () => {
    if (!isLogin) return goPage('login');
    setIsOpenShare(true);
  };



  const renderContent = () => (
    <div className="max-w-[580px] md:w-auto w-full md:mt-0">
      <h2 className="text-sm md:text-xl text-center md:text-left text-text-brand-default-web font-bold md:font-semibold">
        {bannerData.subTitle ? bannerData.subTitle : t('sub-title')}
      </h2>
      <h1
        className="text-[32px] md:text-5xl font-semibold text-text-white mt-5 md:leading-14 text-center md:text-left leading-10">
        <span>{bannerData.mainTitle ? bannerData.mainTitle : t('header-title')}</span>
      </h1>
      <div className="text-xs md:text-sm text-text-secondary leading-5 mt-3 md:mt-6 text-center md:text-left">
        {activityTimeRange}（UTC+0)
      </div>

      {!isEnded && (
        <>
          <div className="text-xs text-text-secondary leading-5 mt-8 md:mt-9 text-center md:text-left">
            {status === CampaignStatus.NotStarted ? t('time-start-tip') : t('time-end-tip')}
          </div>
          <CountDownClock beginTime={+beginTime} endTime={+endTime} callback={callback} />
        </>
      )}

      <div className="flex gap-4 mt-8">
        <button
          className={classNames(
            'w-full md:w-auto md:min-w-[220px] text-base font-medium px-4 py-3 rounded-xl transition-colors',
            {
              'text-text-primary bg-fill-button-tertiary-default': !canRegister,
              'text-text-white-to-black bg-fill-button-primary-default hover:bg-fill-button-primary-hover cursor-pointer':
                canRegister
            }
          )}
          onClick={handleRegister}
        >
          {buttonText}
        </button>
        <button
          className={classNames(
            'px-4 py-3 rounded-xl cursor-pointer transition-colors',
            {
              'text-text-white-to-black bg-fill-button-primary-default hover:bg-fill-button-primary-hover':
                isRegistered || isEnded,
              'text-text-primary bg-fill-button-tertiary-default hover:bg-fill-button-tertiary-hover':
                !isRegistered && !isEnded
            }
          )}
          onClick={handleShare}
        >
          <ShareIcon />
        </button>

     </div>
    </div>
  );

  return (
    <div className="w-full px-4 md:px-0 pt-0 md:pt-[50px] pb-6 md:pb-0">

      <div className="max-w-[1200px] mx-auto flex justify-between items-center md:flex-row flex-col-reverse gap-0 md:gap-10 overflow-hidden">
        {loading ? (
          <CustomSkeleton type="header" />
        ) : (
          <>
            {renderContent()}
            <div className="w-full md:w-[580px] md:h-[500px]">
              <>
                <div className="md:hidden w-full">
                  <video
                    className="w-full h-auto block"
                    src={`${basePath}/images/h5-loop.mp4`}
                    loop
                    muted
                    playsInline
                    autoPlay
                    controls={false}
                    // @ts-ignore
                    webkit-playsinline="true"
                  />
                </div>

                <WebmAnimation
                  className="hidden md:block w-full h-[500px]"
                  loopClassName={'object-cover'}
                  introClassName={'object-cover'}
                  loopSrc={`${basePath}/images/web-loop.mp4`}
                  introSrc={`${basePath}/images/web-enter.mp4`}
                />
              </>
            </div>
          </>
        )}
      </div>

      <ReferralShareModal
        title={bannerData.mainTitle || t('header-title')}
        subTitle={bannerData.subTitle || t('sub-title')}
        modalOpen={isOpenShare}
        onClose={() => setIsOpenShare(false)}
      />
    </div>
  );
};

export default Header;
