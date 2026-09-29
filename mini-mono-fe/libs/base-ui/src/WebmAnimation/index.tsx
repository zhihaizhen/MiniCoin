import React, { useRef, useState, useEffect } from 'react';

interface WebmAnimationProps {
  introSrc?: string;
  loopSrc: string;
  className?: string;
  introClassName?: string;
  loopClassName?: string;
}

export const WebmAnimation = ({
  introSrc,
  loopSrc,
  className = '',
  introClassName = '',
  loopClassName = '',
}: WebmAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);

  // 如果没有 introSrc，直接标记为完成
  const [introDone, setIntroDone] = useState(true);
  const [visible, setVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [loopReady, setLoopReady] = useState(false);

  useEffect(() => {
    if (introSrc) {
      setIntroDone(false);
    } else {
      setIntroDone(true);
    }
  }, [introSrc]);

  // 统一通过 JS 显式触发播放并设置静音，提高 WebView 兼容性
  const playVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    // 显式再次设置 playsinline 属性，部分旧版 WebView 可能需要
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Video play failed:', error);
      });
    }
  };

  // 检查视频是否已经就绪
  const checkReadyState = (video: HTMLVideoElement | null) => {
    if (!video) return false;
    // 4 = HAVE_ENOUGH_DATA, 3 = HAVE_FUTURE_DATA
    return video.readyState >= 3;
  };

  // 当 intro 结束或初始没有 intro 且组件可见时，尝试播放 loop
  useEffect(() => {
    if (visible && introDone && loopVideoRef.current && loopSrc) {
      playVideo(loopVideoRef.current);
    }
  }, [visible, introDone, loopSrc]);

  // 当组件变为可见且有 intro 时，触发 intro 播放
  useEffect(() => {
    if (visible && introSrc && introVideoRef.current && !introDone) {
      playVideo(introVideoRef.current);
    }
  }, [visible, introSrc, introDone]);

  // 为了绕过部分移动端浏览器的播放限制，
  // 我们在 loopVideo 准备就绪且整体可见时，如果 intro 还在播放，
  // 可以尝试预先静默播放一下并暂停，以“激活”播放权限
  useEffect(() => {
    if (visible && loopReady && !introDone && loopVideoRef.current) {
      const video = loopVideoRef.current;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          video.pause();
        }).catch(() => {
          // 预加载静默播放失败通常没关系
        });
      }
    }
  }, [visible, loopReady, introDone]);

  // Lazy Load via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 监听 loopReady 状态，如果 readyState 已经 OK 但事件没触发，这里做兜底
  useEffect(() => {
    if (visible && loopVideoRef.current && !loopReady && loopSrc) {
      if (checkReadyState(loopVideoRef.current)) {
        setLoopReady(true);
      }
    }
  }, [visible, loopReady, loopSrc]);

  const handleLoaded = () => setLoading(false);

  const handleIntroEnded = () => {
    // 先让循环视频从头开始播放，确保帧同步
    if (loopVideoRef.current) {
      loopVideoRef.current.currentTime = 0;
      loopVideoRef.current.play();
    }
    setIntroDone(true);
  };

  const handleLoopReady = () => {
    setLoopReady(true);
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
          {/* Intro Animation: 使用绝对定位叠加，通过 opacity 控制显隐 */}
          {introSrc && (
            <video
              key={introSrc}
              ref={introVideoRef}
              src={introSrc}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 z-1 ${introClassName}
                ${introDone ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              autoPlay
              muted
              playsInline
              controls={false}
              // @ts-ignore
              webkit-playsinline="true"
              // @ts-ignore
              x5-video-player-type="h5-page"
              // @ts-ignore
              x5-video-player-fullscreen="true"
              // @ts-ignore
              x5-video-orientation="portrait"
              onEnded={handleIntroEnded}
              onLoadedData={handleLoaded}
              onCanPlay={handleLoaded}
              onError={(e) => {
                console.error('Intro video load error:', e);
                setIntroDone(true); // 即使加载失败也跳过 intro，进入 loop
              }}
            />
          )}

          {/* Loop Animation: 预加载并在背景待命，intro 结束后淡入 */}
          <video
            key={loopSrc}
            ref={loopVideoRef}
            src={loopSrc}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity ${loopClassName}
              ${introDone ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted
            playsInline
            controls={false}
            // @ts-ignore
            webkit-playsinline="true"
            // @ts-ignore
            x5-video-player-type="h5-page"
            // @ts-ignore
            x5-video-player-fullscreen="true"
            // @ts-ignore
            x5-video-orientation="portrait"
            preload="auto"
            autoPlay={!introSrc}
            onLoadedData={handleLoopReady}
            onCanPlay={handleLoopReady}
            onError={(e) => {
              console.error('Loop video load error:', e);
            }}
          />
        </>
      )}
    </div>
  );
}
