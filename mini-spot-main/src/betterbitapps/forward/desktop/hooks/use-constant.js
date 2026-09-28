import { useRef } from 'react';

/**
 * useConstant can create instance only once
 *
 * @param {function} fn The singleton function
 * @returns {any} The singleton value.
 *
 * @see {@link https://github.com/Andarist/use-constant/blob/master/src/index.ts}
 */
const useConstant = (fn) => {
  const ref = useRef();

  if (!ref.current) {
    ref.current = { v: fn() };
  }

  return ref.current.v;
};

export default useConstant;
