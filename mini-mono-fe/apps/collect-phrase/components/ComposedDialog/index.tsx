import { Modal } from 'antd';
import React, { useCallback } from 'react';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '@better-bit-fe/base-utils';
import RewardGeted from '~/components/RewardGeted';
import useRewardExchange from '~/hooks/useRewardExchange';

const TRANSITION_CLASSES = {
  hidden: 'opacity-0 scale-95 pointer-events-none',
  visible: 'opacity-100 scale-100',
  slideIn: 'opacity-100 translate-y-0',
  slideOut: 'opacity-0 translate-y-4 pointer-events-none'
};

interface RedeemDialogProps {
  callback: () => void;
  view: () => void;
  open: boolean;
  close: () => void;
}

const RedeemDialog: React.FC<RedeemDialogProps> = ({
                                                     open,
                                                     close,
                                                     callback,
                                                     view
                                                   }: RedeemDialogProps) => {
  const t = useFm();
  const { award, animationFinished } = useRewardExchange(open, callback, close);

  const handleViewReward = useCallback(() => {
    close();
    view();
  }, [close, view]);

  return (
    <Modal
      className="composed-dialog dialog-padding"
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={550}
      footer={null}
    >
      <div className="w-full">
        <div className="w-full flex items-center justify-end">
          {animationFinished && (
            <div className="cursor-pointer" onClick={close}>
              <CloseIcon />
            </div>
          )}
        </div>
        <div className="w-full md:w-[500px] md:h-[500px] flex flex-col items-center md:min-h-[400px] justify-center relative">
          <div
            className={`w-full flex justify-center transition-all duration-700 absolute inset-0 items-center ${
              animationFinished
                ? TRANSITION_CLASSES.hidden
                : TRANSITION_CLASSES.visible
            }`}
          >
            <div className="relative w-[400px] md:w-[500px] h-[380px] md:h-[500px]">
              <ExportedImage
                src={`${basePath}/images/composedAnimotion.webp`}
                alt={'composedBg'}
                fill
                priority
              />
            </div>
          </div>
          <div
            className={`relative w-full h-full flex flex-col items-center transition-all duration-700 delay-100 ${
              animationFinished
                ? TRANSITION_CLASSES.slideIn
                : TRANSITION_CLASSES.slideOut
            }`}
          >
            <div className="absolute inset-x-0 flex flex-col items-center justify-center pt-18 z-10">
              <h1 className="text-[#C01F1F] text-base md:text-xl font-semibold mb-6">
                🎉 {t('galadYouGet')}
              </h1>
              <RewardGeted
                award={award}
                imageClassName={
                  'w-[86px]! h-[88px]! md:w-[104px]! md:h-[104px]!'
                }
                textClassName={'text-lg! md:text-[22px]! text-[#FF9825]!'}
              />
              <div
                className={`relative w-40 md:w-[216px] h-18 md:h-22 mt-4 md:mt-15 text-center font-bold text-text-white cursor-pointer flex items-start justify-center pt-3 md:pt-3.5`}
                onClick={handleViewReward}
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
            <ExportedImage
              src={`${basePath}/images/composedBg.png`}
              alt={'composedBg'}
              width={500}
              height={500}
              priority
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RedeemDialog;
