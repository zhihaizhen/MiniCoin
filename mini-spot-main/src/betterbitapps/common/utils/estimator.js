
import { isFunction } from '@unified/helpers';

export default function estimator(name, fn) {
  let cb = fn;
  if (isFunction(name)) cb = name;
  const fnName = name || cb.name;

  return (...args) => {
    const start = performance.now();
    const result = cb.apply(null, args); // eslint-disable-line
    const end = performance.now();
    const cost = end - start;

    
    return result;
  };
}
