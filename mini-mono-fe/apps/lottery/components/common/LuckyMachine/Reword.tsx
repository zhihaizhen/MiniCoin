import { getLang, getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as TimeIcon } from '~/public/images/time.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { formatTimestamp } from '~/utils';
import { getRewardImageSrc } from '~/utils/reward';
import React from 'react';
import Image from 'next/image';
import ExportedImage from 'next-image-export-optimizer';
import { RewordProps } from '~/interface';


interface Iprop {
  rewards: RewordProps[];
  close: () => void;
  isBlock?: boolean;
}

interface RewardViewProps {
  reward: RewordProps;
  isBlock?: boolean;
  t: (key: string) => string;
}

const RewardView = ({ reward, isBlock, t }: RewardViewProps) => {
  const { award_type, award_token, award_amount, award_ratio, symbol, side, margin_mode, cur_pz_leverage, close_pz_time, product_type, coupon_type } = reward;
  const isCurrency = award_type === 'VirtualCurrency';
  const isCoupon = award_type === 'Coupons';
  const displayText = isCurrency || isCoupon
    ? `+${+award_amount} ${award_token}`
    : `${award_ratio}% ${t('lucky-card')}`;

  return (
    <>
      <div className={`relative h-[80px] md:h-[80px] flex justify-center items-center mt-6 ${isCurrency ? 'w-[78px] md:w-[80px]' : 'w-[90px]'} rounded-full`}>
        <Image src={getRewardImageSrc(award_type, award_token, coupon_type)} alt="" fill loader={({ src }) => src} />
      </div>
      <div className="text-text-brand-default text-[20px] md:text-[32px] font-semibold mb-6 md:mb-8 mt-4">
        {displayText}
      </div>

      {
         <div className="text-sm text-text-secondary flex justify-start items-center gap-2">
           { !isCoupon ? <><TimeIcon /> {t('reward-tip')}</> : <>{t(`${product_type || 'Coupons'}${coupon_type}`)}</> }
         </div>
      }

      <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center gap-4 md:gap-0 py-4 px-4 w-full rounded-[16px] bg-bg-tertiary mt-4">
        <div className="flex justify-start items-center gap-2">
          <span className="text-white text-sm">{symbol}</span>
          <span className="flex justify-center items-center text-xs text-text-brand-default px-2 h-6 bg-[#2DB270]/10 rounded-2xl">
            {side === 'Buy' ? t('buy') : t('sell')}
          </span>
          {!isBlock && (
            <span className="flex justify-center items-center text-xs text-text-brand-default px-2 h-6 bg-[#2DB270]/10 rounded-2xl">
              {margin_mode ? t(margin_mode) : ''} {cur_pz_leverage}X
            </span>
          )}
        </div>
        <div className="md:hidden w-full flex justify-between items-center gap-2">
          <span className="text-text-secondary text-xs">{t('over-time')}</span>
          <span className="text-white text-xs">{formatTimestamp(+close_pz_time)}</span>
        </div>
        <span className="hidden md:block text-white text-xs">{formatTimestamp(+close_pz_time)}</span>
      </div>
    </>
  );
};

interface RewardListProps {
  rewards: RewordProps[];
  t: (key: string) => string;
}

const RewardList = ({ rewards, t }: RewardListProps) => (
  <div className="relative w-full flex flex-col justify-center items-center mt-6">
    <div className="w-full h-[32px] leading-8 flex justify-between items-center text-text-secondary text-xs md:text-sm border-b border-b-[#37393A]">
      <span>{t('reward')}</span>
      <span>{t('amount')}</span>
    </div>
    {rewards.map((item, index) => (
      <div key={index} className="w-full flex justify-between items-center h-11 text-sm">
        {item.award_type === 'VirtualCurrency' ? (
          <div className="flex justify-start items-center gap-2">
            <Image src={getSymbolUrl(item.award_token)} alt="" width={20} height={20} loader={({ src }) => src} />
            <span className="text-white">{item.award_token}</span>
          </div>
        ) : (
          <div className="flex justify-start items-center gap-2">
            <ExportedImage
              src={getRewardImageSrc(item.award_type, item.award_token, item.coupon_type)}
              alt="card"
              width={24}
              height={24}
            />
            <span className="text-white font-medium">{item.award_type === 'Coupons' ? t(`${item.product_type}${item.coupon_type}`) : `${item.award_ratio}% ${t('lucky-card')}`} </span>
          </div>
        )}
        <span className="text-text-brand-default">{`+${+item.award_amount} ${item.award_token}`} </span>
      </div>
    ))}
    <div className="text-sm text-text-secondary flex justify-start items-center gap-2 mt-4">
      <TimeIcon /> {t('reward-tip')}
    </div>
  </div>
);

const Reword = ({ rewards, close, isBlock }: Iprop) => {
  const t = useFm();

  // const onCheckLucky = () => {
  //   if (rewards.length === 1 && rewards[0]?.award_type === 'Coupons') {
  //     window.location.href = `/${getLang()}/rewards-hub/coupon-center`;
  //     return;
  //   }
  //   goPage('assetsHistory', 'tab=3');
  // };

  const isList = Array.isArray(rewards) && rewards.length > 1;

  return (
    <div className="relative w-full flex flex-col justify-center items-center">
      {/*<div className="w-5 h-5 absolute right-0 top-0 cursor-pointer flex justify-center items-center" onClick={close}>*/}
      {/*  <CloseIcon />*/}
      {/*</div>*/}
      {/*<div className="mt-5 text-lg md:text-xl font-semibold text-white">*/}
      {/*  🎉 {t('luckyYouGet')}*/}
      {/*</div>*/}
      {isList
        ? <RewardList rewards={rewards} t={t} />
        : <RewardView reward={rewards[0]} isBlock={isBlock} t={t} />
      }
      {/*<div*/}
      {/*  className="w-full flex justify-center items-center p-3 bg-text-brand-default rounded-full md:min-w-36 h-12 text-text-black hover:opacity-90 cursor-pointer mt-6 font-medium"*/}
      {/*  onClick={onCheckLucky}*/}
      {/*>*/}
      {/*  {t('check-now')}*/}
      {/*</div>*/}
    </div>
  );
};

export default Reword;
