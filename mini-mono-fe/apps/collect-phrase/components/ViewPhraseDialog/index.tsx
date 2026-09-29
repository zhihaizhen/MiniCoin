import { Modal } from 'antd';
import React from 'react';
import { ReactComponent as CloseSimIcon } from '~/public/images/closeSim.svg';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '~/env';
import { LotteryChar } from '~/components/CollectGather';

interface RedeemDialogProps {
  phrase: LotteryChar;
  open: boolean;
  close: () => void;
  callback: () => void;
}
const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg==';
const RedeemDialog: React.FC<RedeemDialogProps> = ({
  phrase,
  open,
  close,
  callback,
}: RedeemDialogProps) => {
  const t = useFm();

  const handleSend = () => {
    callback();
    close();
  };
  return (
    <Modal
      className="composed-dialog"
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={550}
      footer={null}
    >
      <div className="relative w-full md:w-[500px] md:h-[500px]">
        <div className="md:absolute top-0 w-full flex items-center justify-end z-10">
          <div className="cursor-pointer" onClick={close}>
            <CloseSimIcon className="md:hidden" />
            <CloseIcon className="hidden md:block" />
          </div>
        </div>
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="md:hidden text-lg text-text-primary font-semibold mb-6">
            {t('viewPhrase', '查看字卡')}
          </div>
          <div className="md:absolute top-4 w-full h-full flex flex-col justify-center items-center">
            <div className="relative w-[230px] md:w-40 h-[306px] md:h-[205px] flex items-start justify-center">
              <div className="relative w-22 md:w-14 h-22 md:h-14 mt-12 md:mt-9">
                <ExportedImage
                  className="z-1"
                  src={`${basePath}/images/${phrase?.charType}.png`}
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

            <div className="flex md:flex-col items-center flex-col-reverse mt-7 md:mt-0">
              <span className="text-text-white md:text-[#101112] text-sm md:my-3">
                {t('owned')}X{+phrase?.count}
              </span>
              <div
                className={`w-[140px] md:w-[90px] h-[60px] md:h-10 relative text-center font-bold text-text-white cursor-pointer flex items-start justify-center pt-1 md:pt-1.5 md:mt-2`}
                onClick={handleSend}
              >
                <span className="text-xl md:text-xs z-10">{t('send')}</span>
                <ExportedImage
                  className="z-0"
                  src={`${basePath}/images/buttonBg.png`}
                  alt="buttonBg"
                  fill
                />
              </div>
            </div>
          </div>

          <ExportedImage
            className="hidden md:block"
            src={`${basePath}/images/composedBg.png`}
            alt={'composedBg'}
            width={500}
            height={550}
            priority
          />
        </div>
      </div>
    </Modal>
  );
};

export default RedeemDialog;
