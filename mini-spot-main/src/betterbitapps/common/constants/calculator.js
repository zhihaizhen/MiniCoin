export const PROFIT_CAL = 'profit_cal';
export const CLOSE_PRICE = 'closePrice_cal';
export const LIQ_PRICE_CAL = 'liquidationPrice_cal';
export const AVERAGE_OPEN_PRICE = 'openPrice_cal';
export const MAKER_RATE = 0.0006;
export const MAKER_RATE_ADD = 1 + MAKER_RATE;
export const MAKER_RATE_MINUS = 1 - MAKER_RATE;

export const LONG = 'long';
export const SHORT = 'short';

export const parseLeverageMarks = (section) =>
  (section || [1, 10, 25, 50]).reduce(
    (prev, cur) => {
      if (Number(cur) > 1 && Number(cur) < 10) {
        return prev;
      }
      return {
        ...prev,
        [cur]: `${cur}x`,
      };
    },
    { 1: '1x' },
  );
