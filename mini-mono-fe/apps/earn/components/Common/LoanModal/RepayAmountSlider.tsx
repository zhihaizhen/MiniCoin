import React, { ChangeEvent, useMemo } from 'react';
import BigNumber from 'bignumber.js';

interface RepayAmountSliderProps {
  value: string;
  availableAmount: BigNumber;
  precision: number;
  ariaLabel: string;
  onChange: (value: string) => void;
}

const SLIDER_MARKS = [0, 25, 50, 75, 100];

const RepayAmountSlider: React.FC<RepayAmountSliderProps> = ({
  value,
  availableAmount,
  precision,
  ariaLabel,
  onChange
}) => {
  const sliderPercent = useMemo(() => {
    if (!value || !availableAmount.gt(0)) return 0;

    const amount = new BigNumber(value);
    if (!amount.isFinite() || amount.isNaN() || !amount.gt(0)) return 0;

    return BigNumber.minimum(
      100,
      BigNumber.maximum(0, amount.div(availableAmount).times(100))
    ).toNumber();
  }, [availableAmount, value]);

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const percent = new BigNumber(e.target.value || 0);
    const amount = availableAmount
      .times(percent)
      .div(100)
      .decimalPlaces(precision, BigNumber.ROUND_DOWN);

    onChange(amount.toFixed());
  };

  return (
    <div className="relative w-full h-6 mt-2">
      <div className="absolute left-1 right-1 top-[10px] h-px bg-[#A8AAAD]" />
      {SLIDER_MARKS.map((mark) => (
        <div
          key={mark}
          className="absolute top-[7px] w-1.5 h-1.5 rounded-[1px] bg-[#A8AAAD]"
          style={{
            left: `calc(4px + (100% - 8px) * ${mark / 100})`,
            transform: 'translateX(-50%) rotate(45deg)'
          }}
        />
      ))}
      <div
        className="absolute top-[7px] w-2 h-2 rounded-[1px] bg-[#101112]"
        style={{
          left: `calc(4px + (100% - 8px) * ${sliderPercent / 100})`,
          transform: 'translateX(-50%) rotate(45deg)'
        }}
      />
      <input
        className="absolute inset-x-0 top-0 h-6 w-full cursor-pointer opacity-0"
        type="range"
        min={0}
        max={100}
        step={1}
        value={sliderPercent}
        disabled={!availableAmount.gt(0)}
        onChange={handleSliderChange}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default RepayAmountSlider;
