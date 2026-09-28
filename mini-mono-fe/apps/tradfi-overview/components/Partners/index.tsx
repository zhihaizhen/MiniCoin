import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import Marquee from 'react-fast-marquee';
import styles from './index.module.less';
import { basePath } from '@better-bit-fe/base-utils';

const PARTNER_LIST = ['Sumsub', 'Fireblocks', 'Coincover', 'CoinMarketCap', 'TokenInsight', 'CoinDesk', 'Chainalysis'];

const Partners: React.FC = () => {
  const fm = useFm();

  const title = fm('partner');

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.marqueeWrap}>
        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover={true}
          direction="left"
        >
          {[...PARTNER_LIST, ...PARTNER_LIST].map((name, i) => (
            <div key={i} className={styles.logoItem}>
              <img className={styles.partnerLogo} src={`${basePath}/images/partners/${name}.svg`} alt={name} />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Partners;
