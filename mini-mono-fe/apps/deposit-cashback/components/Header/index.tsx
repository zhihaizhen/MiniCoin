import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { debounce, handleRegisterJumpWithReturnPage } from '~/utils';
import { basePath, goPage, isApp } from '@better-bit-fe/base-utils';
import { FormattedMessage } from 'react-intl';
import ExportedImage from 'next-image-export-optimizer';

const Header = ({ actTime, title, subTitle }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const handleJoin = debounce(() => {
    if (isLogin) return;
    const isAppPlatform = isApp();
    if (isAppPlatform) {
      goPage('login')
    } else {
      handleRegisterJumpWithReturnPage();
    }
  }, 500);

  return (
    <header className="h-unset md:h-[400px] max-w-[1200px] mx-auto flex justify-end md:justify-between items-center md:flex-row flex-col-reverse gap-3 pt-4 pb-14 md:pd-0">
      <div className="flex flex-col justify-center items-center md:items-start">
        {isLogin === undefined ? (
          <>
            <div className="flex flex-col justify-center items-center md:items-start">
              <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="h-12 w-72 bg-gray-700 rounded animate-pulse mb-8"></div>
              <div className="h-10 w-40 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            <div className="text-text-brand-default text-base md:text-xl font-semibold ">
              {subTitle ? subTitle : t('invited-user-cashback', '受邀用户充值返现')}
            </div>
            <div className="max-w-[930px] text-text-white leading-12 md:leading-[60px] text-[30px] md:text-[48px] font-semibold mt-4 text-center md:text-left [&>span]:text-text-brand-default px-2 md:px-0">
              <FormattedMessage
                id="none"
                defaultMessage={title}
                values={{
                  b: (chunks) => (
                    <div className="inline md:lang-zh-CN:block md:lang-zh-TW:block">
                      {chunks}
                    </div>
                  ),
                  i: (chunks) => (
                    <span className="text-text-brand-default">{chunks}</span>
                  )
                }}
              />
            </div>
            <div className="text-white text-sm font-medium mt-4">
              <span className="hidden md:inline">{t('rule-title-6-add')}</span>
              {actTime}
            </div>

            <div
              className={`flex justify-center items-center min-w-[280px] md:min-w-40 text-sm font-semibold mt-8 md:mt-10
                p-3 rounded-xl ${
                  isLogin
                    ? 'bg-fill-button-primary-disabled text-white cursor-not-allowed'
                    : 'bg-fill-button-primary-default text-text-white-to-black hover:opacity-90 cursor-pointer'
                }`}
              onClick={handleJoin}
            >
              {!isLogin ? t('sign-up', '立即报名') : t('logined')}
            </div>
          </>
        )}
      </div>
      <div className="relative w-[212px] h-[212px] md:w-[260px] md:h-[260px] flex justify-center items-center">
        <ExportedImage
          src={`${basePath}/images/banner.png`}
          fill
          alt={'headerBanner'}
        />
      </div>
    </header>
  );
};

export default Header;
