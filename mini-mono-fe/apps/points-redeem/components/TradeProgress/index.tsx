import React from 'react';
import { TaskDetail } from '~/interface';
import { formatBigNumber } from '~/utils';
import { useFm } from '@better-bit-fe/base-hooks';

interface StepItemProps {
  value: number;
  isCompleted: boolean;
  bonus: string;
}

const ProgressStep = ({ value, isCompleted, bonus }: StepItemProps) => (
  <div className="text-xs font-medium ltr:text-left rtl:text-right text-text-primary">
    <span
      className={`relative md:text-[12px] after:content-[''] after:absolute after:top-[-13px] after:w-1 after:h-1 after:rounded-full  after:-start-1 ${
        isCompleted ? 'after:bg-black' : 'after:bg-text-secondary'
      }`}
    >
      <span className="absolute rtl:translate-x-[50%] ltr:translate-x-[-50%]">
        {formatBigNumber(value)}
      </span>
      <span className="absolute rtl:translate-x-[50%] ltr:translate-x-[-50%] top-[-39px] start-[50%] font-bold md:text-xs leading-4 ltr:text-start rtl:text-end ltr:start-0! rtl:start-[50%]! transform-none! text-text-primary">
        <span className="absolute rtl:translate-x-[50%] ltr:translate-x-[-50%] w-max">
          +{bonus}
        </span>
      </span>
    </span>
  </div>
);

interface TradeProgressProps {
  steps: TaskDetail[];
  doneNum: number;
  progress: number;
}

const TradeProgress = ({ steps = [], doneNum ,progress }: TradeProgressProps) => {
  const t = useFm();
  const clampedProgress = Math.min(progress, 100);

  const renderMobileView = () => (
    <div className="md:hidden w-full mb-4 mt-5 p-3 relative bg-bg-secondary rounded-lg">
      <div className="flex items-center justify-between text-text-primary text-xs">
        <div className="line-clamp-2">{t('today-trade-amount')}</div>
        <div className="line-clamp-2">{t('score-geted')}</div>
      </div>
      <div className="mt-[18px] relative pe-3 max-h-[130px] overflow-y-auto overflow-x-hidden pt-2">
        <ul className="relative list-none p-0 m-0 pe-2">
          <div className="absolute w-1.5 h-[calc(100%-10px)] bg-bg-tertiary rounded-full top-0 start-[3px] bottom-0" />
          <div
            className="absolute w-1.5 bg-text-brand-default-web rounded-full top-0 start-[3px] bottom-0 transition-all"
            style={{ height: `${clampedProgress}%` }}
          />
          <div className="absolute rounded-full w-1.5 bg-text-primary top-0 start-[3px]" />
          {steps.map(({ compare_value, award_volume }, index) => (
            <li
              className="relative min-h-[25px] mb-4 flex items-start"
              key={index}
            >
              <div
                className={`absolute top-1  w-1 h-1 start-1 rounded-full ${
                  index < doneNum ? 'bg-black' : 'bg-text-primary'
                }`}
              />
              <div className="relative ps-[22px] grid grid-cols-2 w-full text-xs text-text-primary -translate-y-1 gap-x-2">
                <span className="font-normal">
                  {formatBigNumber(+compare_value)}
                </span>
                <span className="rtl:text-left ltr:text-right font-normal leading-[120%] text-[12px]">
                  +{award_volume}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="hidden md:block w-full relative py-4 ps-1.5 mt-6">
      <div className="h-2 my-[7px] bg-bg-tertiary rounded-[99px] relative overflow-hidden">
        <div
          className="h-2 bg-text-brand-default-web rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <div className="w-full flex justify-between pl-1.5 pr-1">
        {steps.map(({ compare_value, award_volume }, index) => (
          <ProgressStep
            key={index}
            isCompleted={index < doneNum}
            bonus={String(award_volume)}
            value={+compare_value}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}
    </>
  );
};

export default TradeProgress;
