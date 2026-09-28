import Decimal from 'decimal.js';

// 只适合最后下单的时候，不适合中间转换，
export const getQtyByLotsize =  (lotSize: number,qty: number,lotFraction: number) => {
    // 如qty=33568, lotSize=200, lotFraction=0, 转换后应该是33400
  if (lotSize > 1) {
      const tickDecimal = new Decimal(lotSize); // 200
      const newValueDecimal = new Decimal(Number(qty) ?? 0); // 33568
      const remainder = newValueDecimal.mod(tickDecimal); // 168
      if (Number(remainder.valueOf()) > 0) {
        const fixedValue = newValueDecimal
          .minus(remainder)
          .toFixed(lotFraction);
        return Number(fixedValue);
      }
    }

      // 如qty=31.222, lotSize=0.01, lotFraction=0, 转换后应该是31.22 
    const arr = String(lotSize).split('.') // 获取小数位
    let size = 10 ** 0; // 
    if(arr.length > 1){
      size = 10 ** arr[1].length 
    }
    return  Math.floor(qty * size) / size; // 根据当前币种的精度来
  }

