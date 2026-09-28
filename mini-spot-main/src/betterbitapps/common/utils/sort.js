import { deepClone, isNaN } from '@unified/helpers';

function compare(key, type = 'up') {
  return function sortGen(m, n) {
    const a = isNaN(Number(m[key])) ? m[key]?.toUpperCase() : Number(m[key]);
    const b = isNaN(Number(n[key])) ? n[key]?.toUpperCase() : Number(n[key]);

    if (a < b) {
      return type === 'up' ? -1 : 1;
    }
    if (a > b) {
      return type === 'up' ? 1 : -1;
    }
    return 0;
  };
}

export function sortDown(list, key) {
  const tempList = deepClone(list);
  return tempList.sort(compare(key, 'down'));
}

export function sortUp(list, key) {
  const tempList = deepClone(list);
  return tempList.sort(compare(key, 'up'));
}
