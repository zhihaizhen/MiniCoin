import { useFm } from '@better-bit-fe/base-hooks';
import { useEffect, useState } from 'react';
import { ITime } from '~/interface';
import dayjs from 'dayjs';
import { countdownFormat } from '~/utils';

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <>
    <div className="hidden md:flex items-center gap-2">
      <div className="w-[54px] h-10 flex items-center justify-center text-2xl bg-[#612C1B] rounded-md">
        {value}
      </div>
      <span>{label}</span>
    </div>
    <div className="md:hidden flex flex-col items-center justify-between bg-[#903116] rounded-lg w-14 h-14 py-1">
      <strong className="text-xl font-bold text-text-primary leading-7">
        {value}
      </strong>
      <span className="text-xs text-text-secondary leading-[18px]">
        {label}
      </span>
    </div>
  </>
);

const Separator = () => (
  <span className="md:hidden text-[22px] font-bold text-text-primary leading-4">:</span>
);

interface CountDownClockProps {
  beginTime: number;
  endTime: number;
  callback: () => void;
}

const INITIAL_TIME: ITime = {
  day: '00',
  hour: '00',
  min: '00',
  sec: '00'
};

const determineCountdownTarget = (beginTime: number, endTime: number): number | null => {
  const now = dayjs().unix();
  if (now < beginTime) {
    return beginTime;
  } else if (now < endTime) {
    return endTime;
  }
  return null;
};

const isCountdownComplete = (parts: { days: string; hours: string; minutes: string; seconds: string }): boolean => {
  return +parts.days === 0 && +parts.hours === 0 && +parts.minutes === 0 && +parts.seconds === 0;
};

const CountDownClock = ({
                          beginTime,
                          endTime,
                          callback
                        }: CountDownClockProps) => {
  const t = useFm();
  const [time, setTime] = useState<ITime>(INITIAL_TIME);

  useEffect(() => {
    // if (!Number.isFinite(beginTime) || !Number.isFinite(endTime)) {
    //   return;
    // }
     if (
       !Number.isFinite(beginTime) ||
       !Number.isFinite(endTime) ||
       dayjs().unix() >= endTime
     ) {
       setTime(INITIAL_TIME);
       return;
     }
    const target = determineCountdownTarget(beginTime, endTime);
    const handleTick = (parts: {
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
    }) => {
      setTime({
        day: parts.days,
        hour: parts.hours,
        min: parts.minutes,
        sec: parts.seconds
      });

      if (isCountdownComplete(parts)) {
        callback();
      }
    };

    return countdownFormat(target, handleTick);
  }, [beginTime, endTime, callback]);



  return (
    <div className="flex justify-between md:justify-start items-center gap-4">
      <TimeUnit value={time.day} label={t('day')} />
      <Separator />
      <TimeUnit value={time.hour} label={t('hour')} />
      <Separator />
      <TimeUnit value={time.min} label={t('min')} />
      <Separator />
      <TimeUnit value={time.sec} label={t('sec')} />
    </div>
  );
};

export default CountDownClock;
