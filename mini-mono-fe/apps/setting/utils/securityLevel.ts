import { KycLevel, KycStatus, UserInfo } from '~/interface';

export type SecurityLevel = 'low' | 'medium' | 'high';

/**
 * 是否已完成初级 KYC（高级通过时初级必然已完成）
 * - Level1 + passed：初级通过
 * - Level2：已进入/完成高级，初级必然已通过
 */
function hasPrimaryKyc(userInfo?: Partial<UserInfo> | null): boolean {
  const { kyc_level, kyc_status } = userInfo || {};
  if (kyc_level === KycLevel.Level2) return true;
  return kyc_level === KycLevel.Level1 && kyc_status === KycStatus.Passed;
}

/**
 * 安全等级判断：
 * - 低：未绑定谷歌验证，或未满足中/高条件
 * - 中：已绑定谷歌 +（邮箱或手机其一）+ 未完成初级 KYC
 * - 高：已绑定谷歌 + 完成初级 KYC（含已完成高级）
 */
export function getSecurityLevel(userInfo?: Partial<UserInfo> | null): SecurityLevel {
  const {
    google2fa_is_verified,
    mobile_is_verified,
    email_is_verified
  } = userInfo || {};

  const hasGoogle = !!google2fa_is_verified;
  const hasContact = !!email_is_verified || !!mobile_is_verified;
  const primaryKycDone = hasPrimaryKyc(userInfo);

  if (hasGoogle && primaryKycDone) {
    return 'high';
  }

  if (hasGoogle && hasContact && !primaryKycDone) {
    return 'medium';
  }

  return 'low';
}
