import React from 'react';
import { useRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';
import { WebmAnimation } from 'libs/base-ui/src/WebmAnimation';
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const GlobalAssets: React.FC = () => {
  const { locale } = useRouter();
  const isChinese = locale?.startsWith('zh');
  const chartSrc = isChinese
    ? `${basePath}/images/global-assets-chart.mp4`
    : `${basePath}/images/global-assets-chart-en.mp4`;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <FormattedMessage
            id="global-assets-title"
            values={{
              highlight: (text) => <span className={styles.highlight}>{text}</span>
            }}
          />
        </h2>
        <div className={styles.chartWrap}>
          <WebmAnimation
            className={styles.chartImg}
            loopSrc={chartSrc}
          />
        </div>
      </div>
    </section>
  );
};

export default GlobalAssets;
