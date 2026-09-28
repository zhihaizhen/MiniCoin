import { useState, useEffect, useRef } from 'react';
import {
  getTimeFromSeconds,
  expiryTimestamp,
  getSecondsFromExpiry,
  customizeInterval,
  customizeClearInterval
} from './utils';

export default function useTimer(settings) {
  const { now, expiry, onExpire } = settings || {};
  const stamp = expiry;
  const startTime = now;
  const [seconds, setSeconds] = useState(
    getSecondsFromExpiry(stamp - startTime)
  );
  const intervalRef = useRef();
  function clearIntervalRef() {
    if (intervalRef.current) {
      //customizeClearInterval();
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }
  function handleExpire() {
    clearIntervalRef();
    onExpire(onExpire) && onExpire();
  }
  let count = 0;
  function start() {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        // 得到剩余的秒数逻辑： 得到结束时间到开始时间的固定的相差毫秒数，然后维持一个每次加1 * 1000的秒数变量，让相差毫秒数减去这个动态的变量
        // 不要从客户端拿时间去做倒计时
        //new Date(expiry).getTime() - new Date(now).getTime() 得到 开始时间和结束时间的相差的毫秒数
        const milliSecondsDistance =
          new Date(expiry).getTime() - new Date(now).getTime() - count * 1000;
        count += 1;
        const secondsValue = getSecondsFromExpiry(milliSecondsDistance);
        if (secondsValue <= 0) {
          handleExpire();
        }
        setSeconds(secondsValue);
      }, 1000);
    }
  }
  useEffect(() => {
    if (expiryTimestamp(stamp)) {
      setSeconds(getSecondsFromExpiry(stamp - startTime));
      start();
    }
    return clearIntervalRef;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);
  return {
    ...getTimeFromSeconds(seconds)
  };
}
