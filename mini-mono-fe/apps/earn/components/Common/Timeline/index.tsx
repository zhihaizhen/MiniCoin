import dayjs from 'dayjs';
import React, { ReactNode, useMemo, memo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { CategoryEnum, TagEnum } from '~/enums';
import classNames from 'classnames';
import { TIME_FORMAT } from '~/constants';

interface TimelineProps {
  days: number;
  type: CategoryEnum;
  tag?: CategoryEnum | TagEnum;
}

type TimelineItem = { isCompleted?: boolean; children: ReactNode };


const Timeline = memo(({ type, days, tag }: TimelineProps) => {
  const t = useFm();

  const renderTimelineRow = (
    label: ReactNode,
    value: ReactNode,
    isCompleted?: boolean
  ): TimelineItem => ({
    isCompleted,
    children: (
      <div className="flex-1 flex justify-between items-center text-xs pl-4">
        <span className="text-text-secondary font-normal">{label}</span>
        <span className="text-text-primary">{value}</span>
      </div>
    )
  });

  const timelineItems: TimelineItem[] = useMemo(() => {
    // 当前 UTC 时间 +1天，再设置到 00:00:00
    const utcStartOfNextDay = dayjs().utc().add(1, 'day').startOf('day');

    const qxTime = utcStartOfNextDay.local().format(TIME_FORMAT);
    const pxTime = utcStartOfNextDay
        .add(1, 'day')
        .local()
        .format(TIME_FORMAT);
    if (type === CategoryEnum.LIQUID) {

      return [
        renderTimelineRow(tag === TagEnum.DEFI || tag === TagEnum.POS ? t('stake-time') : t('subscribeTime'), t('now'), true),
        renderTimelineRow(t('qxTime'), qxTime),
        renderTimelineRow(t('pxTime'), pxTime)
      ];
    }
    const dqTime = !days ? '-' : utcStartOfNextDay
      .add(+days, 'day')
      .local()
      .format(TIME_FORMAT);
    const dzTime = !days ? '-' : utcStartOfNextDay
      .add(+days + 1, 'day')
      .local()
      .format(TIME_FORMAT);

    return [
      renderTimelineRow(tag === TagEnum.DEFI || tag === TagEnum.POS ? t('stake-time') : t('subscribeTime'), t('now'), true),
      renderTimelineRow(t('qxTime'), qxTime),
      renderTimelineRow(t('pxTime'), pxTime),
      renderTimelineRow(t('expiration-time'), dqTime),
      renderTimelineRow(t('arrival-time'), dzTime)
    ];
  }, [type, days, tag, t]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-0 ">
        {timelineItems.map((step, index) => (
          <div key={index} className="relative flex items-start h-[35px] ">
            {/* 左侧装饰线和圆点 */}
            <div className="flex flex-col items-center mr-3 h-full ">
              <div
                className={classNames(
                  'absolute left-0 top-1 w-2 h-2 rounded-full z-10',
                  step.isCompleted
                    ? 'bg-text-primary'
                    : 'bg-bg-tertiary'
                )}
              />
              {index !== timelineItems.length - 1 && (
                <div
                  className={classNames(
                    'w-0.5 absolute top-3.5 bottom-px left-[3px]',
                    step.isCompleted
                      ? 'bg-text-primary'
                      : 'bg-bg-tertiary'
                  )}
                />
              )}
            </div>

            {/* 右侧内容区域 */}
            {step.children}
          </div>
        ))}
      </div>
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
