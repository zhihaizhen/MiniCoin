import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(advancedFormat);

export const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const DEFAULT_FORMAT_DAY = 'YYYY-MM-DD';

// 通用版：判断注册用户是否处于某活动周期内（注册在活动开始后，且注册时间在 days 天之内）
export const getIsInPeriod = (registerTime, activityStartTime, days) => {
  const endTimeStamp = dayjs(registerTime * 1000)
    .add(days, 'day')
    .unix();
  const nowTimeStamp = dayjs().unix();

  const afterActivityRegister = !(registerTime < activityStartTime);
  const inPeriod = endTimeStamp > nowTimeStamp;
  return afterActivityRegister && inPeriod;
};

export const getIsNewUser = (registerTime, activityStartTime) => {
  // 新人的定义： 在活动开始后注册的，并且注册时间在7天之内的
  return getIsInPeriod(registerTime, activityStartTime, 7);
};

const getFormat = (time) => {
  return time < 10 ? '0' + time : time;
};

// 倒计时核心：基于给定的结束时间戳（秒）计算剩余时间，返回 intervalId 供调用方清理
export const getCountdownToTime = (endTimeStamp, cb): number => {
  const updateCountdown = () => {
    const nowTimeStamp = dayjs().unix();
    if (endTimeStamp > nowTimeStamp) {
      const mss = (endTimeStamp - nowTimeStamp) * 1000;
      const day = Math.floor(mss / (1000 * 60 * 60 * 24));
      const hours = Math.floor((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((mss % (1000 * 60)) / 1000);
      // 调用回调函数返回倒计时
      cb({
        days: getFormat(day),
        hours: getFormat(hours),
        minutes: getFormat(minutes),
        seconds: getFormat(seconds)
      });
    } else {
      clearInterval(intervalId); // 倒计时结束，清除定时器
      cb(null);
    }
  };
  const intervalId = setInterval(updateCountdown, 1000) as unknown as number; // 每秒更新一次
  updateCountdown(); // 立即执行一次，避免首屏空白
  return intervalId;
};

// 通用版倒计时：基于 registerTime + days 计算剩余时间，返回 intervalId 供调用方清理
export const getCountdownByDays = (registerTime, days, cb): number => {
  return getCountdownToTime(getPeriodEndTime(registerTime, days), cb);
};

// 解析某活动周期的结束时间戳（秒）：registerTime + days
// 调用方需保证 registerTime 有效且用户处于该周期内（见 getIsInPeriod），
export const getPeriodEndTime = (registerTime, days): number => {
  return dayjs(registerTime * 1000).add(days, 'day').unix();
};

export const getNewUserCountdown = (registerTime, cb): number => {
  return getCountdownByDays(registerTime, 7, cb);
};

export const unixToFormat: (time: number, format?: string) => string = (
  time,
  format = DEFAULT_FORMAT
) => {
  return dayjs.unix(time)?.format(format);
};

export const secondFormat = (time: number) => {
  return dayjs.unix(time)?.format(DEFAULT_FORMAT_DAY);
};

export const strToFormat: (str: string, format?: string) => string = (
  str,
  format = DEFAULT_FORMAT
) => {
  return dayjs(str)?.format(format);
};

export const strToFormatUnix: (str: string, format?: string) => string = (
  str,
  format = DEFAULT_FORMAT
) => {
  return dayjs(`${str}Z`)?.utc(true)?.format(format);
};

export default dayjs;
