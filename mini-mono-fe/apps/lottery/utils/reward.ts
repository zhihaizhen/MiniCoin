import { basePath, getSymbolUrl } from '@better-bit-fe/base-utils';
import { AwardType } from '~/interface';
import { CouponType } from '~/enums';

export function getRewardImageSrc(type: AwardType, token: string, coupon_type: CouponType): string {
  if (type === 'VirtualCurrency') return getSymbolUrl(token);
  if (type === 'Coupons') return `${basePath}/images/${coupon_type || 'PostGivenCash'}.png`;
  return `${basePath}/images/card.svg`;
}
