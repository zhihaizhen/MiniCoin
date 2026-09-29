import React, { use, useEffect, useState } from 'react';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { tracing } from '@betterbit-library/tools';
import { checkType } from '@better-bit-fe/base-utils';
import { useRouter } from 'next/router';
import { postWealthTracking } from '~/api';
import AppStatus from '~/components/appStatus';
import { ReactComponent as APKSvg } from '~/icon/app/noBg/apk.svg';
import { ReactComponent as GooglePlaySvg } from '~/icon/app/noBg/googlePlay.svg';
import { ReactComponent as AppStoreSVG } from '~/icon/app/noBg/appStore.svg';
import { ReactComponent as TestFlightSVG } from '~/icon/app/noBg/testFlight.svg';
import styles from './index.module.less';

// 用于download 的h5
const FixedFooterDownWealth = (props) => {

  const t = useFm();
  const { query, isReady, locale } = useRouter();
  const { identity_id, device_model } = query;
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);

  const handleTracking = async (type, event?) => {
    event?.preventDefault();
    const params = {
      "product": "wealth_banner", //产线名称
      "event_name": type,  // "wealth_download_tf | wealth_download_appStore| wealth_download_apk | wealth_page_view", //事件名称，建议使用小写字母和下划线 
      "identity_id": identity_id || '0', //唯一标识符，比如设备ID，外部用户ID，或者本地cookie存储的ID，建议使用字符串类型
      "timestamp": Date.now(), //上报时间，入库统计UTC0时间
      "source_plat": checkType() === "pc" ? "pc" : "h5", //数据来源，建议使用小写字母 ios android web h5等
      "sdk_version": "1.0.0", //版本号，用于区分不同版本的上报数据
      "device_model": device_model || 'default', //设备型号
    }
    try {
      await postWealthTracking(params);
    } catch (error) {
      console.log('error tracking', error);
    } finally {
      if (type === 'wealth_download_tf') {
        window.open("https://testflight.apple.com/join/ZWY3thAf", "_blank");
      }
      if (type === 'wealth_download_appStore') {
        window.open('https://apps.apple.com/app/easicoin/id6747739506', "_blank");
      }
    }
  }

  useEffect(() => {
    if (checkType() == 'ios') setIos(true);
    if (checkType() == 'android') setAndroid(true);
  }, []);

  const handleDownApk = () => {
    handleTracking('wealth_download_apk');
    const link = document.createElement('a');
    link.href = 'https://h5.nrkbl.com/download/apk/cn?_=' + Date.now();
    link.download = '';
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
            onClick={(event) => handleTracking('wealth_download_tf', event)}
          >
            <div>{t('appleTestflight')}</div>
            <TestFlightSVG />
          </a>
          <a className={`${styles.downloadBtn} ${styles.downloadBrand}`}
            href='https://apps.apple.com/app/easicoin/id6747739506'
            target="_blank"
            rel="noreferrer"
            onClick={(event) => handleTracking('wealth_download_appStore', event)}
          >
            <div>{t('appleStore')}</div>
            <AppStoreSVG />
          </a>
        </div>
      )}
    </div>
  );
};

export default FixedFooterDownWealth;
