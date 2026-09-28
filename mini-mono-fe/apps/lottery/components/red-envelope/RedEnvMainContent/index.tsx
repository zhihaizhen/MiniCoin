import { basePath, goPage, isMobile } from '@better-bit-fe/base-utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import {
  getBonusDraw,
  getBonusPrivateCampaignDetails,
  getBonusPublicCampaignDetails
} from '~/api';
import dayjs from 'dayjs';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { RED_ACTIVE_STATUS, REWARD_STATUS } from '~/enums';
import { ICompaignProp, LotteryRecord } from '~/interface';
import dynamic from 'next/dynamic';
import RedEnvRecordsView from '~/components/red-envelope/RedEnvRecordsView';
import { message, Modal } from 'antd';
import Reword from '~/components/red-envelope/RedEnvMainContent/Reword';
import FooterCountDown from '~/components/common/FooterCountDown';
import ExportedImage from 'next-image-export-optimizer';
import { Rules } from '@better-bit-fe/base-ui';

const RecordMarquee = dynamic(() => import('~/components/common/RecordMarquee'), {
  loading: () => <div className="w-full h-full" />,
  ssr: false
});

const RedHeader: React.FC = () => {
  const t = useFm();
  const userInfo = useUserInfo();

  const [activeTime, setActiveTime] = useState<string>('');
  // 活动编号
  const [campaignNo, setCampaignNo] = useState<string>('');
  // 活动状态，未开始，进行中，已结束
  const [actState, setActState] = useState<RED_ACTIVE_STATUS | ''>('');
  // 红包领取状态
  const [rewardState, setRewardState] = useState<REWARD_STATUS | undefined>();
  // 下一次红包雨开始时间
  const [nextActTime, setNextActTime] = useState<number>(-1);
  // 奖励信息
  const [reward, setReward] = useState<LotteryRecord | null>(null);
  const [btnText, setBtnText] = useState<string>(t('get-now'));
  // 加载状态
  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [mainTitle, setMainTitle] = useState<string>('');

  const isMb = isMobile();
  const recordViewRef = useRef<{ update: () => void } | null>(null);

  const initActivity = useCallback(async () => {
    if (userInfo.isLogin === undefined) return;
    setLoading(true);
    let campNo = '';
    if (!campNo) {
      try {
        const publicRes: ICompaignProp = await getBonusPublicCampaignDetails();
        const {
          campaign_no,
          next_reward_time,
          campaign_time_status,
          campaign_begin_time: campaignBeginTime,
          campaign_end_time: campaignEndTime
        } = publicRes;

        campNo = campaign_no;
        setCampaignNo(campaign_no || '');
        setActState(campaign_time_status as RED_ACTIVE_STATUS);
        setNextActTime(+next_reward_time);

        if (campaignBeginTime && campaignEndTime) {
          const beginTime = dayjs
            .unix(+campaignBeginTime)
            .utc()
            .format('YYYY-MM-DD HH:mm:ss');
          const endTime = dayjs
            .unix(+campaignEndTime)
            .utc()
            .format('YYYY-MM-DD HH:mm:ss');
          setActiveTime(`${beginTime}  ~  ${endTime}`);
        }
      } catch (error) {
        console.error('Failed to fetch public campaign details', error);
        setLoading(false);
        return;
      }
    }

    // 未登录或没有活动号，停止后续私有接口请求
    if (!userInfo.isLogin || !campNo) {
      setLoading(false);
      return;
    }

    // 登录状态下获取用户个人活动信息
    try {
      const privateRes: ICompaignProp = await getBonusPrivateCampaignDetails({
        campaign_no: campNo
      });
      const {
        campaign_time_status = RED_ACTIVE_STATUS.NOT_START,
        reward_status,
        next_reward_time = ''
      } = privateRes;

      setActState(campaign_time_status as RED_ACTIVE_STATUS);
      setNextActTime(+next_reward_time);
      setRewardState(reward_status as REWARD_STATUS);
    } catch (error) {
      console.error('Failed to fetch private campaign details', error);
    } finally {
      setLoading(false);
    }
  }, [userInfo.isLogin]);

  // 初始化活动基本信息状态
  useEffect(() => {
    void initActivity();
  }, [initActivity]);

  const onGetClick = () => {
    if (userInfo.isLogin === undefined) return;
    if (!userInfo.isLogin) {
      goPage('login');
      return;
    }

    if (
      !campaignNo ||
      loading ||
      actState !== RED_ACTIVE_STATUS.RUNING ||
      rewardState !== REWARD_STATUS.NOT_GET
    ) {
      return;
    }

    setLoading(true);
    getBonusDraw({ campaign_no: campaignNo, version: 'coupon' })
      .then((res) => {
        setReward(res);
        setIsOpenModal(true);
        void initActivity();
        recordViewRef.current?.update();
      })
      .catch((err) => {
        if (err?.code === 35610203) {
          message.warning(t('lottery-no-way', '不满足领奖要求'));
          return
        }
        message.error(err?.message || 'lottery draw error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (actState === RED_ACTIVE_STATUS.NOT_START) {
      setBtnText(t('register-no-time'));
      return;
    }

    if (actState === RED_ACTIVE_STATUS.END) {
      setBtnText(t('lottery-end'));
      return;
    }

    if (rewardState === REWARD_STATUS.NOT_GET) {
      setBtnText(t('get-now'));
      return;
    }

    if (rewardState === REWARD_STATUS.GETED) {
      setBtnText(t('reward-geted'));
      return;
    }

    if (rewardState === REWARD_STATUS.UNTIME) {
      setBtnText(t('reward-untime'));
    }
  }, [rewardState, actState, t]);


  return (
    <div className="w-full flex flex-col justify-start items-center">
      <div className="relative w-full h-auto md:h-[800px] overflow-hidden">
        <div className="relative h-full w-full max-w-[1440px] mx-auto flex flex-col items-center justify-start z-10 mt-[47px] md:mt-[75px]">
          <h1 className="text-white text-center lang-en-US:text-[26px] md:lang-en-US:text-5xl text-[30px] md:text-5xl font-semibold px-2">
            {mainTitle}
          </h1>
          <div className="text-white text-center text-xs md:text-base mt-[18px] md:mt-6 text-nowrap">
            {activeTime ? `${activeTime} (UTC+0)` : ''}
          </div>
          <ExportedImage
            className="hidden md:block w-[683px] h-[423px] md:mt-[50px]"
            src={`${basePath}/images/lucky-wallet.png`}
            alt="Lottery"
            width={683}
            height={423}
            priority
          />
          <ExportedImage
            className="md:hidden w-[375px] h-[280px] mt-[30px]"
            src={`${basePath}/images/lucky-wallet-h5.png`}
            alt="Lottery"
            width={375}
            height={280}
            priority
          />
          <button
            className={`text-sm md:text-xl -mt-2.5 md:mt-0 min-w-[300px] md:min-w-[360px] py-3 text-center font-semibold select-none rounded-xl
              ${
              userInfo.isLogin === undefined || loading ||
              rewardState === REWARD_STATUS.GETED || rewardState === REWARD_STATUS.UNTIME ||
              actState !== RED_ACTIVE_STATUS.RUNING
                ? 'bg-bg-tertiary text-[#46484A] cursor-not-allowed'
                : 'text-[var(--text-static-black, #101112)] bg-[linear-gradient(90deg,#CEE127_0%,#ABE127_100%)] cursor-pointer hover:bg-[linear-gradient(90deg,#CEE127_0%,#CEE127_0%)]'
            }
            `}
            onClick={onGetClick}
          >
            {btnText}
          </button>
        </div>

        <RecordMarquee type="red-envelope" campaignNo={campaignNo} />

        {/* 背景装饰层 */}
        <div className="absolute top-0 left-0 z-[-2] w-full flex justify-center items-center">
          <div className="w-full md:w-[1440px] h-[510px] md:h-[800px]">
            <ExportedImage
              src={`${basePath}/images/headerBg-light${isMb ? '-h5' : ''}.png`}
              alt="header"
              fill
            />
          </div>
        </div>
      </div>

      <RedEnvRecordsView campaignNo={campaignNo} ref={recordViewRef} />
      <div className="px-4 md:px-0">
        <Rules
          className="w-full md:w-[960px] mx-auto mb-14 md:mb-[120px] mt-[56px] md:mt-[100px] px-4 py-8 p md:p-[56px] border border-[#28292A] rounded-2xl"
          headTitle={t('activtiy-rule')}
          campaignCode="red-envelope"
          onLoad={(res) => {
            setMainTitle(res.mainTitle);
          }}
        />
      </div>

      {userInfo.isLogin &&
        rewardState !== REWARD_STATUS.NOT_GET &&
        nextActTime > 0 && (
          <FooterCountDown
            targetTime={nextActTime}
            countDownCallback={initActivity}
          />
        )}

      <Modal
        wrapClassName="[&_.ant-modal-content]:p-6! [&_.ant-modal-content]:rounded-4! [&_.ant-modal-content]:bg-fill-modal!"
        open={isOpenModal}
        centered
        maskClosable={false}
        onCancel={() => setIsOpenModal(false)}
        closeIcon={null}
        width={480}
        footer={null}
      >
        <Reword reward={reward} close={() => setIsOpenModal(false)} />
      </Modal>
    </div>
  );
};

export default RedHeader;
