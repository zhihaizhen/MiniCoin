import React, { useEffect } from 'react';
import clx from 'classnames';
import useTimer from '../common/useTimer';
import { onExpire, twoDigit } from '../common/utils';

interface ICountDownProps {
  expiry: string; //UTC Time eg: 2021-04-02T12:39:56Z
  now: string; //UTC Time eg: 2021-04-02T12:39:56Z
  customizedClass?: string;
  isDisabled?: boolean;
  autoEvent?: any;
  isStartCount?: boolean;
  dayI18n?: string;
  hourI18n?: string;
  minI18n?: string;
  secI18n?: string;
  showDay?: boolean;
  showHour?: boolean;
  showMin?: boolean;
  showSec?: boolean;
  showColon?: boolean;
  showUnit?: boolean;
}

const CustomizableCountDown: React.FC<ICountDownProps> = ({
  expiry,
  now,
  customizedClass,
  isDisabled = false,
  autoEvent,
  isStartCount = false,
  dayI18n = 'DAY',
  hourI18n = 'HOUR',
  minI18n = 'MIN',
  secI18n = 'SEC',
  showDay = true,
  showHour = true,
  showMin = true,
  showSec = true,
  showColon = true,
  showUnit = true
}) => {
  // 倒计时
  const { days, hours, minutes, seconds, totalSeconds } = useTimer({
    now: now,
    expiry: expiry,
    onExpire: onExpire
  });

  useEffect(() => {
    if (totalSeconds.toString() && +totalSeconds === 1) {
      setTimeout(() => {
        autoEvent && autoEvent();
      }, 1000);
    }
  }, [totalSeconds]);
  return (
    <div>
      <div className={customizedClass}>
        <div className={clx('clock-bg', isDisabled ? 'clock-disabled-bg' : '')}>
          <div style={{ display: 'flex' }}>
            {showDay && (
              <div className="clock-item">
                <p className="clock-num">
                  {isStartCount ? twoDigit(days) : '00'}
                </p>
                {showUnit && <p className="clock-txt">{dayI18n}</p>}
              </div>
            )}
            {showDay && showHour && showColon && (
              <div className="clock-item">
                <span className="clock-num">:</span>
              </div>
            )}
            {showHour && (
              <div className="clock-item clock-hours">
                <p className="clock-num">
                  {isStartCount
                    ? !showDay
                      ? twoDigit(hours + 24 * days)
                      : twoDigit(hours)
                    : '00'}
                </p>
                {showUnit && <p className="clock-txt">{hourI18n}</p>}
              </div>
            )}
            {showHour && showMin && showColon && (
              <div className="clock-item">
                <span className="clock-num">:</span>
              </div>
            )}
            {showMin && (
              <div className="clock-item">
                <p className="clock-num">
                  {isStartCount ? twoDigit(minutes) : '00'}
                </p>
                {showUnit && <p className="clock-txt">{minI18n}</p>}
              </div>
            )}
            {showMin && showSec && showColon && (
              <div className="clock-item">
                <span className="clock-num">:</span>
              </div>
            )}
            {showSec && (
              <div className="clock-item">
                <p className="clock-num">
                  {isStartCount ? twoDigit(seconds) : '00'}
                </p>
                {showUnit && <p className="clock-txt">{secI18n}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomizableCountDown;
