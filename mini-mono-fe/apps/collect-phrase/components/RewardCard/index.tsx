import { FormattedMessage } from 'react-intl';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '~/env';
import { AwardType, CampaignStatus } from '~/enums';
import React, { useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { AwardItem } from '~/interface';

const AWARD_DESC_MAP: Partial<Record<AwardType, string>> = {
  [AwardType.ServiceCash]: 'redeemRewards.serviceCash',
  [AwardType.RealCash]: 'redeemRewards.realCash',
  [AwardType.PreGivenCash]: 'redeemRewards.postGivenCash',
  [AwardType.PostGivenCash]: 'redeemRewards.postGivenCash'
};

const PHYSICAL_AWARD_IMAGE_MAP: Record<string, string> = {
  RedeemGold: 'RedeemGold.png',
  RedeemKnapsack: 'bag.png',
  RedeemItems: 'box.png'
};

export const getAwardImage = (award?: AwardItem) => {
  if (award?.award_type === AwardType.PhysicalAward) {
    return PHYSICAL_AWARD_IMAGE_MAP[award.award_item_type] || 'ServiceCash.svg';
  }
  const typeMap: Partial<Record<AwardType, string>> = {
    [AwardType.ServiceCash]: 'ServiceCash.svg',
    [AwardType.RealCash]: 'RealCash.svg',
    [AwardType.PreGivenCash]: 'PostGivenCash.svg',
    [AwardType.PostGivenCash]: 'PostGivenCash.svg'
  };
  return (award?.award_type && typeMap[award.award_type]) || 'ServiceCash.svg';
};

interface RewardCardProps {
  award: AwardItem;
  status: CampaignStatus | string;
  onRedeem: (award: AwardItem) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ award, status, onRedeem }) => {
  const t = useFm();

  const imageUrl = useMemo(() => getAwardImage(award), [award]);

  const awardDesc = useMemo(() => {
    const key = award?.award_type ? AWARD_DESC_MAP[award.award_type] : null;
    return key ? t(key) : '';
  }, [award, t]);

  const tokenStr = useMemo(() => {
    if (award?.award_type === AwardType.PhysicalAward) {
      return award.award_item_type === 'RedeemGold'
        ? t('redeemRewards.redeemGold')
        : t('redeemRewards.default');
    }
    return `${award?.award_amount} ${award?.award_token}`;
  }, [award, t]);

  const { btnText, isDisabled } = useMemo(() => {
    const isEnded = status === CampaignStatus.Ended;
    const isNotStart = status === CampaignStatus.NotStarted
    const isClosed = !!award?.is_close;
    return {
      btnText: isClosed ? t('redeemed') : isEnded ? t('ended') : isNotStart? t('notStart') : t('redeem'),
      isDisabled: isClosed || isEnded || isNotStart
    };
  }, [award, t, status]);

  return (
    <div
      className="group border border-solid border-line-border-default bg-bg-secondary relative rounded-xl h-[200px] md:h-[250px] hover:border-line-border-hover transition-all duration-300 cursor-pointer">
      <div
        className="overflow-hidden absolute w-full h-full after:content-[''] after:absolute after:left-[25%] after:top-[-60px] after:w-[150px] after:h-[130px] after:bg-[#ABE127] after:blur-2xl after:opacity-0 after:z-5 group-hover:after:opacity-100" />

      <div
        className="absolute start-[50%] translate-x-[-55%] md:translate-x-[-50%] w-16 h-16 z-10 md:w-[86px] md:h-[86px] -top-8 md:top-[-50px]">
        <ExportedImage
          src={`${basePath}/images/gift/${imageUrl}`}
          alt="gift"
          fill
        />
      </div>

      <div className="relative z-6 flex-1 pb-9 px-4 md:px-9 mt-10 md:mt-[60px]">
        <div className="text-base md:text-lg font-bold text-text-primary line-clamp-3 text-center">
          {tokenStr}
        </div>
        <div className="md:mt-2 text-xs font-semibold text-text-secondary text-center">
          {awardDesc}
        </div>
      </div>

      <div className="absolute w-full px-4 z-11 -bottom-4.5 md:-bottom-4">
        <div className="text-xs text-text-primary text-center mb-5">
          <FormattedMessage
            id="costPoint"
            values={{
              point: <strong className="text-[22px] px-0.5">{award?.points_cost}</strong>
            }}
          />
        </div>
        <button
          type="button"
          disabled={isDisabled}
          className={`w-full h-8 md:h-10 text-xs md:text-sm font-medium rounded-xl transition-colors ${
            isDisabled
              ? 'bg-fill-button-tertiary-default text-text-primary'
              : 'bg-fill-button-primary-default hover:bg-fill-button-brand-default hover:text-black text-text-white-to-black cursor-pointer'
          }`}
          onClick={() => onRedeem(award)}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default RewardCard;
