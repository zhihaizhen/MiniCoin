//@ts-ignore
import { useFm } from '@better-bit-fe/base-hooks';
import React from 'react';
import cls from 'classnames';
import styles from './index.module.less';
import DownloadIcons from '~/components/downloadIcons';
import { DownloadQrcode } from '@better-bit-fe/base-ui';


const Download = () => {
  const t = useFm();

  return (
    <section className={cls(styles.Download)}>
      <div className={styles.coreContent}>
        <h2 className={styles.title}>{t('easyTrade')}</h2>
        <h2 className={styles.desc}>{t('easyTradeDesc')}</h2>
        <div className={styles.content}>
          <img className={styles.webapp} src='/images/homePage/webapp.png' alt="easicoin" />

          <div className={styles.bottomContent}>
            <div className={styles.qrcodeWrapper}>
              <DownloadQrcode width="108px" height="108px" radius="8px" size={88} />
              <div className={styles.text}>
                <div>{t('scanDownload')}</div>
                <div>iOS & Android</div>
              </div>

            </div>
            <div className={styles.downloadIconsWrapper}>
              <DownloadIcons theme="dark_no_border" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Download;
