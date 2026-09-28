import React from 'react';
import { debounce, handleRegisterJumpWithReturnPage } from '~/utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { goPage, isApp } from '@better-bit-fe/base-utils';
import { FormattedMessage } from 'react-intl';


const FooterBanner = () => {
  const t = useFm();
  const handleJoin = debounce(() => {
    const isAppPlatform = isApp();
    if (isAppPlatform) {
      goPage('login');
    } else {
      handleRegisterJumpWithReturnPage();
    }
  }, 500);
  return (
    <div className="relative overflow-hidden w-full h-[280px] md:h-[360px] bg-[linear-gradient(180deg,#070808_6.5%,#587C00_141.83%)] flex flex-col justify-center items-center px-[40px] md:px-0">
      <div className="text-2xl md:text-[40px] text-white text-center font-bold [&>span]:text-text-brand-default">
        <FormattedMessage
          id="header-title3"
          values={{
            b: (chunks) => <div className="inline-block">{chunks}</div>,
            i: (chunks) => <span>{chunks}</span>
          }}
        />
      </div>
      <div
        className="flex justify-center items-center w-full md:w-auto min-w-[240px] text-text-black text-sm mt-10 bg-text-brand-default p-3 rounded-xl hover:opacity-90 cursor-pointer"
        onClick={handleJoin}
      >
        {t('sign-up', '立即报名')}
      </div>
      {/*<div className="hidden md:block absolute left-[-20px] top-0 w-[227px] h-[250px]">*/}
      {/*  <FooterBg />*/}
      {/*</div>*/}
      {/*<div className="hidden md:block absolute right-[-100px] top-0 w-[415px] h-[475px]">*/}
      {/*  <FooterBg className="w-full h-full" />*/}
      {/*</div>*/}
    </div>
  );
};
export default FooterBanner;
