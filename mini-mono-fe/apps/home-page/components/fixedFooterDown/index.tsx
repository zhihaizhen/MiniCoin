import React, { use, useEffect, useState } from 'react';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { tracing } from '@betterbit-library/tools';
import styles from './index.module.less';
import { checkType } from '@better-bit-fe/base-utils';
import AppStatus from '~/components/appStatus';
import { ReactComponent as APKSvg } from '~/icon/app/noBg/apk.svg';
import { ReactComponent as GooglePlaySvg } from '~/icon/app/noBg/googlePlay.svg';
import { ReactComponent as AppStoreSVG } from '~/icon/app/noBg/appStore.svg';
import { ReactComponent as TestFlightSVG } from '~/icon/app/noBg/testFlight.svg';

// 用于download 的h5
const FixedFooterDown = (props) => {

  const t = useFm();
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);


  useEffect(() => {
    if (checkType() == 'ios') setIos(true);
    if (checkType() == 'android') setAndroid(true);
  }, []);


  const handleDownApk = () => {
    const oldNode = document.getElementById('downloadLink');
    if (oldNode) {
      document.body.removeChild(oldNode);
    }

    const link = document.createElement('a');
    link.id = 'downloadLink';
    link.href = '/static/app/apk/EasiCoin.apk';
    link.setAttribute('download', 'EasiCoin.apk');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className={styles.footerWrappwer}>
      {/* <div className={styles.top}>
            <AppStatus classname={styles.appInfo} />
          </div> */}
      {/* 安卓，下载apk和google市场 */}
      {android && (<div className={styles.footer}>
        <a
          className={`${styles.downloadBtn} ${styles.downloadDefault}`}
          href="javascript:void(0)"
          rel="noreferrer"
          onClick={handleDownApk}>
          <div>{t('androidApk')}</div>
          <APKSvg />
        </a>
        <a className={`${styles.downloadBtn} ${styles.downloadBrand}`}
          href="https://play.google.com/store/apps/details?id=io.easiex.app"
          target="_blank"
          rel="noreferrer"
        >
          <div>{t('googleStore')}</div>
          <GooglePlaySvg />
        </a>
      </div>)}

      {/* ios testflight&apple store*/}
      {ios && (
        <div className={styles.footer}>
          <a className={`${styles.downloadBtn} ${styles.downloadDefault}`}
            href="https://testflight.apple.com/join/ZWY3thAf"
            target="_blank"
            rel="noreferrer"
          >
            <div>{t('appleTestflight')}</div>
            <TestFlightSVG />
          </a>
          <a className={`${styles.downloadBtn} ${styles.downloadBrand}`}
            href='https://apps.apple.com/app/easicoin/id6747739506'
            target="_blank"
            rel="noreferrer"
          >
            <div>{t('appleStore')}</div>
            <AppStoreSVG />
          </a>
        </div>
      )}
    </div>
  );
};

export default FixedFooterDown;
