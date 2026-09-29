import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TabType } from './interface';
import CashbackRecordModal from '../CashbackRecordModal';
import { ReactComponent as HistoryIcon } from '~/public/images/historyIcon.svg';
import { useTaskInfo } from '~/hooks/useTaskInfo';
import { formatThousandDigit } from '~/utils';
import EmptyState from '../EmptyState';
import LoadingSpinner from '../LoadingSpinner';
import { getLang } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { isApp } from '@better-bit-fe/base-utils';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { getReceiveAward } from '~/api';
import { message } from 'antd';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';

const CashbackRewards: React.FC = () => {
  const t = useFm();
  const lang = getLang();
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [isAwaiting, setIsAwaiting] = useState(false);
  const [isMore, setIsMore] = useState<boolean>(false);

  const tabs = useMemo(() => [
    { key: 'All', label: t('all') },
    { key: 'Locked', label: t('locked') },
    // { key: 'Init', label: t('init') },
    // { key: 'Awarding', label: t('awarding') },
    { key: 'Done', label: t('done') },
    { key: 'Expired', label: t('expired') }
  ], [t]);

  // 调用 useTaskInfo hook
  const { taskInfo, loading: taskInfoLoading, fetchTaskInfo } = useTaskInfo();

  // 时间格式化
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return t('exclusive-date-format', { month, day });
  };

  // 获取按钮文案
  const getButtonText = (status: string): string => {
    if (status === 'Init') {
      return t('go-trade');
    }
    if (status === 'Awarding') {
      return t('receive-award');
    }
    return tabs.find(t => t.key === status)?.label || '';
  };

  // 处理按钮点击事件
  const handleButtonClick = (task) => {
    if (taskInfoLoading || isAwaiting) return;
    if (task.task_status === 'Init') {
      // 进行中状态，跳转到交易页面
      const isAppPlatform = isApp();
      if (isAppPlatform) {
        handleGoAppPage('contract/trade?symbol=BTCUSDT', 'depositCashback'); //app交易页面
      } else {
        location.href = `${location.origin}/${lang}/trade/usdt/BTCUSDT`; //pc交易页面
      }
    }
    if (task.task_status === 'Awarding') {
      setIsAwaiting(true);
      getReceiveAward({ task_id: task.task_id })
        .then((res) => {
          fetchTaskInfo(false);
          message.success(t('receive-award-success'));
        })
        .catch((error) => {
          console.log('getReceiveAward---',error);
          message.error(t(error?.code || 'error'));
        })
        .finally(() => setIsAwaiting(false));
    }
  };

  // 获取进度百分比
  const getProgressPercentage = (archive: string, compare: string) => {
    return Math.min((Number(archive) / Number(compare)) * 100, 100);
  };

  // 自动滚动到选中的tab
  const scrollToActiveTab = (tabKey: TabType) => {
    if (tabScrollRef.current) {
      const activeIndex = tabs.findIndex(tab => tab.key === tabKey);
      const container = tabScrollRef.current;
      const containerWidth = container.clientWidth;

      // 计算每个tab的实际宽度（包括padding）
      const tabElements = container.querySelectorAll('button');
      let totalWidth = 0;

      for (let i = 0; i < activeIndex; i++) {
        if (tabElements[i]) {
          totalWidth += tabElements[i].offsetWidth;
        }
      }

      // 计算滚动位置，让选中的tab居中显示
      const activeTabElement = tabElements[activeIndex];
      const activeTabWidth = activeTabElement ? activeTabElement.offsetWidth : 0;
      const scrollLeft = totalWidth - (containerWidth / 2) + (activeTabWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  };

  // 当activeTab改变时自动滚动
  useEffect(() => {
    scrollToActiveTab(activeTab);
  }, [activeTab]);

  // 根据当前tab过滤数据
  const filteredTasks = activeTab === 'All'
    ? taskInfo
    : taskInfo.filter(task => task.task_status === activeTab);


  // 获取按钮样式
  const getButtonStyles = (status: string) => {
    switch (status) {
      case 'Init':
        return 'cursor-pointer bg-fill-button-secondary-default text-text-brand-default hover:bg-fill-button-secondary-hover';
      case 'Locked':
       return 'bg-fill-button-tertiary-default text-text-primary';
      case 'Awarding':
        return 'cursor-pointer bg-fill-button-secondary-default text-text-brand-default hover:bg-fill-button-secondary-hover';
      case 'Done':
        return 'bg-fill-button-tertiary-default text-text-primary';
      default:
        return 'bg-fill-button-tertiary-default text-text-primary';
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-6 lg:px-0 lg:py-0">
      {/* 头部区域 */}
      <div className="mb-4">
        {/* PC版头部布局 */}
        <div className="hidden lg:flex lg:flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-semibold text-white">
              {t('cashback-rewards-title')}
            </h2>
            <button
              onClick={() => setRecordModalVisible(true)}
              className="flex items-center justify-center gap-2 w-36 h-12 px-4
              rounded-xl border-none cursor-pointer bg-fill-button-secondary-default text-text-brand-default-web hover:bg-fill-button-secondary-hover"
            >
              <HistoryIcon />
              <span className="text-sm leading-[19px] font-[var(--Bold,600)]">
                {t('cashback-record-title')}
              </span>
            </button>
          </div>

          {/* PC版Tab切换和更新时间提示 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Tab切换 */}
            <div className="flex rounded-xl p-1   bg-[rgba(104,107,130,0.12)]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`px-4 py-2 text-sm transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'text-white font-[var(--Medium,500)] rounded-[12px]'
                      : 'text-text-secondary font-normal hover:text-gray-300'
                  }`}
                  style={
                    activeTab === tab.key
                      ? {
                          background: 'rgba(104, 107, 130, 0.24)',
                          boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)'
                        }
                      : {}
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 更新时间提示 */}
            <p className="text-sm text-text-secondary">
              {t('activity-update-time')}
            </p>
          </div>
        </div>

        {/* H5版头部布局 */}
        <div className="lg:hidden">
          {/* H5版标题和返现记录按钮在同一行 */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-white">
              {t('cashback-rewards-title')}
            </h2>
            <button
              onClick={() => setRecordModalVisible(true)}
              className="flex items-center gap-1 p-3 text-xs font-semibold text-text-brand-default-web
              rounded-xl transition-colors cursor-pointer bg-fill-button-secondary-default"
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>{t('cashback-record-title')}</span>
            </button>
          </div>

          {/* H5版Tab切换 - 支持横向滚动 */}
          <div className="mb-5">
            <div
              ref={tabScrollRef}
              className="flex rounded-xl p-1 overflow-x-auto scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'x mandatory'
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-white rounded-[12px] bg-bg-primary '
                      : 'text-text-secondary hover:text-text-tertiary'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {taskInfoLoading && <LoadingSpinner />}

      {/* 奖励列表 */}
      {!taskInfoLoading && (
        <div className="space-y-4">
          {filteredTasks &&
            filteredTasks
              .slice(0, isMore ? filteredTasks.length : 5)
              .map((task, index) => (
                <div key={index}>
                  {/* PC版卡片布局 */}
                  <div className="hidden lg:block rounded-2xl p-6 pl-10 transition-all border border-line-border-default hover:border-[var(--text-brand-default)]">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                      {/* 左侧：金额显示 */}
                      <div className="flex items-center gap-10">
                        <div className="text-center text-text-brand-default">
                          <div className="text-[32px] leading-[40px] font-bold tracking-[-0.32px]">
                            {formatThousandDigit(task.award_volume.toString())}
                          </div>
                          <div className="text-base font-medium leading-6 mt-1 text-text-brand-default">
                            {t(task.award_token || '')}
                          </div>
                        </div>

                        {/* 分隔线 */}
                        <div className="hidden lg:block w-px h-24 border-r border-dashed border-line-border-default"></div>
                      </div>

                      {/* 中间：详细信息 */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="text-xs font-medium leading-[18px] mb-2 text-text-secondary">
                            {formatDate(task.task_date)}
                          </div>
                          <div className="text-xl font-semibold leading-7 mb-4 text-text-primary">
                            {`${t(
                              'daily-contract-trade-volume'
                            )} ≥ ${formatThousandDigit(
                              Math.trunc(Number(task.compare_value)).toString()
                            )}`}
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="space-y-2">
                          <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--fill-fill-slider,#28292A)]">
                            <div
                              className="h-full transition-all duration-300 bg-[var(--text-brand-default)]"
                              style={{
                                width: `${getProgressPercentage(
                                  task.archive_value,
                                  task.compare_value
                                )}%`
                              }}
                            />
                          </div>
                          <div className="text-sm font-normal leading-[19px] text-text-primary font-[var(--Regular,400)]">
                            <span className="text-text-brand-default">
                              {formatThousandDigit(
                                task.archive_value.toString()
                              )}
                            </span>
                            <span>
                              {' '}
                              /{' '}
                              {formatThousandDigit(
                                Math.trunc(
                                  Number(task.compare_value)
                                ).toString()
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 右侧：按钮 */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleButtonClick(task)}
                          className={`w-36 h-12 p-3 rounded-full text-sm font-semibold transition-all ${getButtonStyles(
                            task.task_status
                          )}`}
                        >
                          {getButtonText(task.task_status)}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* H5版卡片布局 */}
                  <div className="lg:hidden relative border border-line-border-default rounded-2xl px-4 py-6 transition-all hover:border-text-brand-default">
                    {/* 右上角日期标签 */}
                    <div className="absolute top-0 right-0 bg-[rgba(255,255,255,0.08)] rounded-bl-2xl rounded-tr-2xl px-4 py-0.5">
                      <span className="text-xs font-medium text-white">
                        {formatDate(task.task_date)}
                      </span>
                    </div>

                    <div className="flex flex-col items-start">
                      {/* 金额和币种 */}
                      <div className="flex items-baseline gap-2 mb-6">
                        <div className="text-[28px] leading-9 font-semibold text-text-brand-default">
                          {formatThousandDigit(task.award_volume.toString())}
                        </div>
                        <div className="text-xs font-normal text-text-brand-default">
                          {t(task.award_token || '')}
                        </div>
                      </div>

                      {/* 任务描述  */}
                      <div className="mb-3 w-full">
                        <div className="text-lg font-semibold leading-[26px] text-white text-left">
                          {`${t(
                            'daily-contract-trade-volume'
                          )} ≥ ${formatThousandDigit(
                            Math.trunc(Number(task.compare_value)).toString()
                          )}`}
                        </div>
                      </div>

                      <div className="mb-6 w-full">
                        <div className="w-full h-1 rounded-full overflow-hidden bg-(--fill-fill-slider,#28292A) mb-3">
                          <div
                            className="h-full transition-all duration-300 bg-text-brand-default"
                            style={{
                              width: `${getProgressPercentage(
                                task.archive_value,
                                task.compare_value
                              )}%`
                            }}
                          />
                        </div>
                        <div className="text-sm font-normal leading-[19px] text-text-primary text-left">
                          <span className="text-text-brand-default">
                            {formatThousandDigit(task.archive_value.toString())}
                          </span>
                          <span>
                            {' '}
                            /{' '}
                            {formatThousandDigit(
                              Math.trunc(Number(task.compare_value)).toString()
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleButtonClick(task)}
                        className={`w-full h-10 p-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center ${getButtonStyles(
                          task.task_status
                        )}`}
                      >
                        {getButtonText(task.task_status)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          {filteredTasks?.length > 5 && (
            <div className="flex justify-center items-center text-sm text-text-primary mt-6">
              <div
                className="cursor-pointer flex items-center gap-1"
                onClick={() => setIsMore((visible) => !visible)}
              >
                {!isMore ? (
                  <>
                    {t('more')} <MoreIcon className="text-xl" />
                  </>
                ) : (
                  <>
                    {t('hide')} <LessIcon className="text-xl" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 空状态 */}
      {!taskInfoLoading && filteredTasks.length === 0 && (
        <EmptyState title="empty-title" />
      )}

      {/* 返现记录弹框 */}
      <CashbackRecordModal
        visible={recordModalVisible}
        onClose={() => setRecordModalVisible(false)}
      />
    </div>
  );
};

export default CashbackRewards;
