
import { getLang } from 'common/utils/storageData';

const getLangPrefixFromPathname = (pathname = '') => {
  // Match "/zh-CN/xxx" or "/en-US/xxx"
  const match = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/)/);
  const lang = match?.[1] || getLang();
  return lang ? `/${lang}` : '';
};

export const getSymbolUrl = ({ symbolFullName }) => {
  const langPrefix = getLangPrefixFromPathname(
    typeof window === 'undefined' ? '' : window.location.pathname,
  );
  return `${langPrefix}/spot/exchange/${symbolFullName}`;
};

export const goSymbolUrl = ({ symbolFullName }) => {
  if (typeof window === 'undefined') return;
  const langPrefix = getLangPrefixFromPathname(window.location.pathname);
  const nextPath = `${langPrefix}/spot/exchange/${symbolFullName}`;
  // 只更新 URL（不整页刷新），让应用自身状态驱动视图变化
  window.history.replaceState(
    null,
    document.title,
    `${nextPath}${window.location.search}${window.location.hash}`,
  );
};

// 判断是否Kline标记价格
export const isMark = (symbol) => symbol.indexOf('.') === 0;

// mark转换成旧格式
export const klineResultCompatible = (list, symbol) => {
  if (!isMark(symbol)) {
    return list;
  }
  const newList = [];
  list.forEach((item) => {
    let newItem = {};
    newItem = {
      startAt: item[0] / 1000, // 统一使用s，market原先就是s
      open: Number(item[1]), // 新接口返回的是string，需要转换成number
      close: Number(item[2]),
      high: Number(item[3]),
      low: Number(item[4]),
    };
    newList.push(newItem);
  });
  return newList;
};
