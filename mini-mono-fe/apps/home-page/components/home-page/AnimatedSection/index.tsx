import React, { ReactNode } from 'react';
import { useScrollAnimation } from '~/hooks/useScrollAnimation';
import styles from './index.module.less';
import cls from 'classnames';

interface AnimatedSectionProps {
    children: ReactNode;
    delay?: number; // 延迟时间（毫秒），用于错开多个元素的动画
    className?: string;
}

/**
 * 动画包装组件
 * 当元素进入视口时触发淡入和向上移动动画
 */
const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    delay = 0,
    className,
}) => {
    const { elementRef, isVisible } = useScrollAnimation({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px', // 提前50px触发动画
        triggerOnce: true,
    });

    return (
        <div
            ref={elementRef}
            className={cls(
                styles.animatedSection,
                {
                    [styles.visible]: isVisible,
                },
                className
            )}
            style={{
                animationDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;

