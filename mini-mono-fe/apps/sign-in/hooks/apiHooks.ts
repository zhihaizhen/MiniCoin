/**
 * API Hooks 统一管理
 *
 * 使用工厂函数快速创建 API hooks，避免重复代码
 * 所有业务 API hooks 统一在此文件定义和导出
 */

import {
  createListApiHook,
  createDetailApiHook,
  createMutationHook
} from './createApiHook';
import * as API from '../api';
import type {
  DepositNotification,
  TaskInfo,
  UserCashbackItem,
  UserCashbackParams,
  CampaignDetail,
  ReceiveAwardParams,
  PhysicalAwardData,
  AwardRecord,
  ReceiveAwardRecordParams,
  AffiliateLineInfo
} from '~/types/api';

// 导出类型
export type {
  DepositNotification,
  TaskInfo,
  UserCashbackItem,
  UserCashbackParams,
  CampaignDetail,
  ReceiveAwardParams,
  PhysicalAwardData,
  AwardRecord,
  ReceiveAwardRecordParams,
  AffiliateLineInfo
};

// ==================== 查询类 API（自动请求） ====================

/**
 * 获取活动详情（公开）
 * @returns 活动详情数据和加载状态
 * @example const { data: campaignDetail, loading, refresh } = useCampaignDetailsPublic();
 */
export const useCampaignDetailsPublic = createDetailApiHook<CampaignDetail>(
  API.getCampaignDetailsPublic
);

/**
 * 获取活动详情（登录态）
 * @returns 活动详情数据和加载状态
 * @example const { data: campaignDetail, loading, refresh } = useCampaignDetailsPrivate();
 */
export const useCampaignDetailsPrivate = createDetailApiHook<CampaignDetail>(
  API.getCampaignDetailsPrivate
);

/**
 * 获取领取奖励记录（手动触发）
 * @returns 奖励记录数据和加载状态
 * @example
 * const { data: awardRecords, loading, run } = useAwardRecords();
 * run({ campaign_no: 'xxx', page_num: 1, page_size: 30 });
 */
export const useAwardRecords = createMutationHook<
  AwardRecord[],
  ReceiveAwardRecordParams
>(API.receiveAwardRecord, {
  initialData: [],
  formatResult: (res) => res?.records || []
});

/**
 * 获取用户联盟线验证信息
 * @returns 联盟线验证信息和加载状态
 * @example const { data: affiliateInfo, loading } = useAffiliateLineInfo();
 */
export const useAffiliateLineInfo = createDetailApiHook<AffiliateLineInfo>(
  API.affiliateLineVerify
);

// ==================== 操作类 API（手动触发） ====================

/**
 * 用户报名活动
 * @returns 报名结果和加载状态
 * @example
 * const { run: register, loading } = useUserRegister({
 *   onSuccess: () => message.success('报名成功'),
 *   onError: (error) => message.error('报名失败')
 * });
 * await register({ campaign_no: 'xxx' });
 */
export const useUserRegister = createMutationHook<
  string,
  { campaign_no: string }
>(API.userRegister);

/**
 * 领取奖励
 * @returns 领取结果和加载状态
 * @example
 * const { run: receiveAward, loading } = useReceiveAward({
 *   onSuccess: () => message.success('领取成功')
 * });
 * await receiveAward({ task_id: 1, award_id: 1 });
 */
export const useReceiveAward = createMutationHook<any, ReceiveAwardParams>(
  API.receiveAward
);

/**
 * 领取实物奖励
 * @returns 领取结果和加载状态
 * @example
 * const { run: receivePhysicalAward, loading } = useReceivePhysicalAward({
 *   onSuccess: () => message.success('提交成功')
 * });
 * await receivePhysicalAward({ address: '...', phone: '...', name: '...' });
 */
export const useReceivePhysicalAward = createMutationHook<
  any,
  PhysicalAwardData
>(API.receivePhysicalAward);
