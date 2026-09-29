import React, { useState, useEffect } from 'react';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';
import { formatTimeDifference } from '../../utils';
import { useRouter } from 'next/router';
import { joinCampaign, getCampaignDetail } from '../../api';
import clc from 'classnames';
import campaignLang from '../../mini-translation-temp/Campaign.json';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isInApp, countdownFormat, debounce } from '~/utils';
import { isMobile } from '@better-bit-fe/base-utils';

const Header = ({ activity, updateCampaignDetail }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [time, setTime] = useState({
    day: 0,
    hour: 0,
    min: 0,
    sec: 0
  });

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
          console.log('55555调用参数了', param);
          const jsonPrams = JSON.stringify(param);
          (window as any)?.flutter_inappwebview?.callHandler(
            '_b_bridge_Router_',
            jsonPrams
          );
          const cb = (params) => {
            console.log('55555app注册成功的cb调用', params);
            window.location.reload();
          };
          (window as any)._b_bridge_callback_ = cb;
          console.log('55555已经调用了2222', jsonPrams);
        } catch (e) {
          console.log('55555调用失败', e);
        }
      } else {
        window.location.href = `/${locale}/account/login`;
      }
      return;
    }
    if (
      activity?.complete === 1 ||
      activity?.register_status === 1 ||
      activity?.campaign_status === 'Expired' ||
      activity?.reward_status === 'Done'
    ) {
      return;
    }
    joinCampaign({ campaign_id: activity.id }).then((res) => {
      updateCampaignDetail();
    });
  }, 500);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.left}>
          <div className={styles.time}>
            {[
              { label: 'Day', value: time.day },
              { label: 'Hour', value: time.hour },
              { label: 'Min', value: time.min },
              { label: 'Sec', value: time.sec }
            ].map((item, index) => (
              <>
                <div className={styles.timeItem} key={item.label}>
                  <div className={styles.timeVal}>{item.value}</div>
                  <div className={styles.timeLabel}>{item.label}</div>
                </div>
                {index !== 3 && <span className={styles.timeSplit}>:</span>}
              </>
            ))}
          </div>
          {/* {!isMobile() && (
            <>
              <div className={styles.headerTips}>
                {content?.banner_description}
              </div>
              <div className={styles.headerTitle} dangerouslySetInnerHTML={{ __html: content?.banner_title }} />
            </>
          )}
           */}
          <>
            <div className={styles.headerTitle} dangerouslySetInnerHTML={{ __html: content?.banner_title }} />
            <div className={styles.headerTips}>
              {content?.banner_description}
            </div>
          </>

          <div
            style={{ visibility: activity ? 'visible' : 'hidden' }}
            className={clc(
              styles.btn,
              (activity?.complete === 1 ||
                activity?.register_status === 1 ||
                activity?.campaign_status === 'Expired') &&
              // isLogin &&
              styles.disabled
            )}
            onClick={handleJoinCampaign}
          >
            <span>
              {activity?.reward_status === 'Done'
                ? t('award-received')
                : activity?.campaign_status === 'Expired'
                  ? t('activites_finished')
                  : !isLogin
                    ? t('login')
                    : activity?.register_status === 1
                      ? t('joined')
                      : t('joinCampaign')}
            </span>
          </div>
        </div>
        <div className={styles.right}>
          <img src={content?.banner_image} alt={'header'} />
        </div>
      </header>
      <div className={styles.stepWrap}>
        <div className={styles.title}>{content?.introTitle}</div>
        <div className={styles.des}>{content?.introDesc}</div>
        <div className={styles.stepBox}>
          {content?.introStep?.map((item) => (
            <div className={styles.stepItem} key={item.title}>
              <div className={styles.stepNum}>
                <img src={item?.icon} alt={'icon'} />
              </div>
              <div className={styles.titleBox}>
                <div className={styles.stepTitle}>{item?.title}</div>
                <div className={styles.stepDes}>{item?.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
