import * as React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { getLang, basePath } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { partnerManagementUrl, partnerRegisterUrl, easicoinDomain } from '~/constants';


export function Banner() {
  const t = useFm();
  const { isLogin, userInfo } = useUserInfo();

  const handleClickGoPartner = () => {
    if (isLogin) {
      if (userInfo?.is_partner) {
        // Already a partner, redirecting to partner dashboard
        window.location.href = partnerManagementUrl;
      } else {
        window.open(partnerRegisterUrl, '_blank');
      }
    } else {
      const lang = getLang();
      const returnPageParam = window.btoa(`${location.origin}/${lang}/partner-program`)
      window.location.href = `${easicoinDomain}/${lang}/account/register?return_page=${returnPageParam}`;
    }
  };
  return (
    <div className='banner-theme-dark bg-bg-primary text-text-secondary' style={{
      '--banner-bg': `url('${basePath}/images/banner.png')`,
      '--banner-bg-mobile': `url('${basePath}/images/banner-h5.png')`
    } as React.CSSProperties}>
      <div
        className={'max-w-[1440px] bg-[image:var(--banner-bg-mobile)] mx-auto px-[16px] pt-[40px] pb-[318px] bg-[center_bottom] sm:bg-[image:var(--banner-bg)] sm:pt-[140px] sm:px-[120px] sm:pt-[100px] sm:pb-[80px] bg-no-repeat sm:bg-[right_120px_bottom] sm:bg-contain'}
      >
        <div className={'text-text-primary font-semibold text-[32px] text-center leading-[40px] sm:text-[48px] sm:text-left sm:leading-[64px]'}>{t('bannerTitle')}</div>
        <div className={'text-text-secondary w-full text-[20px] text-center pb-[24px] pt-[16px] leading-[24px] sm:w-[550px] sm:leading-[20px] sm:pb-[36px] sm:leading-[28px] sm:text-left'}>{t('bannerDescription')}</div>
        <button
          className={'flex h-[48px] py-[12px] px-[45px] mx-auto font-semibold leading-[24px] justify-center items-center gap-[10px] shrink-0 rounded-[12px] bg-[#FFF] text-[#101112] text-[16px] cursor-pointer sm:mx-0'}
          onClick={handleClickGoPartner}
        >
          {t('bannerButton')}
        </button>
      </div>
    </div>
  );
}
