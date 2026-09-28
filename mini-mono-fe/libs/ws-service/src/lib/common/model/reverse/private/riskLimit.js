import { toNumberZero } from '../../../utils/utils';

export const riskLimit = (data = {}) => {
  const { maxLeverageE2, startingMarginE8, maintainMarginE8, ...others } = data;
  return {
    ...others,
    maxLeverageE2,
    maxLeverage: toNumberZero(maxLeverageE2 / 1e2),
    startingMarginE8,
    startingMargin: toNumberZero(startingMarginE8 / 1e10),
    maintainMarginE8,
    maintainMargin: toNumberZero(maintainMarginE8 / 1e10)
  };
};
