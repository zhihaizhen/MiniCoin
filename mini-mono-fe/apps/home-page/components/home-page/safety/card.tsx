import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useState, PropsWithChildren } from 'react';
import styles from './index.module.less';

const Card = ({ num }) => {
  const t = useFm();

  return (
    <section className={styles.Card}>
      <div className={styles.cardTitle}>{t(`safety_t${num}`)}</div>
      <div className={styles.cardDesc}>{t(`safety_d${num}`)}</div>
    </section>
  );
};

export default Card;
