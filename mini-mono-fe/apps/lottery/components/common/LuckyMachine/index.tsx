import React, { memo, ReactNode, useEffect, useMemo } from 'react';
import { SlotMachine } from '@lucky-canvas/react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { ACTIVE_STATUS, REGISTER_STATUS } from '~/enums';
import { useLuckyDraw } from '~/hooks/useLuckyDraw';
import Reword from './Reword';
import { useFm } from '@better-bit-fe/base-hooks';
import { ClaimModal } from '@better-bit-fe/base-ui';
import { basePath, getLang, goPage } from '@better-bit-fe/base-utils';


const STATIC_SLOTS = [
  { order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], direction: 1 },
  { order: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], direction: -1 },
  { order: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1], direction: 1 },
];

const DEFAULT_STYLE = {
  borderRadius: Infinity,
  background: 'transparent',
  fontSize: '32px',
  fontColor: '#333',
};

const DEFAULT_CONFIG = {
  rowSpacing: '20px',
  colSpacing: '0px',
};

export interface LuckyMachineProps {
  actState: ACTIVE_STATUS;
  registerState: REGISTER_STATUS;
  luckyCount: number;
  loading: boolean;
  campaignNo?: string;
  isBlock?: boolean;
  register: () => void;
  luckyEnd: () => void;
  // SlotMachine 配置
  prizes: any[];
  blocks?: any[];
  width?: string | number;
  height?: string | number;
  // 自定义渲染
  renderButtons?: (isPlaying: boolean, startPlay: (count: number) => void) => ReactNode;
  renderBackground?: () => ReactNode;
  renderExtra?: () => ReactNode;
  className?: string;
}

const LuckyMachine = ({
  actState,
  registerState,
  luckyCount,
  loading,
  campaignNo,
  isBlock,
  register,
  luckyEnd,
  prizes,
  blocks = [],
  width = '100%',
  height = '100%',
  renderButtons,
  renderBackground,
  renderExtra,
  className = "relative w-full flex flex-col items-center justify-start",
}: LuckyMachineProps) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const {
    slotRef,
    isPlaying,
    isOpenModal,
    rewards,
    startPlay,
    onAnimationEnd,
    closeModal,
  } = useLuckyDraw({ actState, luckyCount, campaignNo, luckyEnd });

  const getRegisterBtnLabel = () => {
    if (loading) return '';
    if (registerState === REGISTER_STATUS.UNKOWN) return t('lottery-register');
    if (actState === ACTIVE_STATUS.NOT_START) return t('register-no-time');
    return t('lottery-end');
  };

  const showPlayButtons =
    registerState === REGISTER_STATUS.APPROVED &&
    actState === ACTIVE_STATUS.RUNING &&
    isLogin &&
    !loading;

  const onCheckLucky = () => {
    if (rewards.length === 1 && rewards[0]?.award_type === 'Coupons') {
      window.location.href = `/${getLang()}/rewards-hub/coupon-center`;
      return;
    }
    goPage('assetsHistory', 'tab=3');
  };

  const defaultButtons = useMemo(() => {
    if (showPlayButtons) {
      return (
         <div className="flex justify-between items-center text-black text-xs md:text-[24px] h-[25px] md:h-12 mt-6 md:mt-[70px] font-semibold gap-4 md:gap-10">
          <div
            className={`min-w-[100px] md:min-w-[150px] text-center cursor-pointer select-none text-nowrap ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isPlaying && startPlay(1)}
          >
            {t('lottery-start')} x1
          </div>
          <div
            className={`min-w-[100px] md:min-w-[150px] text-center cursor-pointer select-none text-nowrap ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isPlaying && startPlay(10)}
          >
            {t('lottery-start')} x10
          </div>
        </div>
      );
    }
    return (
      <div
        className="text-text-black text-xs md:text-[28px] mt-18 md:mt-[145px] font-semibold cursor-pointer select-none"
        onClick={() => !loading && register()}
      >
        {getRegisterBtnLabel()}
      </div>
    );
  }, [showPlayButtons, getRegisterBtnLabel, isPlaying, t, startPlay, loading, register]);

  return (
    <div className={className}>
      <SlotMachine
        ref={slotRef}
        width={width}
        height={height}
        blocks={blocks}
        prizes={prizes}
        slots={STATIC_SLOTS}
        defaultStyle={DEFAULT_STYLE}
        defaultConfig={DEFAULT_CONFIG}
        onEnd={onAnimationEnd}
      />
      {renderButtons && renderButtons(isPlaying, startPlay) ? renderButtons(isPlaying, startPlay) : defaultButtons}
      {renderExtra?.()}
      {renderBackground?.()}

      <ClaimModal
        open={isOpenModal}
        title={`🎉 ${t('luckyYouGet')}`}
        confirmText={t('check-now')}
        onCancel={closeModal}
        onConfirm={onCheckLucky}
      >
         <Reword rewards={rewards} close={closeModal} isBlock={isBlock} />
      </ClaimModal>

    </div>
  );
};

export default memo(LuckyMachine);
