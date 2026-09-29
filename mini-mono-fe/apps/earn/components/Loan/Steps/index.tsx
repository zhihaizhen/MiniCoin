import React from 'react';

import { ReactComponent as SubmitIcon } from '~/public/images/loan/submit.svg';
import { ReactComponent as ReceiveIcon } from '~/public/images/loan/receive.svg';
import { ReactComponent as RepayIcon } from '~/public/images/loan/repay.svg';
import { ReactComponent as ReturnIcon } from '~/public/images/loan/return.svg';
import { useFm } from '@better-bit-fe/base-hooks';


const STEPS = [
  { num: '01', key: 'loan.step1', fallback: '提交申请', Icon: SubmitIcon },
  { num: '02', key: 'loan.step2', fallback: '收到借款', Icon: ReceiveIcon },
  { num: '03', key: 'loan.step3', fallback: '还款付息', Icon: RepayIcon },
  { num: '04', key: 'loan.step4', fallback: '回款质押物', Icon: ReturnIcon },
];
const LoanSteps: React.FC = () => {
  const t = useFm();
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 mb-10">
      {STEPS.map(({ num, key, fallback, Icon }, index) => (
        <React.Fragment key={num}>
          <div className="flex justify-start items-center gap-3 shrink-0">
            <div className="w-6 h-6 flex items-center justify-center">
              <Icon />
            </div>
            <span className="text-text-primary text-sm">
              <span className="mr-1">{num}</span>
              {t(key, fallback)}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className="hidden md:block flex-1 mx-4 border-t border-dashed border-text-tertiary" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default LoanSteps;
