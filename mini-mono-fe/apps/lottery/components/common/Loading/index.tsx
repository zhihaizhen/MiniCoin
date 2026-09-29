import classNames from 'classnames';
import styles from './index.module.less';

type LoadingProps = {
  isBlue?: boolean;
};

const Loading: React.FC<LoadingProps> = ({ isBlue = false }) => {
  const circleItemClassName = classNames(
    styles.circleItem1,
    styles.circleItem,
    isBlue && styles.blueColor
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
