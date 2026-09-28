import { EventEmitter } from 'events';
import { parseUrl, Env } from '@region-lib/env';
// import { getServiceHost } from '@region/by-route-finder';
import { getlocalStorage } from './storageData';
import { initRoute, ROUTE_CHOSEN, domainList } from './routeSwitchInit';

function getServiceHostFormat() {
  return {
    API2_HOST: Env.API_HOST,
    WS2_HOST: Env.WS_HOST
  };
}
const event = new EventEmitter();
const DOMAIN_CHANGE = 'domainChange';

const emitRouterChanged = (route) => event.emit(DOMAIN_CHANGE, route);
const onRouterChanged = (callback) => event.on(DOMAIN_CHANGE, callback);
const getNewHost = (prefix, domain) => {
  const { envName, protocol } = parseUrl();
  const host =
    envName === 'www'
      ? [prefix, domain].join('.')
      : [`${prefix}-${envName}`, domain].join('.');
  return `${protocol}//${host}`;
};

const getNewApiHost = (route) => {
  if (route) {
    return getNewHost('api2', route);
  }
  return getServiceHostFormat().api2Host;
};

const getNewWsHost = (route) => {
  if (route) {
    const NEW_WS_HOST = getNewHost('ws2', route)
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    return NEW_WS_HOST;
  }
  return getServiceHostFormat().WS2_HOST;
};
const routerCb = (route, needReload = true) => {
  //  console.log('routerSwitchEvent, route', route);
  if (route) {
    let domain = route;
    if (route === 'auto') {
      domain = initRoute.domain;
    }
    // 重新执行函数
    api2Host = getNewApiHost(domain);
    wsHost = getNewWsHost(domain);
    if (window && needReload) {
      window && window.location.reload();
    }
  }
};
let api2Host = getServiceHostFormat().API2_HOST;
let wsHost = getServiceHostFormat().WS2_HOST;

// 1.获取本地存储
const savedDomain = getlocalStorage(ROUTE_CHOSEN);
// 2.确定这个域名是存在的
const index = domainList.findIndex((item) => item === savedDomain);

// 3.更新接口的domain
if (index || index === 0) {
  routerCb(domainList[index], false);
}

// 4. 监听路由变化
onRouterChanged(routerCb);

export { emitRouterChanged, onRouterChanged, api2Host, wsHost };
