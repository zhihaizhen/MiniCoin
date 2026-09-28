import { useFm } from '@better-bit-fe/base-hooks';
import { useEffect, useState } from 'react';
import { ITime } from '~/interface';
import dayjs from 'dayjs';
import { countdownFormat } from '~/utils';

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center border border-line-border-default rounded-lg w-14 h-14 py-1">
    <strong className="text-[22px] font-bold text-text-primary">
      {value}
    </strong>
    {/*<span className="text-xs text-text-secondary leading-[18px]">{label}</span>*/}
  </div>
);

const Separator = () => (
  <span className="text-base font-bold text-text-secondary leading-4">:</span>
);

interface CountDownClockProps {
  beginTime: number;
  endTime: number;
  callback: () => void;
}

const CountDownClock = ({
  beginTime,
  endTime,
  callback
}: CountDownClockProps) => {
  const t = useFm();
  const [time, setTime] = useState<ITime>({
    day: '00',
    hour: '00',
    min: '00',
    sec: '00'
  });
  const [currentTarget, setCurrentTarget] = useState<number | null>(null);

  useEffect(() => {
    const nowTs = dayjs().unix();

    // 确定当前倒计时目标
    let target: number | null = null;
    if (nowTs < beginTime) {
      target = beginTime;
    } else if (nowTs < endTime) {
      target = endTime;
    }

    setCurrentTarget(target);

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

      // 检查当前倒计时是否完成
      if (
        +parts.days === 0 &&
        +parts.hours === 0 &&
        +parts.minutes === 0 &&
        +parts.seconds === 0
      ) {
        const now = dayjs().unix();
        // beginTime 倒计时结束后，切换到 endTime
        if (target === beginTime && now < endTime) {
          setCurrentTarget(endTime);
        }
        callback();
      }
    };

    return countdownFormat(target, handleTick);
  }, [beginTime, endTime, callback, currentTarget]);

  if (dayjs().unix() >= endTime) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-between md:justify-start items-center gap-4 px-4 md:px-0">
      <TimeUnit value={time.day} label={t('day')} />
      <span className="text-text-secondary text-[16px]">{t('day')}</span>
      <TimeUnit value={time.hour} label={t('hour')} />
      <Separator />
      <TimeUnit value={time.min} label={t('min')} />
      <Separator />
      <TimeUnit value={time.sec} label={t('sec')} />
    </div>
  );
};

export default CountDownClock;
