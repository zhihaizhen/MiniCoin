
import { toThousands } from '@unified/helpers';
import BigNumber from 'bignumber.js';

export const decimalFn = (coin = 'BTC') => {
  const fundingWallet = localStorage.getItem('fundingWallet');
  if (fundingWallet) {
    const assets = JSON.parse(fundingWallet);
    return assets?.[coin]?.display_coin_decimal;
  }
  return 4;
};


export const formatNum = (num, coin = 'BTC') => {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(num)) {
    return '--';
  }
  if (num === 0 || num === '-0' || !num) {
    return 0;
  }

  // const [, decimal = 4] = String(num).split('.');
  const decimal = coin === 'fiat' ? 2 : decimalFn(coin);
  const regexp = /(?:\.0*|(\.\d+?)0+)$/; // delete zero at the end
  return toThousands(num, decimal).replace(regexp, '$1');
};

export const formatApr = (num) => {
  if (isNaN(num) || num === undefined || num === null) {
    return '-';
  }
  return `${new BigNumber(num).multipliedBy(100).toString()} %`;
};
export const toThousandsNumberNoZero = (number, precision) => {
  if (number === undefined || number === null || isNaN(Number(number))) {
    return '0';
  }
  const bn = new BigNumber(number);
  const rounded = bn.toFixed(precision);
  return new BigNumber(rounded).toFormat();
};

