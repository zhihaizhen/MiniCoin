import React, { ReactNode } from 'react';
import EarnTabs from '~/components/Common/EarnTabs';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { ReactComponent as RightIcon } from '~/public/images/right.svg';

interface EarnHeaderLayoutProps {
  title: string | ReactNode;
  subTitle: string | ReactNode;
  thirdTitle?: string | ReactNode;
  animationIntroSrc?: string;
  animationLoopSrc: string;
  valuationSection: ReactNode;
  actionButtons: ReactNode;
  headerStyle?: 'default' | 'second';
}

export const EarnHeaderLayout: React.FC<EarnHeaderLayoutProps> = ({
  title,
  subTitle,
  thirdTitle,
  animationIntroSrc,
  animationLoopSrc,
  valuationSection,
  actionButtons,
  headerStyle='default'
}) => {
  return (
    <div className="banner-theme-dark w-full bg-bg-primary pb-6 md:pb-[46px]">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center md:flex-row flex-col-reverse gap-4">
        <div className="w-full px-4 md:px-0">
          <EarnTabs />
          <div className="w-full flex flex-col md:flex-row items-center justify-start md:justify-between">
            <div className="w-full md:w-auto text-text-white text-left mt-10 md:mt-0">
              <h1 className="text-[28px] md:text-5xl font-bold md:font-semibold md:mb-6">
                {title}
              </h1>
              <div className="text-sm md:text-base text-text-secondary">{subTitle}</div>
              {headerStyle === 'second' && <div className="mt-6">{thirdTitle}</div>}
            </div>
            {headerStyle === 'second' ?
              <div className="min-w-[400px] flex flex-col justify-start items-center border border-line-divider-primary p-4 rounded-xl">
                {valuationSection}
                {actionButtons}
              </div>
              :
              <WebmAnimation
                className="hidden md:block w-60 md:w-[300px] h-60 md:h-[258px]"
                introSrc={animationIntroSrc}
                loopSrc={animationLoopSrc}
              />}

          </div>

          {
            headerStyle === 'default' &&
            <div className="w-full flex flex-col md:flex-row justify-between items-center md:border-t border-line-divider-primary md:pt-6 mt-12 md:mt-9">
              {valuationSection}
              {actionButtons}
            </div>
          }

        </div>
      </div>
    </div>
  );
};

interface AssetValuationItemProps {
  label: string | ReactNode;
  value: string | ReactNode;
  fiatValue?: string | ReactNode;
  loading?: boolean;
  extraLabelContent?: ReactNode;
  onRightClick?: () => void;
  showRightIcon?: boolean;
  warpClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  loadingClassName?: string;
}

export const AssetValuationItem: React.FC<AssetValuationItemProps> = ({
  label,
  value,
  fiatValue,
  loading,
  extraLabelContent,
  onRightClick,
  showRightIcon,
  warpClassName="",
  labelClassName = "",
  valueClassName = "",
  loadingClassName = ""
}) => {
  return (
    <div className={`w-full md:w-auto flex flex-col items-start gap-1 ${warpClassName}`}>
      <div className={`w-full text-text-secondary text-xs md:text-sm flex items-center justify-between md:justify-start ${labelClassName}`}>
        <div className="flex items-center gap-0.5">
          <span>{label}</span>
          {extraLabelContent}
        </div>
        {showRightIcon && (
          <div className="md:hidden" onClick={onRightClick}>
            <RightIcon />
          </div>
        )}
      </div>
      {
        loading ? <div className={`digital-skeletons ${loadingClassName}`} /> :
          <>
            <div className={`text-text-white text-2xl md:text-lg font-medium ${valueClassName}`}>
              {value}
            </div>
            <div className="min-h-5 text-sm text-text-secondary md:block hidden">
              {fiatValue}
            </div>
          </>
      }
    </div>
  );
};
