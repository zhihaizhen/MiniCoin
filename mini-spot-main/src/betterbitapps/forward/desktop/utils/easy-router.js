import { getLang } from 'common/utils/storageData';

export function getSymbolInfoOnUrl(allSpotTokenConfig) {
  const prePath = '/spot/exchange/';
  // 获取完整路径，移除语言前缀
  const fullPath = window.location.pathname;
  const langPrefixRegex = /^\/[a-z]{2}(-[A-Z]{2})?\//;
  const pathWithoutLang = fullPath.replace(langPrefixRegex, '/');

  // 获取路由上的币种
  const routeSymbol = pathWithoutLang.replace(prePath, '')?.toUpperCase();  // BTC/USDT
  const [baseTokenName,quoteTokenName ] = routeSymbol.split('/');
  // 查看币种是否在配置的列表内
  const config = allSpotTokenConfig?.[quoteTokenName]?.[baseTokenName];
  // console.log('getSymbolInfoOnUrl 数据',config, allSpotTokenConfig,baseTokenName, quoteTokenName);
  if(config){
    return {
      symbol:baseTokenName,
      walletCoin:quoteTokenName,
      symbolConfig: config,
    }
    
  }
  return null;
}

export function getDefaultSymbolConfig(allSpotTokenConfig) {
  return  allSpotTokenConfig?.USDT?.BTC;
}

// 切换symbol后修改path
export function setEasyRouter(symbolConfig) {
  const currentPathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const langMatch = currentPathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/)/);
  const currentLang = langMatch?.[1] || getLang();

  const symbolFullName =
    symbolConfig?.symbolFullName ||
    (symbolConfig?.symbol && symbolConfig?.walletCoin
      ? `${symbolConfig.symbol}/${symbolConfig.walletCoin}`
      : '');

  // 构建标准化的URL：保留语言前缀，只替换币对段
  const url = `/${currentLang}/spot/exchange/${symbolFullName}`;
  if (symbolConfig?.symbol) {
    // 使用pushState更新URL，这样更改会被记录在浏览器历史中
    // 如果只想替换当前URL而不添加新条目，使用replaceState
    window.history.replaceState(
      {
        symbol: symbolConfig.symbol,
        symbolAlias: symbolConfig?.symbolAlias,
      },
      document.title,
      `${url}${window.location.search}${window.location.hash}`,
    );
  }
}

// 添加新的工具函数，用于在应用初始化时确保URL包含语言前缀
export function ensureLanguagePrefix() {
  if (typeof window === 'undefined') return;

  const { pathname } = window.location;
  const currentLang = getLang();

  // 检查URL是否已经包含语言前缀
  const hasLangPrefix = /^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/.test(pathname);

  if (!hasLangPrefix && pathname !== '/') {
    // 仅在非根路径且没有语言前缀时添加
    const newPath = `/${currentLang}${pathname}${window.location.search}`;
    window.history.replaceState(null, document.title, newPath);
  }
}
