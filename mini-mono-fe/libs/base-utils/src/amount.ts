import { BigNumber } from 'bignumber.js';

export class GtdBigNumber extends BigNumber {
  // new GtdBigNumber(1000.111)._ceil(2) => 1000.12
  _ceil(value = 0): BigNumber {
    return this.dp(value, BigNumber.ROUND_CEIL);
  }

  // new GtdBigNumber(1000.111)._floor() => 1001
  _floor(value = 0): BigNumber {
    return this.dp(value, BigNumber.ROUND_FLOOR);
  }

  // new GtdBigNumber(0.1111)._percentage(2) => 11.11
  _percentage(value = 0): BigNumber {
    return this.multipliedBy(100).dp(value);
  }
}

const genBigNumber = (arr: number[] | string[]): GtdBigNumber[] => {
  if (arr.length === 0) return [new GtdBigNumber(0)];
  // 兼容传参([[0,1,2,3]])
  if (Array.isArray(arr[0]) && arr[0].length > 0) {
    return arr[0].map((k) => new GtdBigNumber(k));
  }
  return arr.map((k) => new GtdBigNumber(k));
};

/**
 * https://mikemcl.github.io/bignumber.js/#plus
 * plus
 * exam1: plus('1','1')               => xx.toFixed() => '2'
 * exam2: plus(1,1,1)                 => xx.toNumber() => 3
 * exam3: plus(1000,10000,100000)     => xx.toFormat() => '111,000'
 * exam4: plus(1,1000,1000000,0.3333) => xx.toFormat(2) => '1,001,001.33'
 * exam5: plus(1,1000,1000000,0.3333) => xx._ceil(2).toFormat() => '1,001,001.34'
 * exam6: plus(1,1000,1000000,0.3393) => xx._floor(2).toFormat() => '1,001,001.33'
 */
export const plus = (...arr): GtdBigNumber =>
  genBigNumber(arr).reduce((prev, curr) => new GtdBigNumber(prev.plus(curr)));

/**
 * https://mikemcl.github.io/bignumber.js/#minus
 * minus
 * For example refer to the plus above
 */
export const minus = (...arr): GtdBigNumber =>
  genBigNumber(arr).reduce((prev, curr) => new GtdBigNumber(prev.minus(curr)));

/**
 * https://mikemcl.github.io/bignumber.js/#mod
 * mod
 * For example refer to the plus above
 */
export const mod = (
  n: number | string | GtdBigNumber,
  base: number | string | GtdBigNumber
): GtdBigNumber => new GtdBigNumber(new GtdBigNumber(n).modulo(base));

/**
 * https://mikemcl.github.io/bignumber.js/#times
 * multiple
 * For example refer to the plus above
 */
export const multiple = (...arr): GtdBigNumber =>
  genBigNumber(arr).reduce(
    (prev, curr) => new GtdBigNumber(prev.multipliedBy(curr))
  );

/**
 * https://mikemcl.github.io/bignumber.js/#div
 * divided
 *  For example refer to the plus above
 */
export const div = (...arr): GtdBigNumber =>
  genBigNumber(arr).reduce((prev, curr) => new GtdBigNumber(prev.div(curr)));

/**
 * https://mikemcl.github.io/bignumber.js/#isNaN
 * @param n
 * @returns
 */
export const isNaN = (n: number | string | BigNumber): boolean =>
  new BigNumber(n).isNaN();

/**
 *  Returns |                                                               |
 * :-------:|:--------------------------------------------------------------|
 *     1    | If the value of this BigNumber is greater than the value of `n`
 *    -1    | If the value of this BigNumber is less than the value of `n`
 *     0    | If this BigNumber and `n` have the same value
 *  `null`  | If the value of either this BigNumber or `n` is `NaN`
 *
 * ```ts
 *
 * x = new BigNumber(Infinity)
 * y = new BigNumber(5)
 * x.comparedTo(y)                 // 1
 * x.comparedTo(x.minus(1))        // 0
 * y.comparedTo(NaN)               // null
 * y.comparedTo('110', 2)          // -1
 * ```
 * @param n A numeric value.
 * @param [base] The base of n.
 */
