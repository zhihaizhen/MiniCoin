// 首页用的
import { useFm } from '@better-bit-fe/base-hooks';
import cls from 'classnames';
import { ReactComponent as APKSvg } from '~/icon/app/hasBg/androidApk.svg';
import { ReactComponent as GooglePlaySvg } from '~/icon/app/hasBg/googlePlay.svg';
import { ReactComponent as AppStoreSVG } from '~/icon/app/hasBg/appStore.svg';
import { ReactComponent as TestFlightSVG } from '~/icon/app/hasBg/testFlight.svg';

import styles from './index.module.less';

const THEME = {
  WHITE: 'white',
  DARK_NO_BORDER: 'dark_no_border',
  DARK: 'dark',
  DARK_ROUND: 'dark_round'
};


const DownloadIcons = ({ theme = THEME.WHITE }) => {
  const t = useFm();

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
    <div className={cls(styles.downIcons, styles[theme])}>
      {/* App store */}
      <a className={cls(styles.icon)}
        href="https://apps.apple.com/app/easicoin/id6747739506"
        target="_blank"
        rel="noreferrer"
      >
        <AppStoreSVG />
        <div className={cls(styles.text)}>{t('appleStore')}</div>
      </a>
      {/* Apple testflight */}
      <a className={cls(styles.icon)}
        href="https://testflight.apple.com/join/ZWY3thAf"
        target="_blank"
        rel="noreferrer"
      >
        <TestFlightSVG />
        <div className={cls(styles.text)}>{t('testFlight')}</div>
      </a>

      {/* google应用市场 */}
      <a className={cls(styles.icon)}
        href="https://play.google.com/store/apps/details?id=io.easiex.app"
        target="_blank"
        rel="noreferrer"
      >
        <GooglePlaySvg />
        <div className={cls(styles.text)}>{t('googlePlay')}</div>
      </a>
      {/* 安卓apk */}
      <a className={cls(styles.icon)}
        href="javascript:void(0)"
        rel="noreferrer"
        onClick={handleDownApk}
      >
        <APKSvg />
        <div className={cls(styles.text)}>{t('androidApk')}</div>
      </a>
    </div>
  );
};

export default DownloadIcons;
