import { Env } from '@region-lib/env';
import { useInViewport } from 'ahooks';
import defaultDark from 'common/assets/images/coins/default-dark.png';
import defaultLight from 'common/assets/images/coins/default-light.png';
import { TRADE_THEMES } from 'common/packages-biz/global-settings';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { Img } from 'react-image';
import './index.less'

const DEFAULT_IMGS = {
  dark: defaultDark,
  light: defaultLight,
};
const CDN_HOST = 'https://cdn.easicoin.io'; 
const publicUrl = `/icon`;

// const transUrl = (coin, theme) => {
//   if (coin) {
//     return `${publicUrl}/${theme}/${coin?.toLowerCase()}.png`
//   }
//   return DEFAULT_IMGS[theme]
// }

const transUrl = (coin) => {
  if (coin) {
    return `${publicUrl}/dark/${coin?.toLowerCase()}.png`
  }
  return DEFAULT_IMGS.dark
}



const generatorW2H = (size) => ({
  width: `var(--size-${size})`,
  height: `var(--size-${size})`,
  lineHeight: `var(--size-${size})`,
  maxHeight: `var(--size-${size})`,
  maxWidth: `var(--size-${size})`,
});

const CoinsIcon = ({ coin, theme, className, size }) => {
  const ref = useRef();
  const url = useMemo(() => transUrl(coin, theme), [coin, theme]);
  const inViewPort = useInViewport(ref);
  const [first, setFirst] = useState(true);

  const defaultImg = useMemo(() => DEFAULT_IMGS[theme] || defaultDark, [theme]);

  return (
    <div
      ref={ref}
      style={generatorW2H(size)}
      className={`${className} icon-box`}
    >
      <If condition={inViewPort || !first}>
        <Img
          src={[url, defaultImg]}
          alt={coin}
          style={{ width: '100%', height: '100%', display: 'block' }}
          loader={
            <span
              style={{ color: 'var(--bg-secondary)' }}
              className="circle-loading icon iconfont icon-loading"
            />
          }
          onLoad={() => {
            setFirst(false);
          }}
        />
      </If>
    </div>
  );
};

CoinsIcon.defaultProps = {
  theme: TRADE_THEMES.LIGHT,
  className: undefined,
  size: 20,
  coin: undefined,
};

CoinsIcon.propTypes = {
  coin: PropTypes.string,
  theme: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.number,
};

export default CoinsIcon;
