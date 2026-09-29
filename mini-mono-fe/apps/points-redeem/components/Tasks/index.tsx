import { useFm } from '@better-bit-fe/base-hooks';
import React, { useMemo } from 'react';
import styles from './index.module.less';
import { BannerData, CampaignDetail, TaskItem } from '~/interface';
import { TaskEvent } from '~/enums';
import { goPage } from '@better-bit-fe/base-utils';
import CustomSkeleton from '~/components/CustomSkeleton';
import ReferralShareModal from '~/components/ReferralShareModal';
import TradeProgress from '~/components/TradeProgress';
import { toThousands } from '@unified/helpers';
import { useUserInfo } from '@better-bit-fe/base-provider';

const TaskCard: React.FC<TaskItem & { bannerData: BannerData }> = ({ bannerData, ...task }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [isOpenShare, setIsOpenShare] = React.useState(false);


  const taskConfig = useMemo(() => {
    const mapping = {
      [TaskEvent.Trade]: {
        title: t('task-contract'),
        desc: t('task-contract-desc'),
        progressLabel: t('today-trade-amount'),
        btnTxt: t('goTrade'),
        action: () => {
          if (!isLogin) return goPage('login');
          goPage('trade');
        }
      },
      [TaskEvent.Deposit]: {
        title: t('task-deposit'),
        desc: t('task-deposit-desc'),
        progressLabel: t('today-deposit-amount'),
        btnTxt: t('goDeposit'),
        action: () => {
          if (!isLogin) return goPage('login');
          goPage('deposit');
        }
      },
      [TaskEvent.TradeFee]: {
        title: t('task-invite'),
        desc: t('task-invite-desc'),
        progressLabel: t('today-invite-amount'),
        btnTxt: t('goInvite'),
        action: () => {
          if (!isLogin) return goPage('login');
          setIsOpenShare(true);
        }
      }
    };
    return mapping[task.task_event as TaskEvent] || null;
  }, [t, task.task_event, isLogin]);

  const handleTaskClick = () => {
    taskConfig?.action?.();
  };

  return (
    <div className="relative mt-6">
      <div
        className={`md:min-h-[188px] h-auto border border-line-border-default rounded-xl grid grid-cols-1 md:grid-cols-[180px_auto]
          pr-4 pt-4 md:pt-0 pl-4 md:pl-0 pb-6 md:pb-0 cursor-pointer overflow-hidden ${styles.taskCard}`}
      >
        <div className="md:bg-bg-secondary flex md:flex-col justify-start md:justify-center items-end md:items-center gap-2">
          <strong className="text-text-brand-default-web text-[32px] font-bold leading-8">
            +{task.today_sum_points}
          </strong>
          <span className="text-text-secondary text-sm">{t('score')}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between w-full h-full md:gap-10">
          <div className="flex-1 md:pl-8 h-full flex flex-col justify-start pt-5 md:pt-8">
            <div className="text-text-primary text-[16px] md:text-xl font-bold leading-7">
              {taskConfig?.title}
            </div>
            <p className="text-text-secondary text-sm mt-3">
              {taskConfig?.desc}
            </p>
            {task.task_event === TaskEvent.Trade && (
              <TradeProgress
                steps={task.today_tasks}
                doneNum={+task.task_done_num}
                progress={
                  +task.task_num === 0 || +task.task_done_num === 0
                    ? 0
                    : Math.floor(
                        ((+task.task_done_num - 1) / (+task.task_num - 1)) * 100
                      )
                }
              />
            )}
            <div className="flex items-center justify-start mt-4 md:mt-6">
              <span className="text-text-secondary text-xs leading-[18px] mr-2">
                {taskConfig?.progressLabel}
              </span>
              <strong className="text-text-brand-default-web text-xs font-bold leading-[18px] mr-1">
                {toThousands(+task.today_archive_value)}
              </strong>
              <strong className="text-text-primary text-xs font-bold leading-[18px]">
                / {toThousands(+task.today_compare_value)}
                {task.task_event === TaskEvent.TradeFee ? t('person') : ' USDT'}
              </strong>
            </div>
            <div className="flex items-center justify-start mt-1 md:mb-8">
              <span className="text-text-secondary text-xs leading-[18px] mr-2">
                {t('today-score')}
              </span>
              <strong className="text-text-brand-default-web text-xs font-bold leading-[18px] mr-1">
                {task.today_points}
              </strong>
            </div>
          </div>
          <button
            className="w-full md:w-auto md:min-w-[100px] px-3 h-10 mt-4 md:mt-0 rounded-xl text-sm font-medium cursor-pointer
              bg-fill-button-primary-default text-text-white-to-black hover:bg-fill-button-primary-hover z-10"
            onClick={handleTaskClick}
          >
            {taskConfig.btnTxt}
          </button>
        </div>
      </div>
      <ReferralShareModal
        modalOpen={isOpenShare}
        title={bannerData.mainTitle || t('header-title')}
        subTitle={bannerData.subTitle || t('sub-title')}
        onClose={() => setIsOpenShare(false)}
      />
    </div>
  );
};

interface TaskProps {
  loading: boolean;
  bannerData: BannerData;
  campaignDetail?: CampaignDetail;
  callback?: () => void;
}

const Tasks: React.FC<TaskProps> = ({ bannerData, loading, campaignDetail }) => {
  const t = useFm();

  const renderContent = () => {
    if (loading) return <CustomSkeleton type="tasks" />;
    return campaignDetail?.task_items.map((task, index) => (
      <TaskCard key={index} {...task} bannerData={bannerData} />
    ));
  };

  return (
    <div className="w-full px-4 md:px-0 mt-16 md:mt-[100px]">
      <h1 className="text-text-primary font-semibold text-2xl md:text-[40px] mb-6 md:mb-4">
        {t('task')}
      </h1>
      {renderContent()}
    </div>
  );
};

export default Tasks;
