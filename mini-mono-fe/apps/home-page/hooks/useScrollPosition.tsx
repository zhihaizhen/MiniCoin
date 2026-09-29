import { useEffect, useState } from 'react';

/**
 * 滚动位置 Hook
 * 检测页面滚动位置，用于实现滚动吸底等效果
 */
export const useScrollPosition = () => {
    const [scrollY, setScrollY] = useState(0);
    const [isScrolledPastFirstScreen, setIsScrolledPastFirstScreen] = useState(false);

    useEffect(() => {
        // 确保在客户端环境下运行
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            setScrollY(currentScrollY);
            // 当滚动超过一个视口高度时，认为已经滚动到第二屏
            setIsScrolledPastFirstScreen(currentScrollY > viewportHeight);
        };

        // 初始化时检查一次
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return { scrollY, isScrolledPastFirstScreen };
};

