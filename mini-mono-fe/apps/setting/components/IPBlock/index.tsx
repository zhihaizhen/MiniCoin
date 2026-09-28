import React, { useEffect, useState } from 'react';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';

const IpBlock = () => {
  const t = useFm();

  return (
    <div className={styles['wrapper']}>
      <div className={styles['content']}>
        <div className={styles['ip-block-img']}></div>
        <div className={styles['ip-block-content-1']}>
          {t('ip-block-content-1')}
        </div>
        <div className={styles['ip-block-content-2']}>
          <p>{t('ip-block-content-2')}</p>
          {t('ip-block-content-3', {
            email: (
              <a className={styles['email']} href="mailto: support@easicoin.io">
                support@easicoin.io
              </a>
            )
          })}
        </div>
      </div>
    </div>
  );
};
export default IpBlock;
