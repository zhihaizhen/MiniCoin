import React, { useEffect, useRef } from 'react';
import { ReactComponent as RefreshIcon } from '~/public/images/refresh.svg';
import { ReactComponent as SwitchIcon } from '~/public/images/switch.svg';
import { useCircleCountdown } from '~/hooks/useCycleCountdown';

interface RateDisplayProps {
  t: (key: string) => string;
  countdown: number;
  countdownCycle: number;
  maxCountdownCycles: number;
  curPriceRateStr: string;
  resetCycleNum: () => void;
  handleSwitchPrice: () => void;
  showRate: boolean;
}

/**
 * 汇率显示、倒计时圆圈及刷新逻辑
 * @param t
 * @param countdown
 * @param countdownCycle
 * @param maxCountdownCycles
 * @param curPriceRateStr
 * @param resetCycleNum
 * @param handleSwitchPrice
 * @param showRate
 * @constructor
 */
const RateDisplay: React.FC<RateDisplayProps> = ({
  t,
  countdown,
  countdownCycle,
  maxCountdownCycles,
  curPriceRateStr,
  resetCycleNum,
  handleSwitchPrice,
  showRate
}) => {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const { start, stop } = useCircleCountdown(progressCircle, maxCountdownCycles * 1000);

  useEffect(() => {
    if (countdown === 8) {
      start();
    }
  }, [countdown, start]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    <div className="w-full flex justify-between mt-3">
      <span className="flex justify-start items-center text-text-secondary text-sm ">
        <span className="text-nowrap"> {t('con-rate')}</span>
        {
          !!curPriceRateStr &&
          <div className="w-4 h-4 ml-1">
            {countdownCycle < maxCountdownCycles ? (
              <svg viewBox="0 0 48 48" ref={progressCircle} className="-rotate-90" style={{ '--progress': 0 } as React.CSSProperties}>
                <circle cx="24" cy="24" r="20" strokeWidth="4" stroke="#EBEBEB" fill="#FFFFFF" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  strokeWidth="4"
                  stroke="#101112"
                  fill="none"
                  strokeDasharray="125.6"
                  style={{
                    strokeDashoffset: 'calc(125.6px * (1 - var(--progress)))'
                  }}
                />
              </svg>
            ) : (
              <div className="cursor-pointer" onClick={resetCycleNum}>
                <RefreshIcon />
              </div>
            )}
          </div>
        }
      </span>
      <div className="flex items-center justify-end gap-1">
        <span className="text-text-primary text-sm font-medium">
          {curPriceRateStr}
        </span>
        <SwitchIcon className="cursor-pointer" onClick={handleSwitchPrice} />
      </div>
    </div>
  );
};

export default RateDisplay;
