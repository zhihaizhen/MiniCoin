import { useQuickLogin, useUserInfo } from '@better-bit-fe/base-provider';
import { useCallback } from 'react';

export function useCheckLogin(callback: (...args) => void) {
  const { isLogin } = useUserInfo();
  const { openModel } = useQuickLogin();

  const fn = useCallback(
    (...args) => {
      if (isLogin) {
        callback(...args);
      } else {
        openModel();
      }
    },
    [callback, isLogin, openModel]
  );

  return fn;
}
