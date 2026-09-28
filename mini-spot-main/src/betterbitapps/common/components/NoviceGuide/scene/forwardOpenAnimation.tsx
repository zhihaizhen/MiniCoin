import React, { useEffect, useState } from 'react';
// import { intercept } from '@unified/helpers';
// import SenceProps from '../types/senceProps';

/**
 * 正向合约新手引导弹窗，右边开仓动画
 * 正向动画分为二个，开仓动画 ，平仓动画
 * step 鼠标位置 1: tab 标签 2: order price 3: Qty 4: open Loang button
 * @returns
 */
export default () => {
  const [step, setStep] = useState(0);
  const price: number = 52000.0;
  const oty: number = 0.5;
  const usdt: string = '2160.4286';
  // const usdt:string = intercept((price * oty) / 10, 2)

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
      case 3:
        lateChangeStep(1200, 4);
        break;
      default:
        break;
    }
  }, [step]);

  return (
    <div className="forword-animation forword-open-animation">
      <div className="img">
        <p className={`num orderprice ${step >= 2 ? 'active' : ''} `}>
          {price}
        </p>
        <p className={`num oty ${step >= 3 ? 'active' : ''} `}>{oty}</p>
        <p className="oplong">{step >= 4 ? usdt : '-'} USDT</p>
        <p className="opshort">{step >= 4 ? usdt : '-'} USDT</p>
        <p className="ordervalue">{step >= 4 ? '26,000' : '0.0000'} USDT</p>
        <span className={`pointer step${step}`} />
      </div>
    </div>
  );
};
