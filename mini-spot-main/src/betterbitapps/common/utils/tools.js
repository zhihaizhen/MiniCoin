import { useEffect } from 'react';
import throttle from 'lodash.throttle';

export const useByThrottle = (fn, wait, options, args) => {
  useEffect(() => {
    const throttled = throttle(fn, wait, options);
    throttled();
    return () => {
      throttled.cancel();
    };
  }, args);
};

export const getQueryParams = () => {
  const { search } = window.location;
  if (!search) return {};
  return search
    .slice(1)
    .split('&')
    .reduce((prev, cur) => {
      const [key, value] = cur.split('=');
      return { ...prev, [key]: decodeURIComponent(value) };
    }, {});
};
