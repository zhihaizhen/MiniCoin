import styles from './index.module.less';

export function Layout({
  children,
  dark
}: {
  children: JSX.Element;
  dark?: boolean;
  transparent?: boolean;
}) {
  return (
    <div
      className={`${styles.container} 
      ${dark ? styles.dark : styles.light} `}
    >
      <div className={styles['container-inner']}>{children}</div>
    </div>
  );
}
