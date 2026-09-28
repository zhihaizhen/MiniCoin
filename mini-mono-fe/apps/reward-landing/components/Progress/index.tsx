import React from 'react';
import styles from './index.module.less';

const Progress = ({ percent = 0, style = {} }) => {
  const validPercentage = Math.min(Math.max(percent, 0), 100);

  return (
    <div style={style} className={styles.progress_container}>
      <div
        className={styles.progress_bar}
        style={{
          width: `${validPercentage}%`,
          backgroundColor: 'var(--text-brand-default)',
          height: '100%'
        }}
      ></div>
    </div>
  );
};

export default Progress;
