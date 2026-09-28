import { Modal } from 'antd';
import React from 'react';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';
import { basePath, isMobile } from '@better-bit-fe/base-utils';

interface RedeemDialogProps {
  open: boolean;
  close: () => void;
}

const AWARD_IMAGES = [2, 3, 4, 5, 1];
const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg==';

const RewardItem: React.FC<{ index: number }> = ({ index }) => (
  <div className="relative w-[88px] h-[110px] bg-linear-to-b from-[#FFDE9D] to-[#FFC961] rounded-lg overflow-hidden flex items-start justify-center">
      <div className="relative w-10 h-10 mt-4">
        <ExportedImage
          className="z-1"
          src={`${basePath}/images/lottery_char_${index}.png`}
          alt="char"
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      </div>

      <ExportedImage
        src={`${basePath}/images/lottery_char_bg_view.png`}
        alt="char-bg"
        fill
        loading="lazy"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
      />
  </div>
);

const RedeemDialog: React.FC<RedeemDialogProps> = ({ open, close }) => {
  const t = useFm();

  return (
    <Modal
      className={isMobile() ? 'composed-dialog' : ''}
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={530}
      footer={null}
    >
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-end">
          <div
            className="cursor-pointer border-none bg-transparent"
            onClick={close}
          >
            <CloseIcon />
          </div>
        </div>

        <div className="text-text-primary font-semibold text-xl text-center">
          🎉 {t('gladToRecieveGet')}
        </div>

        <div className="mt-10 flex items-center justify-center flex-wrap md:flex-nowrap gap-4">
          {AWARD_IMAGES.map((imgIndex) => (
            <RewardItem key={imgIndex} index={imgIndex} />
          ))}
        </div>

        <div
          className={`w-40 md:w-[216px] h-[50px] md:h-[76px] mt-10 relative text-center font-bold text-text-white cursor-pointer flex items-start justify-center pt-1 md:pt-2`}
          onClick={close}
        >
          <span className="text-base md:text-[22px] z-10">
            {t('viewNow', '立即查看')}
          </span>
          <ExportedImage
            className="z-0"
            src={`${basePath}/images/buttonBgMax.png`}
            alt="buttonBg"
            fill
          />
        </div>
      </div>
    </Modal>
  );
};

export default RedeemDialog;
