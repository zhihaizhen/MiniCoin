import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
type LoanLtvGaugeProps = {
  level: 'normal' | 'warning' | 'liquidation';
  progress?: string | number;
  centerNumber: React.ReactNode;
  footer: React.ReactNode;
};

const LoanLtvGauge: React.FC<LoanLtvGaugeProps> = ({
                                                      level,
                                                     progress,
                                                     centerNumber,
                                                     footer
                                                   }) => {
  const rawProgress = new BigNumber(progress || 0);
  const normalizedProgress = rawProgress.isFinite()
    ? Math.min(
      (rawProgress.abs().lte(1) ? rawProgress.times(100) : rawProgress).toNumber(),
      100
    )
    : 0;

  return (
    <div className="w-full min-w-[190px] px-4 py-3">
      <div className="relative mx-auto h-[100px] w-[184px]">
        <svg
          viewBox="0 0 126 72"
          fill="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {/* 背景轨道 */}
          <path
            d="M120 64.5C120 33.0198 94.4802 7.5 63 7.5C31.5198 7.5 6 33.0198 6 64.5"
            stroke="#EBEBEB"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* 虚线刻度 */}
          <path
            d="M109 64.5C109 39.0949 88.4051 18.5 63 18.5C37.5949 18.5 17 39.0949 17 64.5"
            stroke="#A8AAAD"
            strokeWidth="2"
            strokeMiterlimit="3.52094"
            strokeDasharray="1 6"
          />

          {/* 绿色进度 */}
          <path
            d="M6 64.5C6 33.0198 31.5198 7.5 63 7.5C94.4802 7.5 120 33.0198 120 64.5"
            stroke={level === 'liquidation' ? '#FA465B' : level === 'warning' ? '#F1C409' : '#72CC29'}
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${normalizedProgress} 100`}
          />
        </svg>
        <div
          className="absolute left-1/2 top-[55px] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-none">
          <div className="text-xs font-medium text-text-primary">LTV</div>
          <div className={`text-xs font-medium ${level === 'liquidation' ? 'text-[#FA465B]' : level === 'warning' ? 'text-[#F1C409]' : 'text-[#72CC29]'}`}>
            {centerNumber}
          </div>
        </div>
      </div>
      <div className="-mt-1 flex justify-center">{footer}</div>
    </div>
  );
};

export default LoanLtvGauge;
