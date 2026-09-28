import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { ReactComponent as HoldIcon } from '~/public/images/loan/hold-circle.svg';

type RateValue = number | string | undefined | null;

interface LtvRiskSliderLabels {
  lowRate?: string;
  warningRate?: string;
  liquidationRate?: string;
  lowRisk?: string;
  mediumRisk?: string;
  highRisk?: string;
}

interface LtvRiskSliderProps {
  value?: RateValue;
  defaultValue?: RateValue;
  rates: [RateValue, RateValue, RateValue];
  onChange?: (value: number) => void;
  step?: number;
  disabled?: boolean;
  labels?: LtvRiskSliderLabels;
}

const SEGMENT_WIDTH = 100 / 3;
const MIN_LTV_VALUE = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toPercentValue = (value: RateValue, fallback = 0): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;

  return num <= 1 ? num * 100 : num;
};

const toSliderValue = (value: RateValue, fallback = 0): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;

  return num;
};

const formatPercent = (value: number): string =>
  `${Number(value.toFixed(8)).toString()}%`;

const LtvRiskSlider: React.FC<LtvRiskSliderProps> = ({
  value,
  defaultValue,
  rates,
  onChange,
  step = 1,
  disabled = false,
  labels
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(() =>
    toSliderValue(defaultValue, MIN_LTV_VALUE)
  );
  const [dragging, setDragging] = useState(false);

  const lowMax = useMemo(() => toPercentValue(rates[0], 80), [rates]);
  const warningRate = useMemo(() => toPercentValue(rates[1], 88), [rates]);
  const liquidationRate = useMemo(() => toPercentValue(rates[2], 95), [rates]);
  const safeValue = clamp(
    toSliderValue(isControlled ? value : innerValue),
    MIN_LTV_VALUE,
    lowMax
  );
  const handlePercent = lowMax > 0 ? (safeValue / lowMax) * SEGMENT_WIDTH : 0;
  const decimals = (step.toString().split('.')[1] || '').length;
  const bubbleTransform =
    handlePercent < 7 ? 'translateX(0)' : 'translateX(-50%)';

  useEffect(() => {
    if (!isControlled) {
      setInnerValue(toSliderValue(defaultValue, MIN_LTV_VALUE));
    }
  }, [defaultValue, isControlled]);

  const updateValue = useCallback(
    (nextValue: number) => {
      const next = Number(
        clamp(nextValue, MIN_LTV_VALUE, lowMax).toFixed(decimals)
      );
      if (!isControlled) {
        setInnerValue(next);
      }
      onChange?.(next);
    },
    [decimals, isControlled, lowMax, onChange]
  );

  const commit = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || lowMax <= 0) return;

      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = ratio * lowMax;
      const steppedValue = Math.round(rawValue / step) * step;
      updateValue(steppedValue);
    },
    [lowMax, step, updateValue]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    commit(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || disabled) return;

    commit(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      updateValue(safeValue - step);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      updateValue(safeValue + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      updateValue(MIN_LTV_VALUE);
    } else if (e.key === 'End') {
      e.preventDefault();
      updateValue(lowMax);
    }
  };

  const segments = [
    {
      value: lowMax,
      rateLabel: labels?.lowRate || '最大初始质押率',
      riskLabel: labels?.lowRisk || '低风险',
      textColor: '#72CC29',
      gradient:
        'linear-gradient(180deg, rgba(114, 204, 41, 0.00) 0%, rgba(114, 204, 41, 0.24) 100%)',
      borderColor: '#72CC29'
    },
    {
      value: warningRate,
      rateLabel: labels?.warningRate || '预警质押率',
      riskLabel: labels?.mediumRisk || '中风险',
      textColor: '#F1C409',
      gradient:
        'linear-gradient(180deg, rgba(241, 196, 9, 0) 0%, rgba(241, 196, 9, 0.24) 100%)',
      borderColor: '#F1C409'
    },
    {
      value: liquidationRate,
      rateLabel: labels?.liquidationRate || '强平质押率',
      riskLabel: labels?.highRisk || '高风险',
      textColor: '#FA465B',
      gradient:
        'linear-gradient(180deg, rgba(250, 70, 91, 0.00) 0%, rgba(250, 70, 91, 0.24) 100%)',
      borderColor: '#FA465B'
    }
  ];

  return (
    <div
      className={`relative w-full h-[150px] select-none touch-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="grid grid-cols-3 h-[94px]">
        {segments.map((segment, index) => (
          <div
            key={segment.riskLabel}
            className={`relative flex flex-col items-end pr-3 text-center border-r`}
            style={{
              background: segment.gradient,
              borderColor: segment.borderColor
            }}
          >
            <div
              className="text-sm font-medium"
              style={{ color: segment.textColor }}
            >
              {formatPercent(segment.value)}
            </div>
            <div className="mt-3 text-sm text-text-primary">
              {segment.rateLabel}
            </div>
            <div
              className="mt-3 text-sm font-medium"
              style={{ color: segment.textColor }}
            >
              {segment.riskLabel}
            </div>
            <div
              className="absolute left-0 right-0 bottom-0 h-[3px]"
              style={{ backgroundColor: segment.borderColor }}
            />
          </div>
        ))}
      </div>

      {[SEGMENT_WIDTH, SEGMENT_WIDTH * 2, 100].map((left) => (
        <div
          key={left}
          className="absolute top-[88px] z-10 h-[10px] w-[10px] -translate-x-1/2 rounded-full border-2 border-[#A8AAAD] bg-white"
          style={{ left: `${left}%` }}
        />
      ))}

      <div
        ref={trackRef}
        className="absolute left-0 top-[82px] z-20 h-5 cursor-pointer"
        style={{ width: `${SEGMENT_WIDTH}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={MIN_LTV_VALUE}
        aria-valuemax={lowMax}
        aria-valuenow={safeValue}
        aria-disabled={disabled}
        className="absolute top-[84px] z-30 flex h-4 w-4 -translate-x-1/2 cursor-grab items-center justify-center outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-text-primary/30"
        style={{ left: `${handlePercent}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <HoldIcon />
      </div>

      <div
        className="absolute top-[106px] z-20 flex h-11 w-[52px] flex-col items-center justify-center rounded bg-bg-secondary text-text-primary"
        style={{
          left: `${handlePercent}%`,
          transform: bubbleTransform
        }}
      >
        <div className="text-sm leading-5">LTV</div>
        <div className="text-sm text-[#72CC29] font-medium leading-5">
          {formatPercent(safeValue)}
        </div>
      </div>
    </div>
  );
};

export default LtvRiskSlider;
