import React, { useEffect, useState } from 'react';
// import { intercept } from '@unified/helpers';
// import SenceProps from '../types/senceProps';

/**
 * 正向合约新手引导弹窗，右边平动画
 * 正向动画分为二个，开仓动画 ，平仓动画
 * @returns
 */
export default () => {
  const [step, setStep] = useState(0);
  const oty: number = 1.005;

  const lateChangeStep = (time: number, targetStep: number) => {
    setTimeout(() => {
      setStep(targetStep);
    }, time);
  };

  useEffect(() => {
    // 移动到 open tab 标签
    lateChangeStep(1000, 1);
  }, []);

  useEffect(() => {
    switch (step) {
      case 1:
        lateChangeStep(1200, 2);
        break;
      case 2:
        lateChangeStep(1600, 3);
        break;
      default:
        break;
    }
  }, [step]);

  return (
    <div className="forword-animation forword-close-animation">
      <div className="img">
        <p className={`num oty ${step >= 2 ? 'active' : ''} `}>{oty}</p>
        <span className={`pointer step${step}`} />
      </div>
    </div>
  );
};
