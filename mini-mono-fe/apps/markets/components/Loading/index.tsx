import styles from './index.module.less';

const Loading = () => {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.circle}>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
        <div className={`${styles.circleItem1} ${styles.circleItem}`}></div>
      </div>
    </div>
  );
};
export default Loading;
