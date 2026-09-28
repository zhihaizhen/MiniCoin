//@ts-nocheck
import { useFm } from '@better-bit-fe/base-hooks';
import React, { cache, useEffect, useState } from 'react';
import cls from 'classnames';
import { getLang } from '@better-bit-fe/base-utils';
import { URL } from '~/api';
import styles from './index.module.less';

const AppStatus = (props) => {
  const { classname } = props;
  const t = useFm();
  const [inofs, setInfos] = useState({
    version: '',
    status: ''
  });

  useEffect(() => {
    fetchInfos();
  }, []);

  const fetchInfos = async () => {
    try {
      const res = await fetch(`${URL.appStatus}?_t=${Date.now()}`)
        .then((response) => response.json())
        .then((res) => {
          if (res.ios) {
            setInfos(res.ios);
          }
        });
    } catch (err) {
      console.log(99992, err);
    }
  };

  const urlMap = {
    'zh-CN': '',
    'en-US': '',
    'zh-TW': '',
    'vi-VN': '',
    'ko-KR': ''
  };

  const handleGitbook = () => {
    const lang = getLang();
    window.open(urlMap[lang]);
  };
  const gapSpan = <span className={styles.gap}> | </span>;

  return (
    <div className={cls(styles.AppStatus, classname)}>
      <span>
        {t('latestVersion')}:{inofs.version}
      </span>
      {gapSpan}
      <span>
        {t('status')}:{inofs.status ? t(inofs.status) : ''}
      </span>
      {gapSpan}
      <span className={styles.linkColor} onClick={handleGitbook}>
        {t('noLatestVersion')}
      </span>
    </div>
  );
};

export default AppStatus;
