import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '@better-bit-fe/base-utils';
import CollectGather from '~/components/CollectGather';
import { useFm } from '@better-bit-fe/base-hooks';
import { CampaignDetail, RewardItem } from '~/interface';
import RewardGeted from '~/components/RewardGeted';
import { AwardType } from '~/enums';
import RewardMarquee from '~/components/RewardMarquee';
import React from 'react';

const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg==';

const REAL_CASH_AMOUNTS = ['88', '188', '288', '388', '588', '688', '888', '1,888', '2,026', '3,888', '5,888', '6,888', '8,888'];
// const CASH_AMOUNTS = [1, 3, 5, 10, 20, 50, 100, 1000, 2026, 8888];
// const PHYSICAL_ITEMS = [
//   { name: '行李箱', type: 'box' },
//   { name: '背包', type: 'bag' },
//   { name: '充电宝', type: 'powerbank' },
//   { name: '咖啡杯', type: 'cup' },
//   { name: '雨伞', type: 'umbrella' },
//   { name: '帽子', type: 'hat' },
//   { name: 'T恤', type: 'tshirt' }
// ];
const CHARACTER_CONFIGS = [
  { id: 2, size: 'small' },
  { id: 3, size: 'small' },
  { id: 4, size: 'large' },
  { id: 5, size: 'small' },
  { id: 1, size: 'small' }
] as const;

const createCashReward = (type: AwardType, amount: string): RewardItem => ({
  id: `${type.split('_')[0]}_${amount}`,
  award_type: type,
  award_amount: amount,
  award_token: 'USDT' as const
});

const REWARD_LIST: RewardItem[] = REAL_CASH_AMOUNTS.map((amount) =>
  createCashReward(AwardType.RealCash, amount)
);

interface RewardBoxProps {
  campaignDetail: CampaignDetail | undefined;
  userCollections: any;
  callback: () => void;
}

interface CharacterCardProps {
  charId: number;
  size: 'small' | 'large';
}

const CharacterCard = ({ charId, size }: CharacterCardProps) => {
  const isLarge = size === 'large';
  const containerClass = isLarge ? 'w-[180px] h-[234px]' : 'w-[120px] h-[154px]';
  const charClass = isLarge ? 'w-20 h-20 mt-9' : 'w-14 h-14 mt-5';

  return (
    <div className={`relative ${containerClass} flex items-start justify-center`}>
      <div className={`relative ${charClass}`}>
        <ExportedImage
          className="z-1"
          src={`${basePath}/images/lottery_char_${charId}.png`}
          alt="char"
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      </div>
      <ExportedImage
        src={`${basePath}/images/lottery_char_bg_view.png`}
        alt="char-bg"
        fill
        loading="lazy"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
      />
    </div>
  );
};

const RewardBox = ({ campaignDetail, userCollections, callback }: RewardBoxProps) => {
  const t = useFm();

  return (
    <>
      <div className="hidden md:block w-[1440px] h-[1228px] relative">
        <div className="w-full absolute top-[380px] z-10 flex items-center justify-center gap-5">
          {CHARACTER_CONFIGS.map((config) => (
            <CharacterCard key={config.id} charId={config.id} size={config.size} />
          ))}
        </div>
        <div className="w-full absolute bottom-[360px] z-10">
          <CollectGather
            campaignDetail={campaignDetail}
            userCollects={userCollections}
            callback={callback}
          />
        </div>
        <div className="w-[985px] absolute bottom-[130px] z-10 ml-[235px]">
          <RewardMarquee speed={20} gap={20}>
            {REWARD_LIST.map((item) => (
              <RewardGeted
                key={item.id}
                award={item}
                wrapClassName="mr-9 md:mr-10"
              />
            ))}
          </RewardMarquee>
        </div>
        <ExportedImage
          src={`${basePath}/images/boxBg.png`}
          alt="boxBg"
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          sizes="1440px"
        />
      </div>
      <div className="md:hidden flex flex-col items-start justify-start gap-6">
        <h1 className="text-text-primary text-2xl font-semibold">
          {t('reward')}
        </h1>
        <div className="relative w-full h-[130px] pt-6 px-1">
          <ExportedImage
            src={`${basePath}/images/boxBg-h5.png`}
            alt="boxBg"
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            sizes="100vw"
          />
          <RewardMarquee speed={20} gap={20}>
            {REWARD_LIST.map((item) => (
              <RewardGeted
                key={item.id}
                award={item}
                wrapClassName="mr-9 md:mr-10"
              />
            ))}
          </RewardMarquee>
        </div>
      </div>
    </>
  );
};

export default RewardBox;
