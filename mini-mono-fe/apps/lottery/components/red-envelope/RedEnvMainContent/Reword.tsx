import { getLang, goPage } from '@better-bit-fe/base-utils';
import {ReactComponent as CloseIcon} from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { getRewardImageSrc } from '~/utils/reward';
import React from 'react';
import Image from 'next/image';
import { LotteryRecord } from '~/interface';

interface Iprop {
  reward: LotteryRecord | null
  close: () => void
}

const Reword = ({reward, close}: Iprop) => {
  const t = useFm()

  const onCheckLucky = () => {
    if (reward?.award_type === 'Coupons') {
      window.location.href = `/${getLang()}/rewards-hub/coupon-center`;
      return;
    }
    goPage('assetsHistory', 'tab=3')
  }

  return (
    <div className="relative w-full flex flex-col justify-center items-center">
      <div
        className="w-5 h-5 absolute right-0 top-0 cursor-pointer flex justify-center items-center"
        onClick={close}
      >
        <CloseIcon />
      </div>
      <div className="mt-5 text-lg md:text-xl font-semibold text-white">
        🎉 {t('congratulation-get')}
      </div>
      <div className={`relative w-[72px] md:w-[80px] h-[72px] md:h-[80px] flex justify-center items-center mt-6 rounded-full`}>
          <Image
            src={getRewardImageSrc(reward?.award_type, reward?.award_token || '', reward?.coupon_type)}
            alt=""
            fill
            loader={({src}) => src}
          />
      </div>
      <div className="text-[#ABE127] text-[20px] md:text-[32px] font-semibold mb-6 md:mb-8 mt-4">
        {+reward?.award_amount} {reward?.award_token}
      </div>
       {
         reward?.award_type === 'Coupons' &&
         <div className="text-sm text-text-secondary flex justify-start items-center gap-2">
           {t(`${reward.product_type || 'Coupons'}${reward.coupon_type}`)}
         </div>
      }

      <div className="w-full flex justify-center items-center p-3 bg-white rounded-xl md:min-w-[144px] h-12 text-[#101112] font-semibold text-sm hover:opacity-90 cursor-pointer mt-6"
        onClick={onCheckLucky}
      >
        {t('check-now')}
      </div>
    </div>
  )
}

export default Reword
