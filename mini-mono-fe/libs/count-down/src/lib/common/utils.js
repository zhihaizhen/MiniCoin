const getSecondsFromExpiry = (milliSecondsDistance) => {
  if (milliSecondsDistance > 0) {
    return Math.floor(milliSecondsDistance / 1000);
  }
  return '';
};
const expiryTimestamp = (tamp) => {
  const isValid = new Date(tamp).getTime() > 0;

  if (!isValid) {
    console.warn('Invalid expiryTimestamp settings', tamp);
  }
  return isValid;
};
const onExpire = (onExpire) => {
  const isValid = onExpire && typeof onExpire === 'function';
  if (onExpire && !isValid) {
    console.warn('Invalid onExpire settings function', onExpire);
  }
  return isValid;
};
const getTimeFromSeconds = (totalSeconds) => {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return {
    seconds,
    minutes,
    hours,
    days,
    totalSeconds
  };
};
const twoDigit = (num) => {
  if (num.toString().length < 2) {
    return `0${num}`;
  }
  return `${num}`;
};
let timer = null;
function customizeInterval(func, wait) {
  let inter = function () {
    func.call(null);
    timer = setTimeout(inter, wait);
  };
  timer = setTimeout(inter, wait);
}
function customizeClearInterval() {
  clearTimeout(timer);
  timer = null;
}
export {
  getTimeFromSeconds,
  onExpire,
  twoDigit,
  expiryTimestamp,
  getSecondsFromExpiry,
  customizeInterval,
  customizeClearInterval
};
