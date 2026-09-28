import React, { useEffect } from 'react';

import './index.less';
import useTimer from '../common/useTimer';
import { onExpire, twoDigit } from '../common/utils';

interface ICountDownProps {
  fm: any;
  expiry: string;
  now: string;
  page?: string;
  isDisabled?: boolean;
  autoEvent?: any;
  tmsTexts: Record<string, string>;
}

const SmallCountDown: React.FC<ICountDownProps> = ({
  fm,
  page,
  isDisabled,
  now,
  expiry,
  autoEvent,
  tmsTexts
}) => {
  // 倒计时
  const { days, hours, minutes, seconds, totalSeconds } = useTimer({
    now: now,
    expiry: expiry,
    onExpire: onExpire
  });
  useEffect(() => {
    if (totalSeconds.toString() && +totalSeconds === 1) {
      autoEvent && autoEvent();
    }
  }, [totalSeconds]);
  return (
    <span className="my-ranking-content-left-timer">
      <span className="timer-text">{twoDigit(days)}</span>
      <span className="timer-split">{tmsTexts.days}</span>
      <span className="timer-text">{twoDigit(hours)}</span>
      <span className="timer-split">{tmsTexts.hours}</span>
      <span className="timer-text">{twoDigit(minutes)}</span>
      <span className="timer-split">{tmsTexts.minutes}</span>
      <span className="timer-text">{twoDigit(seconds)}</span>
      <span className="timer-split">{tmsTexts.seconds}</span>
    </span>
  );
};
export default SmallCountDown;
