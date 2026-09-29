import ExportedImage from 'next-image-export-optimizer';
import { RewardItem } from '~/interface';
import { basePath } from '@better-bit-fe/base-utils';
import { AwardType } from '~/enums';
import { useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';

const AWARD_TYPE_IMAGE_MAP: Partial<Record<AwardType, string>> = {
  [AwardType.ServiceCash]: 'RealCash.png',
  [AwardType.RealCash]: 'RealCash.png',
  [AwardType.PreGivenCash]: 'RealCash.png',
  [AwardType.PostGivenCash]: 'RealCash.png'
};

const AWARD_TYPE_DESC_MAP: Partial<Record<AwardType, string>> = {
  [AwardType.ServiceCash]: 'redeemRewards.serviceCash',
  [AwardType.RealCash]: 'redeemRewards.realCash',
  [AwardType.PreGivenCash]: 'redeemRewards.postGivenCash',
  [AwardType.PostGivenCash]: 'redeemRewards.postGivenCash'
};

export const getAwardImage = (award?: RewardItem): string => {
  if (award?.award_type === AwardType.PhysicalAward) {
    return `${award.award_item_type}.png`;
  }
  return (award?.award_type && AWARD_TYPE_IMAGE_MAP[award.award_type]) || 'RealCash.png';
};

export const getAwardDesc = (award: RewardItem, t: (key: string) => string): string => {
  if (award?.award_type === AwardType.PhysicalAward) {
    if (award?.award_item_type === 'RedeemGold') {
      return t('redeemRewards.redeemGold');
    }
    return t('redeemRewards.default');
  }
  const key = AWARD_TYPE_DESC_MAP[award?.award_type as AwardType];
  return key ? `${award?.award_amount}${award?.award_token} ${t(key)}` : '';
};

interface RewardItemProps {
  wrapClassName?: string;
  imageClassName?: string;
  textClassName?: string;
  award: RewardItem;
}

const RewardGeted = ({ award, wrapClassName, imageClassName, textClassName }: RewardItemProps) => {
  const t = useFm();
  const imageUrl = useMemo(() => getAwardImage(award), [award]);
  const awardDesc = useMemo(() => getAwardDesc(award, t), [award, t]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 md:gap-1 ${
        wrapClassName || ''
      }`}
    >
      <div className={`relative w-[68px] h-[68px] ${imageClassName || ''}`}>
        <ExportedImage
          src={`${basePath}/images/gift/${imageUrl}`}
          alt="reward"
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg=="
          sizes="68px"
        />
      </div>
      <span className={`font-medium text-[#FFAA82] text-[10px] md:text-base ${textClassName || ''}`}>
        {awardDesc}
      </span>
    </div>
  );
};

export default RewardGeted;
