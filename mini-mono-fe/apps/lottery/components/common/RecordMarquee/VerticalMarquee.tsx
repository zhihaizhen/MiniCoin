import React, { useEffect, useRef } from "react";

interface VerticalMarqueeProps {
  items: React.JSX.Element[];
  speed?: number; // 滚动速度（像素/秒）
  pauseOnHover?: boolean;
  className?: string;
}

const VerticalMarquee: React.FC<VerticalMarqueeProps> = ({
                                                           items,
                                                           speed = 5,
                                                           pauseOnHover = true,
                                                           className = "",
                                                         }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const list = listRef.current;
    if (!container || !list) return;

    let animationFrame: number;
    let y = 0;

    const tick = () => {
      y -= speed / 180; // 每帧移动速度
      if (Math.abs(y) >= list.scrollHeight / 2) y = 0; // 循环滚动
      list.style.transform = `translateY(${y}px)`;
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden h-full relative ${className} mask-[linear-gradient(to_bottom,transparent_0%,black_50%,transparent_100%)]
      [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_50%,transparent_100%)]`}
    >
      <div
        ref={listRef}
        className={`flex flex-col ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="py-0.5 md:py-2 text-center text-gray-800 dark:text-gray-100"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerticalMarquee;
