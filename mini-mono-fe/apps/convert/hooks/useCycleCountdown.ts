import { useRef, useCallback, useEffect } from "react";

export function useCircleCountdown(
  progressRef: React.RefObject<SVGSVGElement>,
  duration = 8000
) {
  const frameIdRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const runningRef = useRef(false);

  const animate = useCallback((now: number) => {
    if (!startTimeRef.current) return;

    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    progressRef.current?.style.setProperty(
      "--progress",
      String(progress)
    );

    if (progress < 1 && runningRef.current) {
      frameIdRef.current = requestAnimationFrame(animate);
    } else {
      runningRef.current = false;
    }
  }, [duration, progressRef]);

  const start = useCallback(() => {
    if (!progressRef.current) return;

    // 先停止旧动画
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }

    progressRef.current.style.setProperty("--progress", "0");

    runningRef.current = true;
    startTimeRef.current = performance.now();
    frameIdRef.current = requestAnimationFrame(animate);
  }, [animate, progressRef]);

  const stop = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }
    runningRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  return { start, stop };
}
