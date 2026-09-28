import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number; // 触发阈值，0-1之间，默认0.1
    rootMargin?: string; // 根边距，默认'0px'
    triggerOnce?: boolean; // 是否只触发一次，默认true
}

/**
 * 滚动动画 Hook
 * 使用 Intersection Observer API 检测元素是否进入视口
 */
export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        triggerOnce = true,
    } = options;

    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                });
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { elementRef, isVisible };
};

