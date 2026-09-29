export function formatDecimal(
  value: string,
  fixNum = 4,
  plusMinus = false
) {
  if (value === '--') {
    return value;
  }
  // 保留fixNum位小数，直接截断(向下)
  const percent = 10 ** fixNum;
  const val1 = Math.floor(Number(value) * percent) / percent;
  // 小数位为0的直接去掉
  const val = String(val1).replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');

  return  val
  // // 加千分位
  // let res ;
  // if (val?.includes('.')) {
  //   const splitValue = val.split('.');
  //   const formatInt = Number(splitValue[0]).toLocaleString();
  //   const decimals = splitValue[1];
  //   res = formatInt + '.' + decimals;
  // } else {
  //   res = Number(val).toLocaleString();
  // }
  // 补+—号
  // if (plusMinus) {
  //   return Number(val) < 0 ? `-${res}` : `+${res}`;
  // }
  // return res;
}
