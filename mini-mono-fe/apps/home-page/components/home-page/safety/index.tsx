//@ts-ignore
import { useFm } from '@better-bit-fe/base-hooks';
import React, { useRef, useState, useCallback } from 'react';
import cls from 'classnames';
import Card from './card';
import styles from './index.module.less';

const Safety = ({ title, desc, num }) => {
  const t = useFm();
  const list = Array.from({ length: 3 });
  const [isFirstVideoEnded, setIsFirstVideoEnded] = useState(false);
  const loopVideoRef = useRef<HTMLVideoElement>(null);

  const handleFirstVideoEnd = useCallback(() => {
    // 先让循环视频从头开始播放，确保帧同步
    if (loopVideoRef.current) {
      loopVideoRef.current.currentTime = 0;
      loopVideoRef.current.play();
    }
    // 然后隐藏入场动画
    setIsFirstVideoEnded(true);
  }, []);

  return (
    <section className={cls(styles.Safety)}>
      <div className={styles.coreContent}>

        <div className={styles.title}>{t('safetyTitle', 'Why EasiCoin?')}</div>
        {/* 视频容器：使用相对定位实现叠加 */}
        <div className={styles.videoContainer}>
          {/* 循环视频（底层）- 始终存在于 DOM 中，预加载 */}
          <video
            ref={loopVideoRef}
            className={styles.safetyVedio}
            src={`/images/homePage/safety2.webm`}
            preload="auto"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* 入场动画（上层）- 播放完成后淡出隐藏 */}
          <video
            className={cls(styles.safetyVedio, styles.introVideo, {
              [styles.fadeOut]: isFirstVideoEnded
            })}
            src={`/images/homePage/safety1.webm`}
            preload="auto"
            autoPlay
            muted
            playsInline
            onEnded={handleFirstVideoEnd}
          />
        </div>

        <div className={styles.content}>
          {list.map((it, i) => (
            <Card key={i} num={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Safety;
