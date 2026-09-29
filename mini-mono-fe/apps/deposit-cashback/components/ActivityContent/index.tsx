import React, { useCallback, useEffect, useState } from 'react';
import { CashbackRewards, TaskList } from '~/components';
import { getCampaignDetailsPrivate } from '~/api';
import { RegisterStatus, TaskInfoProp } from '~/components/MyTask';
import dynamic from 'next/dynamic';
import { useUserInfo } from '@better-bit-fe/base-provider';

const MyTask = dynamic(() => import('~/components/MyTask'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const ActivityContent = ({ levelList }) => {

  const { isLogin } = useUserInfo();
  const [loading, setLoading] = useState(false);

  const [isRegisterTask, setIsRegisterTask] = useState(false);
  const [myTaskInfo, setMyTaskInfo] = useState<TaskInfoProp>(null);

  const updateCampaignDetail = useCallback(() => {
    if (!isLogin) return;
    setLoading(true)
    getCampaignDetailsPrivate().then(res => {
      setMyTaskInfo(res)
      setIsRegisterTask(res.need_register === 1)
    }).finally(() => { setLoading(false) })
  }, [isLogin])

  useEffect(() => {
    updateCampaignDetail()
  }, [updateCampaignDetail])

  return (
    <div className='w-full flex flex-col gap-14 md:gap-[100px] max-w-[1200px] mx-auto py-14 md:py-[100px]'>
      {
        isLogin === undefined || loading ?
          <div>
            <div className="h-8 md:h-10 w-48 md:w-64 bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 md:mt-10">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="w-full md:w-[588px] px-4 md:px-6 py-6 md:py-9 border border-line-border-default rounded-2xl animate-pulse"
                >
                  <div className="flex gap-4 md:gap-6">
                    <div className="hidden md:block w-12 h-12 bg-gray-700 rounded" />
                    <div className="flex-1">
                      <div className="h-6 w-64 bg-gray-700 rounded mb-4" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-700 rounded" />
                        <div className="h-4 w-56 bg-gray-700 rounded" />
                        <div className="h-4 w-52 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full md:w-[100px] h-10 md:h-12 bg-gray-700 rounded-full" />
                </div>
              ))}
            </div>
          </div> :
          <>
            {isLogin && isRegisterTask && <MyTask taskInfo={myTaskInfo} countDownCallback={updateCampaignDetail} />}
            {myTaskInfo?.register_status !== RegisterStatus.INCOMPLETE && myTaskInfo?.register_status !== RegisterStatus.COMPLETED && <TaskList registerCallback={updateCampaignDetail} levelList={levelList} />}
            {/* 返现奖励 */}
            {myTaskInfo?.register_status === RegisterStatus.COMPLETED && <CashbackRewards />}
          </>
      }

    </div>
  )
}
export default ActivityContent
