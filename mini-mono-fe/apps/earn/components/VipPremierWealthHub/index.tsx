import React, { useMemo, useRef, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import {
  getLang, goPage,
  isApp,
  isMobile as isMobileDevice
} from '@better-bit-fe/base-utils';
import EarnTabs from '~/components/Common/EarnTabs';
import Share from '~/components/VipPremierWealthHub/share';
import ContactDemo from '~/components/VipPremierWealthHub/contactDemo';
import useVipApply from '~/hooks/useVipApply';
import { FAQ_KEYS } from './constants';
import {
  ApplySection,
  BenefitsSection,
  ExclusiveCustomizationSection,
  FaqSection,
  FooterCta,
  HeroSection,
  WealthHubBanner,
  WealthManagementSection
} from './sections';

const VipPremierWealthHub: React.FC = () => {
  const t = useFm();
  const isMobile = isMobileDevice();
  const { userInfo, isLogin } = useUserInfo();
  const [openShare, setOpenShare] = useState(false);
  const [openDemo, setOpenDemo] = useState(false);
  const applyRef = useRef<HTMLElement>(null);
  const {
    contactMethod,
    setContactMethod,
    contactValue,
    setContactValue,
    onApply,
    isValid
  } = useVipApply();

  const faqList = useMemo(
    () =>
      FAQ_KEYS.map((item, index) => ({
        ruleTitle: t(item.title),
        ruleOrder: index + 1,
        contents: item.contents.map((content, contentIndex) => ({
          content: t(content),
          contentOrder: contentIndex + 1
        }))
      })),
    [t]
  );

  const onGoApply = () => {
    const el = applyRef.current;
    if (!el) return;

    if ('scrollBehavior' in document.documentElement.style) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    el.scrollIntoView();
  };

  const onViewAssets = () =>
    window.open(`/${getLang()}/proofOfReserves`, '_blank');

  const openCustomerService = () => {
    if (!isLogin) return;

    setTimeout(() => {
      const ud = (window as Window & { ud?: (action: string) => void }).ud;

      if (ud) {
        ud('showPanel');
        return;
      }

      (document.querySelector('#brandChat') as HTMLElement)?.click();
    }, 500);
  };
  const onShare = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    setOpenShare(true);
  }
  return (
    <div className="max-w-[1440px] w-full mx-auto">
      {!isApp() && (
        <div className="px-4 md:px-[120px]">
          <EarnTabs />
        </div>
      )}

      <HeroSection
        t={t}
        onGoApply={onGoApply}
        onShare={onShare}
      />

      <div className="px-4 md:px-[120px] text-text-primary">
        <BenefitsSection t={t} isMobile={isMobile} />
        <WealthManagementSection t={t} onGoApply={onGoApply} />
        <ExclusiveCustomizationSection t={t} />
        <WealthHubBanner t={t} onGoApply={onGoApply} />
        <ApplySection
          applyRef={applyRef}
          contactMethod={contactMethod}
          contactValue={contactValue}
          isValid={isValid}
          onApply={onApply}
          onContactMethodChange={setContactMethod}
          onContactValueChange={setContactValue}
          onOpenCustomerService={openCustomerService}
          onOpenDemo={() => setOpenDemo(true)}
          t={t}
          userId={userInfo?.id}
        />
        <FaqSection faqList={faqList} t={t} />
      </div>

      <FooterCta t={t} onViewAssets={onViewAssets} />
      <Share modalOpen={openShare} onClose={() => setOpenShare(false)} />
      <ContactDemo modalOpen={openDemo} onClose={() => setOpenDemo(false)} />
    </div>
  );
};

export default VipPremierWealthHub;
