import React, { useCallback, useRef, useState } from 'react';
import { ReactComponent as HoldIcon } from '~/public/images/loan/hold.svg';

interface LtvSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatTooltip?: (value: number) => string;
  disabled?: boolean;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const LtvSlider: React.FC<LtvSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 80,
  step = 1,
  formatTooltip = (v) => `${v}%`,
  disabled = false
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const safeValue = clamp(value, min, max);
  const percent = ((safeValue - min) / (max - min)) * 100;
  const tooltipPositionClass =
    percent <= 0
      ? 'left-1/2 translate-x-[-6px]'
      : percent >= 100
        ? 'right-1/2 translate-x-[6px]'
        : 'left-1/2 -translate-x-1/2';

  const commit = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const decimals = (step.toString().split('.')[1] || '').length;
      onChange(Number(clamp(stepped, min, max).toFixed(decimals)));
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    commit(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    commit(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(safeValue - step, min, max));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(safeValue + step, min, max));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      className={`relative w-full h-10 select-none touch-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div
        ref={trackRef}
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] bg-fill-slider rounded-full cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute left-0 top-0 h-full bg-text-primary rounded-full"
          style={{ width: `${percent}%` }}
        />
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-3 border-text-primary bg-white" />

        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={safeValue}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          className="absolute top-1/2 flex items-center justify-center w-4 h-4 rounded  cursor-grab
          active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-text-primary/30"
          style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="flex flex-col gap-[2px]">
           <HoldIcon />
          </div>

          <div
            className={`absolute top-full mt-2 ${tooltipPositionClass} px-2 py-0.5 rounded bg-text-primary text-white text-xs leading-4 whitespace-nowrap`}
          >
            {formatTooltip(safeValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LtvSlider;
