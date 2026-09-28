import BigNumber from 'bignumber.js';

export const formatNumberClean = (
  value: string | number,
  opt = { nullIndicator: '-', prefix: '', suffix: '' }
) => {
  const number = BigNumber(`${value}`);

  if (number?.isNaN() || !number?.isFinite()) {
    return opt?.nullIndicator;
  }

  return number.toFormat();
};