export const cmp = (
  a: number | string | BigNumber,
  b: number | string | BigNumber
): 1 | -1 | 0 | null => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new BigNumber(a).comparedTo(b);
};

/**
 * 10 >= 1 => true
 * 10 >= 11 => false
 * @param a
 * @param b
 * @returns
 */
export const greaterAndEqual = (
  a: number | string | BigNumber,
  b: number | string | BigNumber
): boolean => {
  const result = new BigNumber(a).comparedTo(b);
  return result === 0 || result === 1;
};
export const grEq = (
  a: number | string | BigNumber,
  b: number | string | BigNumber
): boolean => greaterAndEqual(a, b);

/**
 * 10 >= 1 => true
 * 10 >= 11 => false
 * @param a
 * @param b
 * @returns
 */
export const lessAndEqual = (
  a: number | string | BigNumber,
  b: number | string | BigNumber
): boolean => {
  const result = new BigNumber(a).comparedTo(b);
  return result === 0 || result === -1;
};
export const leEq = (
  a: number | string | BigNumber,
  b: number | string | BigNumber
): boolean => greaterAndEqual(a, b);

/**
 * exam1: fmtAmount(10000) => '10,000'
 * exam2:
 *       fmtAmount(1000000, {short: true}) => '1m'
 *       fmtAmount(9000000000, {short: true}) => '9b'
 * exam3: fmtAmount(1000, {symbol: true}) => '+10,00'
 * exam4: fmtAmount(0.891711, {symbol: true, percentage: true}) => '+89.17%'
 * exam5: fmtAmount(10000.891711, {formatNum: 2}) => '10,000.89'
 * @param num
 * @param options
 * @returns
 */
export const fmtAmount = (
  num: number | string | GtdBigNumber,
  options?: {
    short?: boolean;
    symbol?: boolean;
    percentage?: boolean;
    formatNum?: number;
  }
): string => {
  if (isNaN(num)) {
    return num + '';
  }
  let result: string;
  if (options?.short) {
    if (grEq(num, 1e9)) {
      result = `${div(num, 1e9).toFixed(options?.formatNum || null)}b`;
    } else if (grEq(num, 1e6)) {
      result = `${div(num, 1e6).toFixed(options?.formatNum || null)}m`;
    } else {
      result = new BigNumber(num).toFormat();
    }
  } else if (options?.percentage) {
    result = new BigNumber(multiple(num, 100).toFixed(2)).toFormat();
  } else {
    if (options?.formatNum) {
      result = new BigNumber(num).toFormat(options.formatNum);
    } else {
      result = new BigNumber(num).toFormat();
    }
  }

  if (options?.symbol && (num as number) > 0) {
    result = '+' + result;
  }

  if (options?.percentage) {
    result = result + '%';
  }

  return result;
};

/**
 * Refer to fmtAmount example 2 above
 * @param num
 * @returns
 */
export const fmtAmountShort = (num: number | string | GtdBigNumber): string =>
  fmtAmount(num, { short: true });

/**
 * Refer to fmtAmount example 3 above
 * @param num
 * @returns
 */
export const fmtAmountSymbol = (num: number | string | GtdBigNumber): string =>
  fmtAmount(num, { symbol: true });

/**
 * Refer to fmtAmount example 4 above
 * @param num
 * @returns
 */
export const fmtAmountPercentage = (
  num: number | string | GtdBigNumber
): string => fmtAmount(num, { percentage: true });

export const cleanNumber = (num: string): string => {
  let [int, dec] = num.split('.');
  int = int.replace(/^0+/, '');
  if (int === '') {
    int = '0';
  }
  if (dec) {
    dec = dec.replace(/0+$/, '');
  }
  return `${int}${dec ? `.${dec}` : ''}`;
};
