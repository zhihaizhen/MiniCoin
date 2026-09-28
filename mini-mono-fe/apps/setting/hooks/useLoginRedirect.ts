import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { ENV } from '@better-bit-fe/base-utils';
import { STORAGE_ADDRESS } from '~/constant';

interface UseLoginRedirectOptions {
  /** 自定义 locale，如果不传则使用 router.locale */
  locale?: string;
}

/**
 * 登录验证和重定向 Hook
 * 用于在设置页面中验证用户登录状态，未登录时自动重定向
 *
 * @param options - 配置选项
 * @param options.locale - 自定义 locale，如果不传则使用 router.locale
 */
export const useLoginRedirect = (options?: UseLoginRedirectOptions) => {
  const { isLogin } = useUserInfo();
  const router = useRouter();
  const locale = options?.locale || router.locale;

  useEffect(() => {
    // 如果用户未登录，重定向到交易页面
    if (isLogin === false) {
      window.location.href = `/${locale}/trade/usdt/BTCUSDT`;
      return;
    }

    // 在生产、测试网、测试环境下进行额外的本地存储验证
    if (ENV !== 'prod' && ENV !== 'testnet' && ENV !== 'test') return;

    const isLoginStorage = localStorage.getItem(STORAGE_ADDRESS);
    if (!isLoginStorage && isLogin === false) {
      window.location.href = `/${locale}/account/login`;
    }
  }, [isLogin, locale]);
};
