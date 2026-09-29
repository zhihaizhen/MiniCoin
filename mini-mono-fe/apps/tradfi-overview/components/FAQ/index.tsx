import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { normalizeLocale } from '@better-bit-fe/base-utils';
import { ReactComponent as ArrowRightSVG } from '~/public/images/arrow-right.svg';
import { Rules } from '@better-bit-fe/base-ui';
import styles from './index.module.less';

const FAQ: React.FC = () => {
  const t = useFm();
  const { locale } = useRouter();

  const gotoHelpCenter = () => {
    const lang = normalizeLocale(locale);
    window.open(`https://easicoin.zendesk.com/hc/${lang}`);
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.coreContent}>
        <Rules
          className={styles.rules}
          headTitle={t('commonQuestion')}
          campaignCode="tradfi"
          type='collapse'
          showOrder={false}
        />
        <div className={styles.help} onClick={gotoHelpCenter}>
          {t('helpCenter')}
          <ArrowRightSVG />
        </div>
      </div>
    </section>
  );
};

export default FAQ;
