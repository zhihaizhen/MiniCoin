import Decimal from 'decimal.js';

type TNumberOrString = number | string;

/**
 * 累加
 * params: a, b, c...
 * return a + b + c
 */
export const add = (...rest: TNumberOrString[]) => {
  let result = new Decimal(rest.splice(0, 1)[0]);
  rest.forEach((v) => {
    result = new Decimal(result).add(new Decimal(v));
  });

  return result.toNumber();
};

/**
 * 累减
 * params: a, b, c...
 * return a - b - c
 */
export const sub = (...rest: TNumberOrString[]) => {
  let result = new Decimal(rest.splice(0, 1)[0]);
  rest.forEach((v) => {
    result = new Decimal(result).sub(new Decimal(v));
  });

  return result.toNumber();
};

export const getTextLen = (value: string | undefined): number => {
  if (!value || !value.length) return 0;
  const strLen = value.length || 0;
  // 一个非 BPM语言（比如中文）占 2个字符长度，BPM语言（比如英文和数字）占 1个 字符长度
  // let len = 0;
  // for (let i = 0; i < strLen; i += 1) {
  //   if (value.charCodeAt(i) > 127 || value.charCodeAt(i) === 94) {
  //     len += 2;
  //   } else {
  //     len += 1;
  //   }
  // }
  // return len;
  return strLen;
};


export const getFormatData = (val:number) => {
  if(Number.isNaN(val) || !Number.isFinite(val)){
    return 0
  }
  return val

}
