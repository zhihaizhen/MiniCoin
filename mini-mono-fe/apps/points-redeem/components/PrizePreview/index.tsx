import React, { useEffect, useState } from 'react';
import { AwardType } from '~/enums';
import RewardMarquee from '~/components/RewardMarquee';
import ExportedImage from 'next-image-export-optimizer';
import { basePath, isMobile } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { FormattedMessage } from 'react-intl';

const REWARD_LIST = [
  {
    type: AwardType.RolexDaytonaPanda,
    token: 'redeemRewards.RolexDaytonaPanda',
    image: 'RolexDaytonaPanda-pre.png',
    scale: 1
  },
  {
    type: AwardType.RolexSubDate,
    token: 'redeemRewards.RolexSubDate',
    image: 'RolexSubDate-pre.png',
    scale: 1
  },
  {
    type: AwardType.CartierBB42,
    token: 'redeemRewards.CartierBB42',
    image: 'CartierBB42-pre.png',
    scale: 1
  },
  {
    type: AwardType.AppleWatchUltra2,
    token: 'Apple Watch Ultra 2',
    image: 'AppleWatchUltra2-pre.png',
    scale: 1
  },
  {
    type: AwardType.AppleWatchSeries11,
    token: 'Apple Watch Series 11',
    image: 'AppleWatchSeries11-pre.png',
    scale: 1
  },
  {
    type: AwardType.HWWatchGT6Pro,
    token: 'HUAWEI WATCH GT 6 Pro',
    image: 'HWWatchGT6Pro-pre.png',
    scale: 1
  },
  {
    type: AwardType.RedeemSuitcase,
    token: 'redeemRewards.redeemSuitcase',
    image: 'group.png',
    scale: 1
  },
  {
    type: AwardType.RedeemItems,
    token: 'redeemRewards.redeemItems',
    image: 'chest.png',
    scale: 1
  },
  {
    type: AwardType.RedeemKnapsack,
    token: 'redeemRewards.redeemSuitcase',
    image: 'bag.png',
    scale: 1
  },
  {
    type: AwardType.PreGivenCash,
    token: '200 USDT',
    image: 'pre-cash.png',
    scale: 1
  },
  {
    type: AwardType.ServiceCash,
    token: '75 USDT',
    image: 'service-cash.png',
    scale: 0.9
  },
];

const getRewardLabel = (type: AwardType, token: string, t: (key: string) => string): string => {
  const prefix = type === AwardType.PreGivenCash
    ? t('redeemRewards.postGivenCash')
    : type === AwardType.ServiceCash
      ? t('redeemRewards.serviceCash')
      : '';

  return prefix ? `${prefix} ${token}` : t(token);
};
const PirzePreView: React.FC = () => {

  const t = useFm();
  const isMb = isMobile();
  const [prizeGap, setPrizeGap] = useState<number>(60);
  useEffect(() => {
    setPrizeGap(isMb ? 24 : 64);
  }, [isMb]);
  return (
    <div className="w-full px-4 md:px-0 mt-8 md:mt-10">
      <div className="w-full py-4 md:py-10 border border-line-divider-primary rounded-2xl">
        <div className="text-text-primary text-sm md:text-2xl font-bold leading-8 ml-4 md:ml-8">
          {t('prize-preview', '奖品预告')}
        </div>
        <div className="relative w-full mt-4 md:mt-6">

          <RewardMarquee speed={20} gap={prizeGap}>
            {REWARD_LIST.map((item, index) => (
              <div className="w-[72px] md:min-w-[88px] flex flex-col items-center justify-center gap-2 md:gap-3 overflow-hidden" key={`${item.token}-${item.type}`}>
                <div
                  className="relative w-[72px] h-14 md:w-16 md:h-16"
                  style={{ transform: `scale(${item.scale || 1})` }}
                >
                  <ExportedImage
                    className="rounded-full"
                    src={`${basePath}/images/gift/${item.image}`}
                    alt="reward"
                    fill
                    priority={index < 3}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiM2NjYiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg=="
                    sizes="(max-width: 768px) 56px, 64px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div
                  className="h-[65px] text-text-primary text-xs font-medium text-center">
                  <FormattedMessage
                    id="tokenformatpreview"
                    defaultMessage={getRewardLabel(item.type, item.token, t)}
                    values={{
                      i: (chunks: React.ReactNode) => <span className="text-text-brand-default-web">{chunks}</span>,
                    }}
                  />
                </div>
              </div>
            ))}
          </RewardMarquee>
        </div>
      </div>
    </div>
  );
};

export default PirzePreView;
