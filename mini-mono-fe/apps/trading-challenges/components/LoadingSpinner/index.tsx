import React from 'react';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = () => {
  const t = useFm();
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2">
        <div className={styles.loadingSpinner} />
        <span className="text-white text-sm">{`${t('loading')}...`}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
