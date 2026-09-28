import React, { useState } from 'react';
import styles from './index.module.less';
import { useRouter } from 'next/router';
import campaignLang from '../../mini-translation-temp/Campaign.json';

const ActivityRules = () => {
  const { locale } = useRouter();
  const { content } = campaignLang[locale] || {};

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{content?.rulesTitle}</div>
      <div
        className={styles.desc}
        dangerouslySetInnerHTML={{ __html: content?.rulesContent }}
      ></div>
    </div>
  );
};

export default ActivityRules;
