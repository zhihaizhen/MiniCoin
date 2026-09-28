import React, { useRef, useState, useEffect } from 'react';

interface WebmAnimationProps {
  introSrc?: string;
  loopSrc: string;
  className?: string;
  videoClassName?: string;
}

export default function WebmAnimation({
  introSrc,
  loopSrc,
  className = '',
  videoClassName = ''
}: WebmAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 如果没有 introSrc，直接标记为完成
  const [introDone, setIntroDone] = useState(!introSrc);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lazy Load via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // 提前100px开始加载
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLoaded = () => setLoading(false);

  const handleIntroEnded = () => {
    setIntroDone(true);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading / Placeholder */}
      {/*{(loading || !visible) && (*/}
      {/*  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/10">*/}
      {/*    <div className="animate-pulse w-full h-full bg-gray-200/20" />*/}
      {/*  </div>*/}
      {/*)}*/}

      {visible && (
        <>
          {/* Intro Animation: 仅在有 introSrc 且未完成时渲染 */}
          {introSrc && !introDone && (
            <video
              src={introSrc}
              className={`w-full h-full object-contain ${videoClassName}`}
              autoPlay
              muted
              playsInline
              preload="metadata"
              onEnded={handleIntroEnded}
              onLoadedData={handleLoaded}
            />
          )}

          {/* Loop Animation: 当 Intro 完成（或不存在）时渲染 */}
          {introDone && (
            <video
              src={loopSrc}
              className={`w-full h-full object-contain ${videoClassName}`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onLoadedData={handleLoaded}
            />
          )}
        </>
      )}
    </div>
  );
}
