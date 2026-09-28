import type { IKycData, KycStatus } from '~/types';

/**
 * 根据 kyc_level 和 kyc_status 判断基础认证状态
 *
 * kyc_level = 0: 未做任何认证
 * kyc_level = 1: 已做基础认证,需要结合 kyc_status 判断具体状态
 * kyc_level = 2: 已做高级认证(基础认证必然已成功)
 *
 * @param kycData KYC 数据
 * @returns 基础认证状态
 */
export const getBasicKycStatus = (kycData: IKycData): KycStatus => {
  const kycLevel = kycData?.kyc_level ?? 0;
  const kycStatus = kycData?.kyc_status || 'unknown';

  // kyc_level === 2 表示已做高级认证,基础认证必然已成功
  if (kycLevel === 2) return 'passed';

  // kyc_level === 1 表示已做基础认证,返回实际的 kyc_status
  if (kycLevel === 1) return kycStatus;

  // 未做任何认证
  return 'unknown';
};

/**
 * 根据 kyc_level 和 kyc_status 判断高级认证状态
 *
 * kyc_level = 0: 未做任何认证,高级认证不可用
 * kyc_level = 1: 仅做了基础认证,高级认证可以开始(unknown)
 * kyc_level = 2: 已做高级认证,需要结合 kyc_status 判断具体状态
 *
 * @param kycData KYC 数据
 * @returns 高级认证状态
 */
export const getAdvancedKycStatus = (kycData: IKycData): KycStatus => {
  const kycLevel = kycData?.kyc_level ?? 0;
  const kycStatus = kycData?.kyc_status || 'unknown';

  // kyc_level === 2 表示已做高级认证,返回实际的 kyc_status
  return kycLevel === 2 ? kycStatus : 'unknown';
};

/**
 * 判断高级认证按钮是否可以点击
 * - 基础认证成功(kyc_level=1 且 kyc_status=passed)时可以点击
 * - 高级认证被拒绝(kyc_level=2 且 kyc_status=rejected)时可以重新提交
 *
 * @param kycData KYC 数据
 * @returns 高级认证是否可点击
 */
export const isAdvancedKycClickable = (kycData: IKycData): boolean => {
  const kycLevel = kycData?.kyc_level ?? 0;
  const kycStatus = kycData?.kyc_status || 'unknown';

  // 基础认证成功,可以进行高级认证
  if (kycLevel === 1 && kycStatus === 'passed') return true;

  // 高级认证被拒绝,可以重新提交
  if (kycLevel === 2 && kycStatus === 'rejected') return true;

  return false;
};

/**
 * 判断是否应该显示审核状态卡片
 * 当 kyc_status 为 pending 时显示
 *
 * @param kycData KYC 数据
 * @returns 是否显示审核状态卡片
 */
export const shouldShowStatusCard = (kycData: IKycData): boolean => {
  return kycData?.kyc_status === 'pending';
};

/**
 * 判断是否需要显示拒绝提示 Alert
 * kyc_level = 1 或 2 且 kyc_status = rejected 时显示
 *
 * @param kycData KYC 数据
 * @returns 是否显示拒绝提示
 */
export const shouldShowRejectionAlert = (kycData: IKycData): boolean => {
  const kycLevel = kycData?.kyc_level ?? 0;
  const kycStatus = kycData?.kyc_status || 'unknown';

  return (kycLevel === 1 || kycLevel === 2) && kycStatus === 'rejected';
};

/**
 * 获取拒绝提示的文案 key
 *
 * @param kycData KYC 数据
 * @returns 翻译 key
 */
export const getRejectionAlertMessageKey = (kycData: IKycData): string => {
  const kycLevel = kycData?.kyc_level ?? 0;

  const messageKeyMap: Record<number, string> = {
    1: 'setting.basicKycRejected',
    2: 'setting.advancedKycRejected'
  };

  return messageKeyMap[kycLevel] || '';
};
