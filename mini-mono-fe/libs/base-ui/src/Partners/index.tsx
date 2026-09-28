import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import Marquee from 'react-fast-marquee';

import SumsubLogo from './images/Sumsub.svg';
import FireblocksLogo from './images/Fireblocks.svg';
import CoincoverLogo from './images/Coincover.svg';
import CoinMarketCapLogo from './images/CoinMarketCap.svg';
import TokenInsightLogo from './images/TokenInsight.svg';
import CoinDeskLogo from './images/CoinDesk.svg';
import ChainalysisLogo from './images/Chainalysis.svg';

const PARTNER_LIST = [
  { name: 'Sumsub', src: SumsubLogo },
  { name: 'Fireblocks', src: FireblocksLogo },
  { name: 'Coincover', src: CoincoverLogo },
  { name: 'CoinMarketCap', src: CoinMarketCapLogo },
  { name: 'TokenInsight', src: TokenInsightLogo },
  { name: 'CoinDesk', src: CoinDeskLogo },
  { name: 'Chainalysis', src: ChainalysisLogo }
];

const DOUBLED = [...PARTNER_LIST, ...PARTNER_LIST];

const Partners: React.FC = () => {
  const fm = useFm();

  return (
    <section style={{ width: '100%', padding: '120px 0 0' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: 40,
            lineHeight: '52px',
            color: 'var(--text-primary, #fff)',
            textAlign: 'center',
            margin: 0,
            width: '100%'
          }}
        >
          {fm('partner')}
        </h2>
      </div>
      <div
        style={{
          width: '100%',
          height: 88,
          display: 'flex',
          alignItems: 'center',
          marginTop: 40
        }}
      >
        <Marquee speed={50} gradient={false} pauseOnHover direction="left">
          {DOUBLED.map((partner, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', margin: '0 30px' }}
            >
              <img
                src={partner.src}
                alt={partner.name}
                style={{
                  height: 30,
                  flexShrink: 0,
                  opacity: 0.6,
                  filter: 'grayscale(100%) brightness(2)',
                  transition: 'opacity 0.3s'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.6';
                }}
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Partners;
