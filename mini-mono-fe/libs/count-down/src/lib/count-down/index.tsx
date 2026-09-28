import React, { useEffect } from 'react';
import clx from 'classnames';
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
  isStartCount?: boolean | false;
  tmsTexts: Record<string, string>;
}

const CountDown: React.FC<ICountDownProps> = ({
  fm,
  page,
  isDisabled,
  now,
  expiry,
  autoEvent,
  isStartCount,
  tmsTexts = {}
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
      <div className={clx('series-registration-timer-widget', page)}>
        <div
          className={clx(
            'series-games-clock-bg',
            isDisabled ? 'series-games-clock-disabled-bg' : ''
          )}
        >
          <div className="series-games-flex">
            <div className="series-games-clock-item">
              <p className="series-games-clock-num">
                {isStartCount ? twoDigit(days) : '00'}
              </p>
              <p className="series-games-clock-txt">{tmsTexts.days}</p>
            </div>
            <div className="series-games-clock-colon-bg">
              <span className="series-games-clock-colon" />
              <span className="series-games-clock-colon" />
            </div>
            <div className="series-games-clock-item series-games-clock-hours">
              <p className="series-games-clock-num">
                {isStartCount ? twoDigit(hours) : '00'}
              </p>
              <p className="series-games-clock-txt">{tmsTexts.hours}</p>
            </div>
            <div className="series-games-clock-colon-bg">
              <span className="series-games-clock-colon" />
              <span className="series-games-clock-colon" />
            </div>
            <div className="series-games-clock-item">
              <p className="series-games-clock-num">
                {isStartCount ? twoDigit(minutes) : '00'}
              </p>
              <p className="series-games-clock-txt">{tmsTexts.minutes}</p>
            </div>
            <div className="series-games-clock-colon-bg">
              <span className="series-games-clock-colon" />
              <span className="series-games-clock-colon" />
            </div>
            <div className="series-games-clock-item">
              <p className="series-games-clock-num">
                {isStartCount ? twoDigit(seconds) : '00'}
              </p>
              <p className="series-games-clock-txt">{tmsTexts.seconds}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CountDown;
