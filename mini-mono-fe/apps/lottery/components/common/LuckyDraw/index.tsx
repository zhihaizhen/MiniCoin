import React, { memo } from 'react';
import { basePath, isMobile } from '@better-bit-fe/base-utils';
import { ACTIVE_STATUS, REGISTER_STATUS } from '~/enums';
import LotteryMarquee from '~/components/common/LotteryMarquee';
import { ReactComponent as LeftArrows } from '~/public/images/arrows-left.svg';
import { ReactComponent as RightArrows } from '~/public/images/arrows-right.svg';
import ExportedImage from 'next-image-export-optimizer';
import LuckyMachine from '~/components/common/LuckyMachine';
import { useFm } from '@better-bit-fe/base-hooks';

export interface IProps {
  actState: ACTIVE_STATUS;
  registerState: REGISTER_STATUS;
  luckyCount: number;
  loading: boolean;
  campaignNo: string;
  isBlock?: boolean;
  bigMarquee?: boolean;
  register: () => void;
  luckyEnd: () => void;
}

const IMG = (name: string) => `${basePath}/images/${name}.png`;

const SLOT_PRIZES = [
  { imgs: [{ width: '65%', top: '20%', src: IMG('btc') }] },
  { imgs: [{ width: '55%', top: '25%', src: IMG('PostGivenCash') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('eth') }] },
  { imgs: [{ width: '55%', top: '25%', src: IMG('ServiceCash') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('bnb') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('dog') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('pepe') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('shiba') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('sol') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('usdt') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('btc') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('dog') }] },
];

const BLOCK_PRIZES = [
  { imgs: [{ width: '65%', top: '20%', src: IMG('btc') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('eth') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('bnb') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('dog') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('pepe') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('shiba') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('sol') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('usdt') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('btc') }] },
  { imgs: [{ width: '65%', top: '20%', src: IMG('dog') }] },
];

const getBtnBg = (active: boolean, isMb: boolean) => {
  const name = active ? (isMb ? 'btn-active-h5' : 'btn-active') : (isMb ? 'btn-default-h5' : 'btn-default');
  return `url(${IMG(name)})`;
};

const LuckyDraw = ({ bigMarquee, ...props }: IProps) => {
  const t = useFm();
  const isMb = isMobile();

  return (
    <LuckyMachine
      {...props}
      className="relative w-full h-[300px] md:h-[770px] flex flex-col items-center justify-start pt-[80px] md:pt-[190px] pr-3"
      width={isMb ? '250px' : '850px'}
      height={isMb ? '80px' : '200px'}
      prizes={bigMarquee ? BLOCK_PRIZES : SLOT_PRIZES}
      renderButtons={(isPlaying, startPlay) => {
        const { registerState, actState, loading, register, luckyCount } = props;
        const showPlayButtons =
          registerState === REGISTER_STATUS.APPROVED &&
          actState === ACTIVE_STATUS.RUNING &&
          !loading;

        if (showPlayButtons) {
          return (
            <div className="flex justify-between items-center text-black text-xs md:text-[24px] h-[25px] md:h-12 mt-6 md:mt-[70px] font-semibold gap-4 md:gap-10">
              <div
                className={`min-w-[100px] min-h-[44px] md:min-w-[250px] md:min-h-[64px] flex items-center justify-center leading-6 cursor-pointer select-none text-nowrap ${isPlaying ? 'cursor-not-allowed' : ''} bg-contain bg-center bg-no-repeat`}
                style={{ backgroundImage: getBtnBg(!isPlaying && luckyCount > 0, isMb) }}
                onClick={() => !isPlaying && startPlay(1)}
              >
                {t('lottery-start')} x1
              </div>
              <div
                className={`min-w-[100px] min-h-[44px] md:min-w-[250px] md:min-h-[64px] flex items-center justify-center cursor-pointer select-none text-nowrap ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''} bg-contain bg-center bg-no-repeat`}
                style={{ backgroundImage: getBtnBg(!isPlaying && luckyCount >= 10, isMb) }}
                onClick={() => !isPlaying && startPlay(10)}
              >
                {t('lottery-start')} x10
              </div>
            </div>
          );
        }

        const getRegisterBtnLabel = () => {
          if (loading) return '';
          if (registerState === REGISTER_STATUS.UNKOWN) return t('lottery-register');
          if (actState === ACTIVE_STATUS.NOT_START) return t('register-no-time');
          return t('lottery-end');
        };

        return (
          <div className="flex items-center justify-center mt-3 md:mt-[60px] gap-6 md:gap-25">
            <div className="relative w-[60px] md:w-[157px] h-6 md:h-[76px]">
              <LeftArrows />
            </div>
            <div
              className="min-w-[100px] min-h-[44px] md:min-w-[250px] md:min-h-[64px] px-4 py-2 flex items-center justify-center text-text-black text-xs md:text-2xl font-semibold cursor-pointer select-none bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${IMG(actState !== ACTIVE_STATUS.RUNING ? 'btn-default' : 'btn-active')})` }}
              onClick={() => !loading && register()}
            >
              {getRegisterBtnLabel()}
            </div>
            <div className="relative w-[60px] md:w-[157px] h-6 md:h-[76px]">
              <RightArrows />
            </div>
          </div>
        );
      }}
      renderExtra={() => <LotteryMarquee big={bigMarquee} />}
      renderBackground={() => (
        <div className="absolute top-0 z-[-1] w-full md:w-[1360px] md:h-full flex justify-center items-center">
          <div className="hidden md:block relative w-full h-full">
            <ExportedImage src={IMG('big-slot-machine')} alt="Lottery" fill priority />
          </div>
          <div className="md:hidden relative w-full h-[300px]">
            <ExportedImage src={IMG('big-slot-machine-h5')} alt="Lottery" fill priority />
          </div>
        </div>
      )}
    />
  );
};

export default memo(LuckyDraw);
