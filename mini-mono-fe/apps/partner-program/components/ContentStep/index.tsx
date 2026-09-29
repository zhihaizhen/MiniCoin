import * as React from 'react';
import Image from 'next/image';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isMobile, isApp } from '@better-bit-fe/base-utils';
import { partnerManagementUrl, partnerRegisterUrl, easicoinDomain } from '~/constants';


export function ContentStep() {
  const t = useFm();
  const isMb = isMobile();

  const { isLogin, userInfo } = useUserInfo();

  const descSteps = [
    {
      title: t('ContentStepTitle1'),
      description: t('ContentStepDesc1'),
      icon: `${basePath}/images/icon-step-1.svg`
    },
    {
      title: t('ContentStepTitle2'),
      description: t('ContentStepDesc2'),
      icon: `${basePath}/images/icon-step-2.svg`
    },
    {
      title: t('ContentStepTitle3'),
      description: t('ContentStepDesc3'),
      icon: `${basePath}/images/icon-step-3.svg`
    },
  ];

  const benefitItems = [
    {
      title: t('ContentStepBenefitTitle1'),
      description: t('ContentStepBenefitDesc1'),
    },
    {
      title: t('ContentStepBenefitTitle2'),
      description: t('ContentStepBenefitDesc2'),
    },
    {
      title: t('ContentStepBenefitTitle3'),
      description: t('ContentStepBenefitDesc3'),
    },
    {
      title: t('ContentStepBenefitTitle4'),
      description: t('ContentStepBenefitDesc4'),
    },
  ]

  const handleJoinNow = () => {
    if (isLogin) {
      console.log('userInfo', userInfo);
      if (userInfo?.is_partner) {
        // Already a partner, redirecting to partner dashboard
        window.location.href = partnerManagementUrl;
      } else {
        // Not a partner, redirecting to partner register page - google form
        window.open(partnerRegisterUrl, '_blank');
      }
    } else {
      const lang = getLang();
      const returnPageParam = window.btoa(`${location.origin}/${lang}/partner-program`)
      window.location.href = `${easicoinDomain}/${lang}/account/register?return_page=${returnPageParam}`;
    }
  };
  return (
    <div>
      <section className="max-w-[1440px] flex flex-col items-start mx-auto px-[16px] gap-[24px] sm:px-[120px] sm:gap-[32px]">
        {/* Heading Area */}
        <div className="flex flex-col items-start mt-[40px] w-full sm:mt-[80px]">
          <div className="flex flex-col items-start w-full text-[24px] leading-[32px] font-semibold mb-[16px] sm:mb-[0] sm:text-[32px] sm:font-bold sm:leading-[47px] text-[#101112] flex items-center">
            {t('contentTitle')}
          </div>
          <div className="flex flex-col items-start w-full h-[26px]">
            <p className="text-[14px] font-[400] leading-[24px] sm:text-[18px] sm:leading-[26px] text-text-secondary flex items-center">
              {t('contentDescription')}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className=" flex flex-col sm:flex-row items-start justify-between w-full sm:shadow-[0px_0px_24px_#F0F2FA] rounded-[10px] bg-white sm:p-[10px] gap-[24px] sm:gap-[0px]">
          {
            descSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-start sm:items-center justify-center sm:w-[33.3%] p-[24px_16px] shadow-[0px_0px_24px_#F0F2FA] sm:shadow-[0]">
                <Image
                  src={step.icon}
                  alt={`Step ${index + 1}`}
                  width={48}
                  height={48}
                />
                <div className="flex flex-col items-center mt-[16px] sm:mt-[24px] text-[20px] font-semibold leading-[28px] text-center text-text-primary flex items-center">
                  {step.title}
                </div>
                <p className="flex flex-col items-center mt-[16px] text-[14px] leading-[19px] text-text-secondary text-left sm:text-center">
                  {step.description}
                </p>
              </div>
            ))
          }
        </div>

        {/* Benefits Section */}
        <div className='flex flex-col sm:flex-row justify-between w-full mt-[40px] sm:mt-[86px] mb-[80px] sm:p-[40px] shadow-[0] sm:shadow-[0px_0px_24px_#F0F2FA] rounded-[10px] bg-white'>
          <div className='sm:w-[50%] flex flex-col items-start'>
            {isMb && <img
              src={`${basePath}/images/icon-benefit.svg`}
              className='w-[260px] h-[210px] self-center mb-[36px]'
              alt="Benefit Icon"
            />}
            <div className='text-[24px] sm:text-[32px] font-semibold sm:font-bold leading-[32px] sm:leading-[46px] text-[#101112]'>
              {t('benefitTitle')}
            </div>
            <div className='text-[14px] leading-[24px] sm:text-[18px] sm:leading-[26px] text-text-secondary m-[16px_0_24px] sm:m-[20px_0]'>
              {t('benefitDesc')}
            </div>
            {!isMb && <img
              src={`${basePath}/images/icon-benefit.svg`}
              className='w-[260px] h-[210px]'
              alt="Benefit Icon"
            />}
          </div>
          <div className='sm:w-[50%] flex flex-col items-start px-[24px] sm:pl-[50px] sm:pr-[0] sm:gap-[0] sm:shadow-[0] shadow-[0px_0px_24px_#F0F2FA] divide-y divide-[#F5F5F5] sm:divide-y-0 rounded-[16px] sm:rounded-[0]'>
            {
              benefitItems.map((item, index) => (
                <div key={index} className='flex items-start justify-center sm:mt-[50px] p-[24px_0] sm:p-[0]'>
                  <span className='w-[10px] h-[10px] rounded-full border-[2px] border-line-border-hover mr-[8px] sm:mr-[20px] mt-[8px] flex-shrink-0'></span>
                  <div className='flex flex-col'>
                    <div className='text-[18px] leading-[26px] sm:text-[20px] font-semibold sm:font-bold sm:leading-[29px] text-text-primary mb-[8px]'>{item.title}</div>
                    <p className='text-[14px] leading-[24px] sm:leading-[19px] text-text-secondary'>{item.description}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div >
      </section >

      {/* Call to Action Section */}
      <div className='banner-theme-dark bg-bg-primary w-full p-[56px_16px] sm:p-[72px_120px]' >
        <div className='max-w-[1440px] mx-auto flex flex-col items-center justify-center w-full'>
          <div className='text-[32px] font-bold leading-[40px] sm:leading-[47px] text-[#F2F3FA] text-center sm:text-left'>{t('signUpTitle')}</div>
          <p className='text-[20px] leading-[24px] text-text-secondary font-[300] mt-[16px] mb-[32px] sm:mb-[40px] text-center sm:text-left'>{t('signUpDesc')}</p>
          {
            isLogin && userInfo?.is_partner ? null : (
              <button className='min-w-[240px] p-[12px] bg-fill-button-primary-default text-text-white-to-black rounded-[12px] cursor-pointer font-[700]' onClick={handleJoinNow} >
                {isLogin ? t('joinNowBtn') : t('signUpAction')}
              </button>
            )}
        </div>
      </div >

    </div >
  );
}
