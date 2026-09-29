import styles from '../pages/index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';

const Loading = () => {
  const t = useFm();
  return (
    <div className={styles.loadingPage}>
      <div className={styles.circle}>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
      </div>
      {/* <div>{t('loading')}</div> */}
    </div>
  );
};
export default Loading;
