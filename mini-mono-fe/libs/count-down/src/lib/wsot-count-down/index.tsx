import React, { useEffect } from 'react';
import clx from 'classnames';
import useTimer from '../common/useTimer';
import { onExpire, twoDigit } from '../common/utils';
import './index.less';

interface ICountDownProps {
  fm: any;
  expiry: string;
  now: string;
  page?: string;
  isDisabled?: boolean;
  autoEvent?: any;
  isStartCount?: boolean | false;
}

const WsotCountDown: React.FC<ICountDownProps> = ({
  fm,
  page,
  isDisabled,
  now,
  expiry,
  autoEvent,
  isStartCount
}) => {
  // 倒计时
  const { days, hours, minutes, seconds, totalSeconds } = useTimer({
    now: now,
    expiry: expiry,
    onExpire: onExpire
  });
  useEffect(() => {
    // 倒计时是 0 的情况
    if (totalSeconds.toString() && +totalSeconds === 1) {
      setTimeout(() => {
        autoEvent && autoEvent();
      }, 1000);
    }
  }, [totalSeconds]);
  return (
    <div>
      <div className={clx('wsot-registration-timer-widget', page)}>
        <div
          className={clx(
            'wsot-clock-bg',
            isDisabled ? 'series-games-clock-disabled-bg' : ''
          )}
        >
          <div className="wsot-flex">
            <div className="wsot-clock-item">
              <p className="wsot-clock-num">
                {isStartCount ? twoDigit(days) : '00'}
              </p>
              <p className="wsot-clock-txt">{fm('index.count-down.days')}</p>
            </div>
            <div className="wsot-clock-colon-bg">
              <span className="wsot-clock-colon" />
              <span className="wsot-clock-colon" />
            </div>
            <div className="wsot-clock-item wsot-clock-hours">
              <p className="wsot-clock-num">
                {isStartCount ? twoDigit(hours) : '00'}
              </p>
              <p className="wsot-clock-txt">{fm('index.count-down.hours')}</p>
            </div>
            <div className="wsot-clock-colon-bg">
              <span className="wsot-clock-colon" />
              <span className="wsot-clock-colon" />
            </div>
            <div className="wsot-clock-item">
              <p className="wsot-clock-num">
                {isStartCount ? twoDigit(minutes) : '00'}
              </p>
              <p className="wsot-clock-txt">{fm('index.count-down.minutes')}</p>
            </div>
            <div className="wsot-clock-colon-bg">
              <span className="wsot-clock-colon" />
              <span className="wsot-clock-colon" />
            </div>
            <div className="wsot-clock-item">
              <p className="wsot-clock-num">
                {isStartCount ? twoDigit(seconds) : '00'}
              </p>
              <p className="wsot-clock-txt">{fm('index.count-down.seconds')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WsotCountDown;
