import React, { useState, useEffect } from 'react';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import clc from 'classnames';
import campaignLang from '../../mini-translation-temp/Campaign.json';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isInApp, countdownFormat, debounce } from '~/utils';

const Header = ({ voucherList }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [time, setTime] = useState({
    day: 0,
    hour: 0,
    min: 0,
    sec: 0
  });
  const activity = voucherList?.length > 0 ? voucherList[0] : null;

  useEffect(() => {
    const cb = (data) => {
      setTime({
        day: data.days,
        hour: data.hours,
        min: data.minutes,
        sec: data.seconds
      });
    };
    countdownFormat(activity?.campaign_end_time, cb);
  }, [activity?.campaign_end_time]);

  const { locale } = useRouter();
  const { content } = campaignLang[locale] || {};

  const handleJoinCampaign = debounce(() => {
    if (!isLogin) {
      if (isInApp()) {
        try {
          const param = {
            methodName: 'push',
            uniqueId: 'rewardsHub-new-register',
            params: {
              path: 'loginpage' // loginpage表示登录
            }
          };
          const jsonPrams = JSON.stringify(param);
          (window as any)?.flutter_inappwebview?.callHandler(
            '_b_bridge_Router_',
            jsonPrams
          );
          const cb = (params) => {
            window.location.reload();
          };
          (window as any)._b_bridge_callback_ = cb;
        } catch (e) {
        }
      } else {
        window.location.href = `/${locale}/account/login`;
      }
      return;
    }
  }, 500);
  // 活动是否过期 end_at < 当前时间 end_at 是秒级时间戳
  const isActivityExpired = activity?.end_at * 1000 < new Date().getTime();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.left}>
          {/* <div className={styles.time}>
            {[
              { label: 'Day', value: time.day },
              { label: 'Hour', value: time.hour },
              { label: 'Min', value: time.min },
              { label: 'Sec', value: time.sec }
            ].map((item) => (
              <div className={styles.timeItem} key={item.label}>
                <div className={styles.timeVal}>{item.value}</div>
                <div className={styles.timeLabel}>{item.label}</div>
              </div>
            ))}
          </div> */}
          {/* <div className={styles.headerTips}>{content?.banner_description}</div> */}
          <div
            className={styles.headerTitle}
            dangerouslySetInnerHTML={{
              __html: content?.banner_title
            }}
          />
          <div
            style={{
              display: isActivityExpired || !isLogin ? 'flex' : 'none'
            }}
            className={clc(styles.btn)}
            onClick={handleJoinCampaign}
          >
            <span>
              {isActivityExpired
                ? t('activites_finished')
                : !isLogin
                  ? t('login')
                  : ''}
            </span>
          </div>
        </div>
        <div className={styles.right}>
          <img src={'https://cdn.easicoin.io/campaign/tradingCompetition/banner-h5-2025411.svg'} alt={'banner'} />
        </div>
      </div>
    </div>
  );
};

export default Header;
