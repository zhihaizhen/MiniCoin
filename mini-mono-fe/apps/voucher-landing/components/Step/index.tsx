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

const Step = () => {
  const t = useFm();

  const { locale } = useRouter();
  const { content } = campaignLang[locale] || {};

  return (
    <div className={styles.wrapper}>
      <div className={styles.stepWrap}>
        <div className={styles.title}>{content?.introTitle}</div>
        {/* <div className={styles.des}>{content?.introDesc}</div> */}
        <div className={styles.stepBox}>
          {content?.introStep?.map((item) => (
            <div className={styles.stepItem} key={item.title}>
              <div className={styles.stepNum}>
                <img src={item?.icon} alt={'icon'} />
              </div>
              <div>
                <div className={styles.stepTitle}>{item?.title}</div>
                {/* <div className={styles.stepDes}>{item?.desc}</div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step;
