import { parseUrl } from '@region-lib/env';
import { getlocalStorage } from './storageData';

// auto取是当前rrt最小的，可能是下面三个线路中的任意一个
let envName;
try {
  envName = parseUrl().envName; // env取值: test、testnet、prod
} catch (error) {
  console.log(error);
}

const ROUTE_CHOSEN = 'region_route_chosen';

// step1 获取用户上次的route选择
const localDomain = typeof window ? getlocalStorage(ROUTE_CHOSEN) : '';

// step2 获取当前的主域名, dev环境用
let locationDomain = '';
if (process.browser) {
  locationDomain =
    (window && window.location.hostname.split('.').slice(1).join('.')) || '';
}

// step3 初始化route和list
const initRoute = {
  domain: locationDomain,
  api2: `//api2-${envName}.${locationDomain}`
};

// dev和test
const list = [
  {
    domain: 'auto'
  },
  {
    domain: '',
    api2: ``
  }
];

const domainList = ['auto', ''];

const locationIndex = list.findIndex((item) => item.domain === locationDomain);
const localIdExit = locationIndex > -1;
let currentDomain = {
  idx: localIdExit ? locationIndex : 1,
  item: localIdExit ? list[locationIndex] : initRoute
};
if (localDomain) {
  const localIndex = list.findIndex((item) => item.domain === localDomain);
  if (localIndex > -1 || localIndex === 0) {
    currentDomain = {
      idx: localIndex,
      item: list[localIndex]
    };
  }
}

export { list, domainList, currentDomain, initRoute, ROUTE_CHOSEN };
