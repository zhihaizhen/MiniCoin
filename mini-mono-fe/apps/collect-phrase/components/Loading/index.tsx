import classNames from 'classnames';
import styles from './index.module.less';
import React from 'react';


const Loading: React.FC = () => {
  const circleItemClassName = classNames(
    styles.circleItem1,
    styles.circleItem,
    styles.blueColor
  );

  return (
    <div className={styles.loadingPage}>
      <div className={styles.circle}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={circleItemClassName} />
        ))}
      </div>
    </div>
  );
};

export default Loading;
