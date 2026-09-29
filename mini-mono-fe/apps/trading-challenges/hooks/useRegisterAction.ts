/**
 * 报名操作 Hook
 *
 * 统一处理活动报名逻辑，包括未登录跳转注册和已登录调用报名接口
 * @example
 * const { handleRegister, loading } = useRegisterAction({
 *   onSuccess: () => console.log('报名成功')
 * });
 */

import { useCallback } from 'react';
import { message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { debounce, jumpToPage } from '~/utils';
import { useCampaign } from '~/context';
import { useUserRegister } from './apiHooks';

interface UseRegisterActionOptions {
  /** 报名成功回调 */
  onSuccess?: () => void;
  /** 报名失败回调 */
  onError?: (error: any) => void;
}

export const useRegisterAction = (options?: UseRegisterActionOptions) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { refresh, campaignNo } = useCampaign();
  const { run: register, loading } = useUserRegister({
    onSuccess: () => {
      message.success(t('register-success-message'));
      // 刷新活动详情,获取最新的报名状态
      refresh();
    },
    onError: (error) => {
      console.error('报名失败:', error);
      message.error(t(`${error.code}`));
    }
  });

  // 报名处理逻辑
  const handleRegister = useCallback(
    debounce(async () => {
      // 未登录:跳转到注册页
      if (!isLogin) {
        jumpToPage('register');
        return;
      }

      // 检查活动编号
      if (!campaignNo) {
        message.error(t('register-loading-error'));
        return;
      }

      // 已登录:调用报名接口
      await register({ campaign_no: campaignNo });
    }, 500),
    [isLogin, campaignNo, register, t]
  );

  return {
    handleRegister,
    loading,
    isLogin
  };
};
