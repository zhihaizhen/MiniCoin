import React from 'react';
import { formatThousandDigit, formatTimestamp } from '~/utils';
import { UserCashbackItem } from '~/hooks/useUserCashbackRecord';
import styles from './index.module.less';

interface RecordItemProps {
  record: UserCashbackItem;
  index: number;
}

const RecordItem: React.FC<RecordItemProps> = ({ record, index }) => {
  return (
    <div
      className={`flex items-center justify-between py-2.5 text-sm ${styles.recordItem}`}
    >
      {/* 时间 */}
      <div className="flex-1 text-white/90">
        {formatTimestamp(record.cashback_time)}
      </div>

      {/* 金额 */}
      <div className="text-text-green font-medium">
        +{formatThousandDigit(record.amount.toString())}
      </div>
    </div>
  );
};

export default RecordItem;
