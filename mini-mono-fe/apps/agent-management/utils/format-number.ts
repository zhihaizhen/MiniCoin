import BigNumber from 'bignumber.js';

export const formatNumberClean = (
  value: string | number,
  opt = { nullIndicator: '-', prefix: '', suffix: '' }
) => {
  const number = BigNumber(`${value}`);

  if (number?.isNaN() || !number?.isFinite()) {
    return opt?.nullIndicator;
  }

  return `${opt?.prefix}${number?.toFormat()}${opt?.suffix}`;
};

export const formatNumberAddPrefix = (value: string | number) => {
  if (!value) return 0;
  if (Number(value) === 0) {
    return 0;
  } else {
    return Number(value) > 0 ? `+${value}` : `-${value}`;
  }
};

export const numberWithCommas = (val) => {
  if (val === '0' || val === 0) {
    return 0;
  } else if (!val) {
    return '-';
  } else {
    return val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
  }
};
