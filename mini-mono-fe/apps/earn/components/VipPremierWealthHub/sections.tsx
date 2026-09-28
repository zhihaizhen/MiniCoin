import React from 'react';
import { FormattedMessage } from 'react-intl';
import Image from 'next/image';
import ExportedImage from 'next-image-export-optimizer';
import { Rules, WebmAnimation } from '@better-bit-fe/base-ui';
import { basePath, getSymbolUrl } from '@better-bit-fe/base-utils';
import { ReactComponent as VipLogoIcon } from '~/public/images/vip/vip-logo.svg';
import { ReactComponent as ShareIcon } from '~/public/images/vip/share.svg';
import { ReactComponent as VipIcon } from '~/public/images/vip/vip.svg';
import { ReactComponent as ContactIcon } from '~/public/images/vip/contact.svg';
import { ReactComponent as HeaderTransitSvg } from '~/public/images/vip/header-transit.svg';
import ContactMethodDropdown from './ContactMethodDropdown';
import {
  BENEFIT_CARD,
  BENEFIT_TITLE,
  FOOTER_STYLE,
  GOLDEN_BTN,
  HERO_BG_CLASS,
  HERO_STYLE,
  PRODUCT_CARD_CLASS,
  PRODUCT_CARD_STYLE,
  PRODUCTS,
  TABLE_DATA,
  TABLE_HEADERS,
  VIP_BENEFITS,
  type ContactMethod
} from './constants';

type Translate = (id: string, defaultMessage?: string) => string;

interface ActionProps {
  t: Translate;
  onGoApply: () => void;
}

export const HeroSection: React.FC<ActionProps & { onShare: () => void }> = ({
  t,
  onGoApply,
  onShare
}) => (
  <div
    className={`${HERO_BG_CLASS} relative w-full h-[480px] md:h-[700px] flex flex-col justify-start items-center bg-contain`}
    style={HERO_STYLE}
  >
    <div className="px-4 md:px-[120px] absolute top-11 md:top-[156px] left-0 w-full h-full flex flex-col justify-start items-center gap-4 z-1">
      <div className="w-[137px] md:w-[235px]">
        <VipLogoIcon />
      </div>
      <h1 className="text-[32px] md:text-5xl font-semibold text-white text-center">
        {t('earn.wealth', '尊享财富管理')}
      </h1>
      <div className="text-white text-xs md:text-lg text-center">
        <FormattedMessage
          id="earn.wealth.description"
          values={{
            i: (chunks) => <span className="text-[#FFD583]">{chunks}</span>
          }}
        />
      </div>
      <div className="w-full flex md:flex-row flex-col items-center justify-center gap-4 mt-[264px] md:mt-0">
        <button
          className={`w-full md:w-auto md:min-w-[188px] h-12 ${GOLDEN_BTN}`}
          onClick={onGoApply}
        >
          {t('earn.wealth.apply', '立即申请成为VIP')}
        </button>
        <button
          className="hidden md:flex w-12 h-12 bg-[#FFD799] text-text-white-to-black text-base rounded-lg hover:bg-[#FFDFB0]! items-center justify-center cursor-pointer"
          onClick={onShare}
        >
          <ShareIcon />
        </button>
        <button
          className="md:hidden h-12 text-base text-white flex items-center justify-center cursor-pointer"
          onClick={onShare}
        >
          {t('share', '分享')}
        </button>
      </div>
    </div>
    <WebmAnimation
      className="block md:hidden w-full h-[480px]"
      loopSrc={`${basePath}/images/vip/header-h5.mp4`}
    />
    <WebmAnimation
      className="hidden md:block w-full h-[700px]"
      loopSrc={`${basePath}/images/vip/header.mp4`}
    />
    <div className="hidden md:block absolute bottom-0 left-0 w-full z-10">
      <HeaderTransitSvg />
    </div>
  </div>
);

