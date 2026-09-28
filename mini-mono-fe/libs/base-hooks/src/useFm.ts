import { useCallback } from 'react';
import { useIntl, createIntl, createIntlCache } from 'react-intl';

/**
 * 使用方式两部曲
 * 1. const fm = useFm('bot');
 * 2. fm('xxx')
 * 如果没有二级目录
 * 1. const fm = useFm();
 * 2. fm('xxx')
 * @param prefix 前缀
 * @returns
 */
export function useFm(prefix?: string) {
  const { formatMessage } = useIntl();

  const fm = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (id: string, values?: any) => {
      return formatMessage({ id: prefix ? `${prefix}.${id}` : id }, values);
    },
    [prefix, formatMessage]
  );

  return fm;
}
// https://www.jianshu.com/p/4a061a6db605  UseinJs
