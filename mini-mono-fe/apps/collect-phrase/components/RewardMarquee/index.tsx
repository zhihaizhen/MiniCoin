import React, { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
  speed?: number; // px/s
  gap?: number; // 间距
  pauseOnHover?: boolean;
  children: React.ReactNode;
}

const useMarqueeAnimation = (
  speed: number,
  contentWidth: number,
  gap: number,
  pauseOnHover: boolean
) => {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const raf = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (isPaused || contentWidth === 0) return;

    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setOffset((prev) => {
        let next = prev + (delta * speed) / 1000;
        if (next >= contentWidth + gap) {
          next = 0;
        }
        return next;
      });

      raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [speed, contentWidth, gap, isPaused]);

  const pause = () => pauseOnHover && setIsPaused(true);
  const resume = () => pauseOnHover && setIsPaused(false);

  return { offset, pause, resume };
};

const RewardMarquee: React.FC<MarqueeProps> = ({
  speed = 80,
  gap = 24,
  pauseOnHover = false,
  children
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  const { offset, pause, resume } = useMarqueeAnimation(
    speed,
    contentWidth,
    gap,
    pauseOnHover
  );

  useEffect(() => {
    if (!contentRef.current) return;
    setContentWidth(contentRef.current.scrollWidth);
  }, [children]);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden w-full"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div
        className="flex w-max"
        style={{
          transform: `translateX(-${offset}px)`,
          gap
        }}
      >
        <div ref={contentRef} className="flex gap-[inherit]">
          {children}
        </div>
        <div className="flex gap-[inherit]">{children}</div>
      </div>
    </div>
  );
};

export default RewardMarquee;
