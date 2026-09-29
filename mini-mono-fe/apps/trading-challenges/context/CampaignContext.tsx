/**
 * 活动详情 Context
 * 管理活动详情数据，供多个组件共享使用
 */
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useRequest } from '~/hooks';
import { getCampaignDetailsPublic, getCampaignDetailsPrivate } from '~/api';
import type { CampaignDetail } from '~/types/api';

interface CampaignContextValue {
  campaignDetail: CampaignDetail | null;
  publicCampaignDetail: CampaignDetail | null; // 公开接口数据（用于 GiftCards）
  privateCampaignDetail: CampaignDetail | null; // 私有接口数据（用于登录态判断）
  loading: boolean;
  publicLoading: boolean; // 公开接口的 loading 状态
  privateLoading: boolean; // 私有接口的 loading 状态
  refresh: () => void;
  campaignNo: string | null;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  campaignNo: string;
}

/**
 * 活动详情 Provider
 * 在页面级别使用，自动调用接口获取活动详情
 * 从 props 中获取 campaign_no
 */
export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children, campaignNo }) => {
  const { isLogin } = useUserInfo();

  // 公开接口 - 未登录使用
  const { data: publicDetail, loading: publicLoading, run: runPublic } = useRequest<CampaignDetail>(
    getCampaignDetailsPublic,
    {
      immediate: false,
      initialData: null as CampaignDetail
    }
  );

  // 私有接口 - 登录后使用
  const { data: privateDetail, loading: privateLoading, run: runPrivate } = useRequest<CampaignDetail>(
    getCampaignDetailsPrivate,
    {
      immediate: false,
      initialData: null as CampaignDetail
    }
  );

  // 根据登录状态调用不同的接口
  useEffect(() => {
    if (campaignNo) {
      // 公开接口始终调用（用于 GiftCards 等组件）
      runPublic({ campaign_no: campaignNo });

      if (isLogin) {
        // 登录后额外调用私有接口
        runPrivate({ campaign_no: campaignNo });
      }
    }
  }, [campaignNo, isLogin, runPublic, runPrivate]);

  // 手动刷新方法
  const refresh = () => {
    if (campaignNo) {
      // 公开接口始终刷新
      runPublic({ campaign_no: campaignNo });

      if (isLogin) {
        // 登录后额外刷新私有接口
        runPrivate({ campaign_no: campaignNo });
      }
    }
  };

  // 根据登录状态选择使用哪个接口的数据
  // 登录时优先用 private 数据，但 private 还没返回时用 public 兜底，避免闪烁
  const campaignDetail = isLogin ? (privateDetail || publicDetail) : publicDetail;
  const loading = isLogin ? (privateLoading && publicLoading) : publicLoading;

  const value: CampaignContextValue = {
    campaignDetail: campaignDetail || null,
    publicCampaignDetail: publicDetail || null, // 始终提供公开接口数据
    privateCampaignDetail: privateDetail || null, // 始终提供私有接口数据
    loading,
    publicLoading, // 暴露公开接口的 loading 状态
    privateLoading, // 暴露私有接口的 loading 状态
    refresh,
    campaignNo
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};

/**
 * 使用活动详情的 Hook
 * 在子组件中使用，获取活动详情数据
 * @returns 活动详情数据、加载状态和刷新方法
 * @example
 * const { campaignDetail, loading, refresh } = useCampaign();
 */
export const useCampaign = (): CampaignContextValue => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign 必须在 CampaignProvider 内部使用');
  }
  return context;
};