export const BenefitsSection: React.FC<{ t: Translate; isMobile: boolean }> = ({
  t,
  isMobile
}) => (
  <section className="w-full mx-auto relative mt-36 md:mt-10">
    <h1 className="h-[52px] text-text-primary text-2xl font-bold flex items-center justify-center text-center">
      {t('vip.righttitle', 'VIP 尊享卓越权益')}
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-4">
      {VIP_BENEFITS.map(
        ({ title: [titleKey, titleDft], desc: [descKey, descDft] }) => (
          <div
            key={titleKey}
            className={BENEFIT_CARD}
            onMouseEnter={(event) => {
              if (!isMobile) {
                event.currentTarget.style.backgroundImage = `url(${basePath}/images/vip/card-bg.png)`;
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundImage = '';
            }}
          >
            <h3 className={BENEFIT_TITLE}>{t(titleKey, titleDft)}</h3>
            <p className="text-text-secondary text-xs">{t(descKey, descDft)}</p>
          </div>
        )
      )}
    </div>
  </section>
);

export const WealthManagementSection: React.FC<ActionProps> = ({
  t,
  onGoApply
}) => (
  <section className="mt-20">
    <div className="flex items-center justify-center md:justify-start gap-2">
      <h2 className="text-2xl font-bold">
        {t('vip.wealthmanage', '财富管理')}
      </h2>
      <VipIcon />
    </div>
    <div className="flex items-center justify-center md:justify-start text-text-secondary text-xs">
      {t('vip.wealthmanage.desc', '收益保底，长期稳健')}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      {PRODUCTS.map((item) => (
        <div
          key={`${item.title}-${item.coin}`}
          className={`${PRODUCT_CARD_CLASS} text-text-primary relative rounded-[20px] md:border border-line-border-default p-4 flex flex-col justify-start gap-8 md:gap-10 bg-contain`}
          style={PRODUCT_CARD_STYLE}
        >
          <div className="mb-4 flex items-center gap-2">
            <Image
              src={getSymbolUrl(item.coin)}
              alt={item.coin}
              width={32}
              height={32}
              loader={({ src }) => src}
            />
            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-sm md:text-base font-medium">
                  {t(item.title)}
                </h3>
                <VipIcon />
              </div>
              <p className="text-xs text-text-secondary md:text-text-primary">
                {t('saving-title')} ｜ {t('fixed')}
              </p>
            </div>
          </div>
          <div className="text-2xl md:text-[28px] font-bold">
            {item.rate}
            <span className="text-sm md:text-base ml-1 font-medium">APR</span>
          </div>
          <button
            className={`w-full md:min-w-[188px] ${GOLDEN_BTN}`}
            onClick={onGoApply}
          >
            {t('apply-now', '立即申购')}
          </button>
        </div>
      ))}
    </div>
  </section>
);

export const ExclusiveCustomizationSection: React.FC<{ t: Translate }> = ({
  t
}) => (
  <section className="mt-20">
    <header className="mb-8">
      <h2 className="text-2xl font-bold mb-2 tracking-wide">
        {t('vip.exclusive.customization', '专享定制')}
      </h2>
      <p className="text-text-secondary text-xs">
        {t(
          'vip.exclusive.customization.desc',
          'EasiCoin VIP 用户提供定制理财，助您财富增值，请联系我们了解更多详情'
        )}
      </p>
    </header>
    <div
      className="w-full overflow-x-auto"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="hidden md:table w-full border-collapse border border-line-divider-primary">
        <thead>
          <tr>
            {TABLE_HEADERS.map(([key, fallback]) => (
              <th
                key={key}
                className="text-left py-5 px-4 text-lg font-semibold border border-line-divider-primary"
                style={{ width: '33.33%' }}
              >
                {t(key, fallback)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_DATA.map((row) => (
            <tr key={row.product}>
              <td className="py-5 px-4 text-[#FFD583] font-medium text-lg border border-line-divider-primary">
                {t(row.product)}
              </td>
              <td className="py-5 px-4 text-gray-300 text-sm leading-relaxed border border-line-divider-primary">
                {t(row.content)}
              </td>
              <td className="py-5 px-4 text-gray-300 text-sm border border-line-divider-primary">
                {t(row.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden w-full py-3 px-4 border border-line-divider-primary rounded-xl">
        {TABLE_DATA.map((row, index) => (
          <div
            key={row.product}
            className="flex flex-col items-start justify-start gap-2"
          >
            <div className="text-[#FFD583] font-medium text-base">
              {t(row.product)}
            </div>
            <p className="text-sm text-text-secondary font-medium">
              • {t(row.content)}
            </p>
            <p className="text-sm text-text-secondary font-medium">
              • {t(row.currency)}
            </p>
            {index === 0 && (
              <div className="h-px w-full my-6 bg-line-divider-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const WealthHubBanner: React.FC<ActionProps> = ({ t, onGoApply }) => (
  <section className="w-full h-[473px] flex flex-col-reverse md:flex-row items-center justify-between mt-20">
    <div className="flex flex-col items-start justify-start gap-3">
      <h1 className="text-2xl md:text-[48px] font-bold">
        {t('vip.wealthHub.title', 'VIP 财富管理，享受专属服务')}
      </h1>
      <p className="text-base md:text-[20px] text-text-secondary">
        {t('vip.wealthHub.description', '资产量达到 500,000 USDT 可升级VIP')}
      </p>
      <button
        className={`w-full md:w-auto md:min-w-[188px] ${GOLDEN_BTN}`}
        onClick={onGoApply}
      >
        {t('earn.wealth.apply', '立即申请成为VIP')}
      </button>
    </div>
    <div className="relative w-[508px] h-full">
      <ExportedImage
        src={`${basePath}/images/vip/circle.png`}
        alt="circle"
        fill
        loading="lazy"
        sizes="508"
        style={{ objectFit: 'contain' }}
      />
    </div>
  </section>
);

interface ApplySectionProps {
  applyRef: React.RefObject<HTMLElement>;
  contactMethod: ContactMethod;
  contactValue: string;
  isValid: boolean;
  onApply: () => void;
  onContactMethodChange: (value: ContactMethod) => void;
  onContactValueChange: (value: string) => void;
  onOpenDemo: () => void;
  onOpenCustomerService: () => void;
  t: Translate;
  userId?: string | number;
}

export const ApplySection: React.FC<ApplySectionProps> = ({
  applyRef,
  contactMethod,
  contactValue,
  isValid,
  onApply,
  onContactMethodChange,
  onContactValueChange,
  onOpenDemo,
  onOpenCustomerService,
  t,
  userId
}) => (
  <section ref={applyRef} className="mt-20 text-center">
    <h1 className="text-2xl md:text-[40px] font-bold">
      {t('vip.apply.experience', '立即申请 VIP 体验')}
    </h1>
    <div className="flex flex-col md:flex-row items-center justify-between mt-[56px]">
      <div className="w-full md:w-auto md:min-h-[292px] flex flex-col items-start justify-between">
        <div className="flex flex-col items-start justify-start gap-4">
          <div className="text-[20px] font-bold">
            {t('vip.whocanapply', '谁可以申请？')}
          </div>
          <p className="text-sm text-text-secondary font-medium text-left">
            • {t('vip.apply-who-1', 'EasiCoin 交易所内资产量达到')}
          </p>
          <p className="text-sm text-text-secondary font-medium text-left">
            •{' '}
            {t(
              'vip.apply-who-2',
              '500,000 USDT 可升级EasiCoin VIP 标准的用户。'
            )}
          </p>
        </div>
        <div className="hidden md:block">
          <div className="text-[20px] font-bold mb-6 text-left">
            {t('earn.wealth.apply')}
          </div>
          <div
            className="flex items-center justify-center gap-2 text-sm text-text-secondary font-medium bg-fill-button-tertiary-default hover:bg-fill-button-tertiary-hover active:opacity-80 rounded-lg min-w-[169px] h-[48px] cursor-pointer [-webkit-tap-highlight-color:transparent]"
            onClick={onOpenCustomerService}
          >
            <div className="w-6 h-6">
              <ContactIcon />
            </div>
            {t('vip.contact', '联系客服')}
          </div>
        </div>
      </div>
      <div className="w-full md:w-[592px] min-h-[292px] flex flex-col items-start justify-start gap-6 mt-6 md:mt-0">
        <div className="hidden md:block text-[20px] font-bold">
          {t('vip.applymethod', '申请方式')}
        </div>
        {userId && (
          <div className="flex flex-col items-start justify-start gap-2 w-full">
            <p className="text-sm font-medium">EasiCoin UID</p>
            <div className="bg-fill-input rounded-lg h-[40px] w-full flex items-center justify-start px-3">
              {userId}
            </div>
          </div>
        )}

        <div className="flex flex-col items-start justify-start gap-2 w-full">
          <div className="text-sm font-medium">
            {t('vip.contactmethod', '联系方式')}
            <span
              className="text-xs text-text-secondary font-normal ml-2 cursor-pointer underline decoration-dashed decoration-gray-600 underline-offset-4"
              onClick={onOpenDemo}
            >
              {t('vip.viewexample', '查看示例')}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-start gap-2 w-full">
            <ContactMethodDropdown
              value={contactMethod}
              onChange={onContactMethodChange}
            />
            <input
              type="text"
              value={contactValue}
              onChange={(event) => onContactValueChange(event.target.value.trim())}
              placeholder={t('vip.contact.placeholder', '请输入联系方式')}
              className="w-full md:w-auto md:flex-1 h-10 bg-fill-input rounded-lg px-3 outline-none text-sm! placeholder:text-text-tertiary placeholder:text-sm"
              style={{ fontSize: '16px' }}
            />
          </div>
          {isValid && !contactValue && (
            <span className="text-text-red text-sm md:pl-[170px]">
              {t('vip.contact.placeholder', '请输入联系方式')}
            </span>
          )}
        </div>
        <div
          className="w-full h-10 text-sm bg-fill-button-tertiary-default hover:bg-fill-button-tertiary-hover active:opacity-80 flex items-center justify-center rounded-lg cursor-pointer [-webkit-tap-highlight-color:transparent]"
          onClick={onApply}
        >
          {t('vip.submit', '提交')}
        </div>
      </div>
    </div>
  </section>
);

export const FaqSection: React.FC<{
  faqList: Parameters<typeof Rules>[0]['customRules'];
  t: Translate;
}> = ({ faqList, t }) => (
  <section className="mt-[109px]">
    <Rules
      className="w-full md:max-w-[1200px] mx-auto mb-14 md:mb-[120px] px-4 md:px-0"
      headTitle={t('fqa')}
      headTitleClassName="text-center text-2xl md:text-[40px]"
      customRules={faqList}
      type="collapse"
      showOrder={false}
    />
  </section>
);

export const FooterCta: React.FC<{
  t: Translate;
  onViewAssets: () => void;
}> = ({ t, onViewAssets }) => (
  <section
    className="relative overflow-hidden w-full h-[280px] md:h-[360px] flex flex-col justify-center items-center px-[40px] md:px-0"
    style={FOOTER_STYLE}
  >
    <div className="text-2xl md:text-[40px] text-white text-center font-bold [&>span]:text-text-brand-default">
      <FormattedMessage
        id="vip.footer.title"
        values={{
          b: (chunks) => <div className="inline-block">{chunks}</div>,
          i: (chunks) => <span>{chunks}</span>
        }}
      />
    </div>
    <div
      className="h-10 flex justify-center items-center w-full md:w-auto min-w-[188px] text-text-black text-sm mt-10 bg-[#FFD799] py-3 px-10 rounded-lg hover:opacity-90 active:opacity-80 cursor-pointer [-webkit-tap-highlight-color:transparent]"
      onClick={onViewAssets}
    >
      {t('vip.view.assets', '查看储备金证明')}
    </div>
  </section>
);
