import { useRouter } from 'next/router';
import { useCallback } from 'react';

/**
 * 用于在获取用户的href地址，也可以用 @better-bit-fe/base-utils下的getHref
 * const {getHref} = useHref('/wsot2022');
 * getHref('/home') => xxx.com/en-US/wsot2022/home

 * @param projectName 项目名
 * @returns
 */
export function useHref(projectName = '') {
  const { locale } = useRouter();

  const getHref = useCallback(
    (path, isI18N = true) => {
      if (isI18N) {
        return '/' + locale + projectName + path;
      }
      return projectName + path;
    },
    [locale, projectName]
  );
  return {
    getHref
  };
}
