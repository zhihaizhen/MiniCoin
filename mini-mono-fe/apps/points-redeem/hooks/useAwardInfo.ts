import { useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { AwardType } from '~/enums';
import { AwardItem, Record } from '~/interface';

export const AWARD_DESC_MAP = {
  [AwardType.ServiceCash]: 'redeemRewards.serviceCash',
  [AwardType.RealCash]: 'redeemRewards.realCash',
  [AwardType.PreGivenCash]: 'redeemRewards.postGivenCash',
  [AwardType.PostGivenCash]: 'redeemRewards.postGivenCash',
  [AwardType.MacBookPro36Gb1Tb]: 'MacBook Pro 36GB+1TB',
  [AwardType.IPhone17ProMax1Tb]: 'iPhone 17 Pro Max 1TB',
  [AwardType.IPhone17ProMax2Tb]: 'iPhone 17 Pro Max 2TB',
  [AwardType.IPhone17Pro1Tb]: 'iPhone 17 Pro 1TB',
  [AwardType.IPhone17512Gb]: 'iPhone 17 512GB',
  [AwardType.IPadAir13Inch]: 'iPad Air 13 Inch',
  [AwardType.AppleWatchSeries11]: 'Apple Watch Series 11',
  [AwardType.RedeemKnapsack]: 'redeemRewards.redeemKnapsack',
  [AwardType.RedeemItems]: 'redeemRewards.redeemItems',
  [AwardType.RedeemSuitcase]: 'redeemRewards.redeemSuitcase',
  [AwardType.GoldJewelry2g]: 'redeemRewards.goldJewelry2g',
  [AwardType.GoldJewelry3g]: 'redeemRewards.goldJewelry3g',
  [AwardType.GoldJewelry5g]: 'redeemRewards.goldJewelry5g',
  [AwardType.GoldJewelry10g]: 'redeemRewards.goldJewelry10g',
  [AwardType.GoldJewelry20g]: 'redeemRewards.goldJewelry20g',
  [AwardType.GoldJewelry30g]: 'redeemRewards.goldJewelry30g',

  [AwardType.WCCap]: 'redeemRewards.wccap',
  [AwardType.WCTee]: 'redeemRewards.wctee',
  [AwardType.WCR7Ball]: 'redeemRewards.wcr7ball',
  [AwardType.WCPMFigure]: 'redeemRewards.wcpmfigure',
  [AwardType.WCSpeaker]: 'redeemRewards.wcspeaker',
  [AwardType.WCGinBox]: 'redeemRewards.wcginbox',
  [AwardType.WCGoldenBallBox]: 'redeemRewards.wcgoldenballbox',
  [AwardType.WCSignedJersey]: 'redeemRewards.wcsignedjersey',
  [AwardType.WCSemiTrip2P]: 'redeemRewards.wcsemitrip2p',
  [AwardType.WCFinalTrip2P]: 'redeemRewards.wcfinaltrip2p',

  [AwardType.HWWatchGT6Pro]: 'HUAWEI WATCH GT 6 Pro',
  [AwardType.AppleWatchUltra2]: 'Apple Watch Ultra 2',
  [AwardType.CartierBB42]: 'redeemRewards.CartierBB42',
  [AwardType.RolexSubDate]: 'redeemRewards.RolexSubDate',
  [AwardType.RolexDaytonaPanda]: 'redeemRewards.RolexDaytonaPanda'
};

// 统一的奖品图片名生成逻辑

export const getAwardImage = (award?: AwardItem | Record) => {
  if (award?.award_type === AwardType.PhysicalAward) {
    return `${award.award_item_type}.png`;
  }
  return `${award?.award_type}.png`;
};

// 统一的奖品描述逻辑
export const getAwardTokenStr = (
  award?: AwardItem,
  t?: (key: string, values?: any) => string
) => {
  if (!award || !t) return '';

  const isPhysicalAward = award.award_type === AwardType.PhysicalAward;
  if (isPhysicalAward) {
    // 兼容两种实物奖励描述逻辑
    if (award.award_item_type === 'RedeemGold') {
      return t('redeemRewards.redeemGold');
    }
    if (AWARD_DESC_MAP[award.award_item_type as AwardType]) {
      return t(AWARD_DESC_MAP[award.award_item_type as AwardType]!);
    }
    return t('redeemRewards.default');
  }

  return `${award.award_amount} ${award.award_token}`;
};

export const getAwardDesc = (
  award?: AwardItem,
  t?: (key: string, values?: any) => string
) => {
  if (!award || !t) return '';

  if (!award.award_type || award.award_type === AwardType.PhysicalAward) {
    return '';
  }

  const key = AWARD_DESC_MAP[award.award_type];
  return key ? t(key) : '';
};

export const useAwardInfo = (award?: AwardItem) => {
  const t = useFm();

  const tokenStr = useMemo(() => getAwardTokenStr(award, t), [award, t]);

  const awardDesc = useMemo(() => getAwardDesc(award, t), [award, t]);

  const imageUrl = useMemo(() => getAwardImage(award), [award]);

  return {
    awardDesc,
    tokenStr,
    imageUrl
  };
};
