import React, { ReactNode } from 'react';
import cls from 'classnames';
import { useScrollAnimation } from '~/hooks/useScrollAnimation';
import styles from './index.module.less';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  delay = 0,
  className
}) => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true
  });

  return (
    <div
      ref={elementRef}
      className={cls(
        styles.animatedSection,
        { [styles.visible]: isVisible },
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
