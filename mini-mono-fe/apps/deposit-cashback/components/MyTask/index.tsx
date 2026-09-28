import React, { useEffect, useState } from 'react';
import { Progress } from 'antd';
import { countdownFormat, formatThousandDigit } from '~/utils';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, isApp } from '@better-bit-fe/base-utils';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import dayjs from 'dayjs';
import ExportedImage from 'next-image-export-optimizer';

/** 报名状态枚举 */
export enum RegisterStatus {
  /** 未充值完成 */
  INCOMPLETE = 0,
  /** 报名已完成 */
  COMPLETED = 1,
  /** 报名失败（风控审核失败, 审核失败） */
  FAILED = 2
}

/** 是否报名枚举 */
export enum NeedRegister {
  /** 未选择档位 */
  NOT_SELECTED = 0,
  /** 已选择档位 */
  SELECTED = 1
}

export interface TaskInfoProp {
  /** 是否报名 */
  need_register: NeedRegister;
  /** 报名状态 */
  register_status: RegisterStatus;
  /** 已选择档位ID，未报名返回null */
  level_id: number | null;
  /** 用户ID */
  user_id: number;
  /** 累积充值金额 */
  accumulate_recharge_amount: number;
  /** 任务数量 */
  task_num: number;
  /** 报名开始时间（时间戳） */
  register_begin_time: number;
  /** 报名结束时间（时间戳） */
  register_end_time: number;
  /** 是否完成 */
  complete: 0 | 1;
  /** 返现周期（天数） */
  day: number;
  /** 充值目标金额 */
  target_amount: number;
  cashback_amount: number;
}

interface IProps {
  taskInfo: TaskInfoProp;
  countDownCallback: () => void;
  loading?: boolean
}

interface ITime {
  day: number;
  hour: number;
  min: number;
  sec: number;
}

const MyTask = ({ taskInfo, countDownCallback, loading }: IProps) => {

  const t = useFm();

  const [time, setTime] = useState<ITime>({
    day: 0,
    hour: 0,
    min: 0,
    sec: 0
  });

  const { locale } = useRouter();

  const onDesposite = () => {
    const isAppPlatform = isApp();
    if (isAppPlatform) {
      handleGoAppPage("deposit", 'depositCashback')   //去充值
    } else {
      window.location.href = `/${locale}/assets/deposit`;
    }

  }

  useEffect(() => {
    // 只有充值未完成才进行倒计时
    if (taskInfo.register_status !== RegisterStatus.INCOMPLETE) return
    // 剩余时间不足时不计算倒计时
    const endTimeStamp = dayjs(taskInfo?.register_end_time * 1000).unix();
    const nowTimeStamp = dayjs().unix();
    if (endTimeStamp <= nowTimeStamp) return;

    const cb = (data) => {
      setTime({
        day: data.days,
        hour: data.hours,
        min: data.minutes,
        sec: data.seconds,
      })
      if (data.days === 0 && data.hours === 0 && data.minutes === 0 && data.seconds === 0) {
        countDownCallback();
      }
    };

    countdownFormat(taskInfo?.register_end_time, cb);
  }, [taskInfo?.register_end_time, taskInfo?.register_status, countDownCallback]);

  const CountDown = () => {
    return <div className="text-text-brand-default text-xs md:text-sm ml-1">{`${time.day} ${t('day')} ${time.hour} ${t('hour')}  ${time.min} ${t('min')}  ${time.sec} ${t('sec')} `}</div>
  }

  const SubTitle = ({ children }) => {
    return (
      <div className="text-text-secondary text-xs md:text-sm flex items-center before:content-[''] before:inline-block before:w-1 before:h-1 before:bg-[#666A6C] before:rounded-full before:mr-2">
        {children}
      </div>
    );
  };

  return (
    <div className="px-4 md:px-0">
      {loading ? (
        <div className="px-4 md:px-0 animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-6" />
          <div className="w-full border border-line-border-default rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-4">
                <div className="hidden md:block w-12 h-12 bg-gray-700 rounded" />
                <div className="flex-1">
                  <div className="h-6 w-64 bg-gray-700 rounded mb-4" />
                  <div className="h-4 w-48 bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-56 bg-gray-700 rounded mb-2" />
                  <div className="h-1 w-[310px] md:w-[500px] bg-gray-700 rounded" />
                </div>
              </div>
              <div className="w-full md:w-36 h-10 md:h-12 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-text-white text-2xl md:text-[32px] font-bold">
            {t('my-activity')}
          </h2>
          <div className="relative w-full  border border-line-border-default rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 py-6 px-4 md:px-6 mt-6 md:mt-10">
            <div className="flex justify-start items-center gap-4 md:gap-6">
              <div className="hidden md:block">
                <ExportedImage
                  src={`${basePath}/images/taskIcon.png`}
                  alt="task"
                  width={76}
                  height={76}
                />
              </div>

              <div>
                <div className="text-text-white text-lg md:text-xl mb-4 md:mb-2.5">
                  {t('deposit-get2', {
                    value: formatThousandDigit(String(taskInfo.target_amount)),
                    cashback: formatThousandDigit(
                      String(taskInfo.cashback_amount)
                    )
                  })}
                </div>
                {taskInfo.register_status === RegisterStatus.INCOMPLETE && (
                  <SubTitle>
                    {t('left-time', `充值剩余时间：`)} <CountDown />
                  </SubTitle>
                )}

                <SubTitle>
                  {`${t('current-amount', '当前充值金额：')}`}
                  <span className="text-text-brand-default mx-1">
                    {formatThousandDigit(
                      String(taskInfo.accumulate_recharge_amount)
                    )}
                  </span>
                  {` / ${
                    formatThousandDigit(String(taskInfo.target_amount)) || 0
                  } USDT`}
                </SubTitle>
                <SubTitle>
                  {`${t('task-progress', '任务进度: ')}`}
                  <span className="text-text-brand-default ml-1">{`${taskInfo.complete} %`}</span>
                </SubTitle>
                <Progress
                  percent={taskInfo.complete || 0}
                  showInfo={false}
                  className="w-[310px]! md:w-[500px]! [&>.ant-progress-outer>.ant-progress-inner>.ant-progress-bg]:bg-text-brand-default! [&>.ant-progress-outer>.ant-progress-inner]:bg-fill-slider! [&>.ant-progress-outer>.ant-progress-inner>.ant-progress-bg-outer]:h-1!"
                />
              </div>
            </div>

            {taskInfo.register_status === RegisterStatus.INCOMPLETE ? (
              <>
                <div
                  onClick={onDesposite}
                  className="flex justify-center items-center p-3 bg-text-brand-default rounded-xl w-full md:w-auto md:min-w-36 h-10 md:h-12 text-black hover:opacity-90 cursor-pointer"
                >
                  {t('go-deposit')}
                </div>
                <div className="hidden md:flex absolute top-0 right-0 text-sm justify-center items-center bg-[rgba(171,225,39,0.15)] rounded-tr-2xl rounded-bl-2xl min-w-[179px] px-4 h-8 cursor-pointer">
                  <CountDown />
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center py-3 px-6 bg-[#28292A] rounded-xl w-full md:w-auto md:min-w-36 h-10 md:h-12 text-white">
                {taskInfo.register_status === RegisterStatus.COMPLETED
                  ? t('act-completed', '活动已达标')
                  : t('act-uncompeleted', '活动未达标，请重新报名')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyTask
