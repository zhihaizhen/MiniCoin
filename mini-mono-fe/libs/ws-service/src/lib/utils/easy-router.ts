import queryString from 'query-string';
export function getSymbol(symbols = {}) {
  // const symbol =
  //   window &&
  //   window.location.pathname
  //     .replace(`${process.env.MARVEL_APP_PUBLIC_PATH}/`, '')
  //     ?.toUpperCase();
  const queryParams = queryString.parse(window && window.location.search);
  const symbol = queryParams?.symbol?.toUpperCase();
  if (symbols[symbol]) {
    return symbol;
  }
  return null;
}

export function setDefaultRouter(symbols) {
  if (!symbols || !getSymbol(symbols)) {
    window.history.replaceState({}, undefined, '/');
  }
}

// 切换symbol后修改path
export function setEasyRouter(symbolConfig) {
  if (symbolConfig?.symbol) {
    window.history.replaceState(
      { title: '', url: window && window.location.href },
      undefined,
      `/trade/usdt/${symbolConfig?.symbol}`
    );
  }
}
