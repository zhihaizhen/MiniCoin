import { Env } from '@region-lib/env';
import {
  guid as Guid,
  intercept,
  isNumber,
  toThousands
} from '@unified/helpers';
import { addCookie, getCookie } from 'by-storage';

const { GUID_KEY } = Env;

let host;
if (process.browser) {
  host = window && window.location.host;
}
// const { host } = window && window.location;
export const domain =
  host?.indexOf('localhost') !== -1
    ? 'localhost'
    : host?.replace(/^www|m|testnet/, '');

export const getCoinFromSymbol = (symbol = '') => {
  const coinArr = `${symbol}`.split(/USD/);
  if (coinArr.length > 1) return coinArr[0];
  return symbol;
};

export function getGuid() {
  let guid = getCookie(GUID_KEY);
  if (!guid || guid.length !== 36) {
    guid = Guid();
  }

  // Do this to refresh cookie's remaining time.
  addCookie(GUID_KEY, guid, domain, '/', 120 * 24 * 60);

  return guid;
}

export const toInterceptNumber = (number, precision) =>
  Number(intercept(number, precision));
export const toNumberZero = (number) =>
  Number.isNaN(Number(number)) ? 0 : Number(number);

export const numberTostring = (number) => {
  if ((!!number || number === 0) && isNumber(number)) {
    return String(number);
  }
  return number;
};

export const toThousandsNumber = (number, precision) => {
  let newNumber = toThousands(number, precision);
  if (!precision) newNumber = newNumber.replace('.', '');
  return newNumber;
};

export const isMobile = () => {
  return navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );
};

export const filterObject = (obj, filterFn) => {
  if (typeof obj !== 'object') {
    return obj;
  }
  const newObj = {};
  Object.keys(obj)
    .filter((key) => {
      return filterFn(obj[key]);
    })
    .forEach((key) => {
      newObj[key] = obj[key];
    });
  return newObj;
};

// toNonExponential(12.34) => 12.34
// toNonExponential(1e-8) => 0.00000001
// toNonExponential(-123) => '-123'
// toNonExponential(1.2345e-8) => 0.000000012345
export function toNonExponential(num) {
  if (typeof num === 'number') {
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
  }
  return num;
}

function replaceTags(pendingUpdateSymbol, symbolWithTag = {}) {
  return {
    ...pendingUpdateSymbol,
    symbolTags: symbolWithTag.tagName || pendingUpdateSymbol.symbolTags || ''
  };
}

export const updateSymbolTags = (
  pendingUpdateSymbols,
  symbolWithTags = { tagsList: [] }
) => {
  if (!symbolWithTags.tagsList.length) {
    return pendingUpdateSymbols;
  }
  const tagSymbolMap = {};
  symbolWithTags.tagsList.forEach((symbol) => {
    tagSymbolMap[symbol.symbolName] = symbol;
  });
  if (Array.isArray(pendingUpdateSymbols)) {
    const newSymbols = [];
    pendingUpdateSymbols.forEach((symbol) => {
      const { symbolName } = symbol;
      newSymbols.push(replaceTags(symbol, tagSymbolMap[symbolName]));
    });
    return newSymbols;
  }
  const newSymbols = {};
  Object.entries(pendingUpdateSymbols).forEach(([key, symbol]) => {
    newSymbols[key] = replaceTags(symbol, tagSymbolMap[key]);
  });
  return newSymbols;
};
