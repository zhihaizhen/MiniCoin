import React from 'react';
import ExportedImage from 'next-image-export-optimizer';
import { basePath, goPage, isMobile as isMobileDevice } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { CampaignDetail } from '~/interface';
import { TaskStatus } from '~/enums';
import { postClaimTaskCharReward } from '~/api';
import ReciveSetDialog from '~/components/ReciveSetDialog';
import ReferralShareModal from '~/components/ReferralShareDialog';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { message } from 'antd';

interface ActionButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  className?: string;
}

const ActionButton = ({
  onClick,
  text,
  disabled,
  className = ''
}: ActionButtonProps) => (
  <div
    className={`relative text-center font-bold text-text-white cursor-pointer flex items-start justify-center ${className}`}
    onClick={onClick}
  >
    <span className="z-10">{text}</span>
    <ExportedImage
      className="z-0"
      src={`${basePath}/images/${disabled ? 'buttonBg' : 'buttonBg'}.png`}
      alt="buttonBg"
      fill
      loading="lazy"
    />
  </div>
);

const Task = ({
  campaignDetail,
  callback
}: {
  campaignDetail: CampaignDetail | undefined;
  callback;
}) => {
  const { isLogin } = useUserInfo();
  const t = useFm();
  const [isOpenRewardDialog, setIsOpenRewardDialog] = React.useState(false);
  const [isOpenShareModal, setIsOpenShareModal] = React.useState(false);
  const isMobile = isMobileDevice();

  const tasks = Array.from({ length: 6 }, (_, i) => `task-${i + 3}`);

  const handleInvite = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    setIsOpenShareModal(true);
  };
  const handleGet = () => {
     if (!isLogin) {
       goPage('login');
       return;
     }
    if (campaignDetail.task_status === TaskStatus.Awarding) {
      postClaimTaskCharReward({ task_id: campaignDetail.task_id }).then(
        () => {
          setIsOpenRewardDialog(true);
          callback();
        }
      ).catch(err => {
         void message.error(t(err?.code || 'unknown-error'));
      });
    }
  };

  const handleClose = () => {
    setIsOpenRewardDialog(false);
    window.scrollTo({
      top: isMobile ? 0 : 1000,
      behavior: 'smooth'
    });
  }

  const renderTaskHeader = (title: string, desc: string, isMobile = false) => (
    <div>
      <h1
        className={`${
          isMobile ? 'text-sm' : 'text-xl'
        } font-bold text-text-black`}
      >
        {t(title)}
      </h1>
      <div
        className={`flex items-center ${
          isMobile ? 'text-xs' : 'text-lg'
        } text-[#43260D] mt-2 ml-1 before:content-[''] before:inline-block before:w-1 before:h-1 before:bg-[#43260D] before:rounded-full before:mr-3`}
      >
        {t(desc)}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex w-[1440px] h-[969px] relative justify-center items-center">
        <div className="absolute w-full flex flex-col justify-center items-center z-10 top-[210px]">
          <div className="relative w-[880px] h-[238px]">
            <div className="absolute flex flex-col justify-start items-start gap-6 z-10 top-10 left-[140px]">
              {[
                { id: '1', action: handleInvite, btnText: t('go-invite') },
                {
                  id: '2',
                  action: handleGet,
                  disabled: campaignDetail?.task_status !== TaskStatus.Awarding,
                  btnText: `${
                    campaignDetail?.task_status === TaskStatus.Done
                      ? t('doneGet')
                      : `${t('get')}${campaignDetail?.invite_num || 0}/3`
                  } `
                }
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center w-[700px]"
                >
                  {renderTaskHeader(`task-${item.id}`, `task-${item.id}-1`)}
                  <ActionButton
                    onClick={item.action}
                    text={item.btnText}
                    disabled={item.disabled}
                    className="w-[120px] h-[50px] text-base pt-1.5"
                  />
                </div>
              ))}
            </div>
            <ExportedImage
              src={`${basePath}/images/task-content-bg.png`}
              alt="task-content"
              fill
              loading="lazy"
            />
          </div>

          <div className="w-[880px] grid grid-cols-2 gap-6 mt-6">
            {tasks.map((taskKey) => (
              <div key={taskKey} className="relative w-full h-[115px] px-4">
                <ExportedImage
                  className="-z-1"
                  src={`${basePath}/images/task-item-bg.svg`}
                  alt="task-item"
                  fill
                  loading="lazy"
                />

                <div className="relative flex items-center w-full h-full gap-8">
                  <ExportedImage
                    src={`${basePath}/images/blindBox.png`}
                    alt="blindBox"
                    width={68}
                    height={68}
                    loading="lazy"
                  />
                  <div className="absolute left-[79px] w-0.5 h-[70px] border-l border-dashed border-[#6C757B] ml-2" />
                  <div className="text-base font-bold text-text-black pl-2">
                    {t(taskKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-[1292px] h-[969px]">
          <ExportedImage
            src={`${basePath}/images/taskBg.png`}
            alt="taskBg"
            fill
            loading="lazy"
          />
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden pt-7">
        <h1 className="text-text-primary text-2xl font-semibold">
          {t('task-title')}
        </h1>
        <div className="relative flex flex-col gap-7 z-10 mt-6 bg-[#E5D3B0] rounded-[14px] p-4 pl-20">
          <div className="absolute left-4 top-4">
            <ExportedImage
              src={`${basePath}/images/blindBox.png`}
              alt="box"
              width={55}
              height={55}
              loading="lazy"
            />
          </div>
          {[
            { id: '1', action: handleInvite, btnText: t('go-invite') },
            {
              id: '2',
              action: handleGet,
              disabled: campaignDetail?.task_status !== TaskStatus.Awarding,
              btnText: `${
                campaignDetail?.task_status === TaskStatus.Done
                  ? t('doneGet')
                  : `${t('get')}${campaignDetail?.invite_num || 0}/3`
              } `
            }
          ].map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              {renderTaskHeader(`task-${item.id}`, `task-${item.id}-1`, true)}
              <ActionButton
                onClick={item.action}
                text={item.btnText}
                disabled={item.disabled}
                className="absolute! mt-10 right-2 w-20 h-10 text-xs pt-1.5"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 mt-6">
          {tasks.map((taskKey) => (
            <div key={taskKey} className="relative w-full h-[92px] px-4">
              <ExportedImage
                className="object-cover"
                src={`${basePath}/images/task-item-bg.svg`}
                alt="task-item"
                fill
                loading="lazy"
              />

              <div className="relative flex items-center w-full h-full gap-8">
                <ExportedImage
                  src={`${basePath}/images/blindBox.png`}
                  alt="blindBox"
                  width={44}
                  height={44}
                  loading="lazy"
                />
                <div className="absolute left-[58px] w-0.5 h-14 border-l border-dashed border-[#6C757B] ml-2" />
                <div className="text-sm font-bold text-text-black pl-2">
                  {t(taskKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ReferralShareModal
        modalOpen={isOpenShareModal}
        onClose={() => setIsOpenShareModal(false)}
      />
      <ReciveSetDialog open={isOpenRewardDialog} close={handleClose} />
    </>
  );
};

export default Task;
