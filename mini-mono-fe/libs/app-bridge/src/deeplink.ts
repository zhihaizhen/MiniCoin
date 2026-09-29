// @ts-nocheck
function isApp() {
  return navigator.userAgent.toLowerCase().includes('bit_app');
}

function isSpotLtLandingPage(path: string) {
  return ['/trade/spot/act/lt-landing-page/'].includes(path);
}

function getPlainPath(path: string) {
  let plainPath = path.replace(/\/[a-z]{2,3}-[A-Z\d]{2,3}\//, '/');

  if (!plainPath.endsWith('/')) {
    plainPath += '/';
  }

  return plainPath;
}

function isLogin(path: string) {
  return path === '/login/';
}

function isSignup(path: string) {
  return path === '/register/';
}

function isDeposit(path: string) {
  return path === '/fiat/deposit/';
}

function isBuyCrypto(path: string) {
  return ['/fiat/trade/express/home/', '/fiat/purchase/crypto/'].includes(path);
}

function isMarkets(path: string) {
  return [
    '/data/markets/',
    '/data/markets/collect/',
    '/data/markets/contract/',
    '/data/markets/spot/',
    '/data/markets/reference/'
  ].includes(path);
}

function isSpot(path: string) {
  return /^\/trade\/spot\/([A-Z\d]+\/[A-Z]+\/)?$/.test(path);
}

function isInversePerpetual(path: string) {
  return /^\/trade\/inverse\/([A-Z]+\/)?$/.test(path);
}

function isUSDTPerpetual(path: string) {
  return /^\/trade\/usdt\/([A-Z\d]+USDT\/)?$/.test(path);
}

function isInverseFutures(path: string) {
  return /^\/trade\/inverse\/futures\/[A-Z]+_(Q|BIQ|NBIQ)\/$/.test(path);
}

function isUSDCPerpetual(path: string) {
  return /^\/trade\/futures\/usdc\/([A-Z]+-[A-Z]+\/)?$/.test(path);
}

function isUSDCOptions(path: string) {
  return /^\/trade\/option\/usdc\/([A-Z]+\/)?$/.test(path);
}

function isByfi(path: string) {
  return ['/earn/', '/earn/home/'].includes(path);
}

function isDefiMining(path: string) {
  return path === '/earn/defi-mining/';
}

function isDualAssetMining(path: string) {
  return path === '/earn/dual-asset-mining/';
}

function isLaunchpool(path: string) {
  return path === '/earn/launchpool/';
}

function isSavings(path: string) {
  return ['/earn/flexible-staking/', '/earn/savings/'].includes(path);
}

function isLiquidityMining(path: string) {
  return path === '/earn/liquidity-mining/';
}

function isSharkFin(path: string) {
  return path === '/earn/structured-product/';
}

function isP2P(path: string) {
  return [
    '/fiat/trade/otc/',
    '/fiat/trade/otc/advertiser/',
    '/fiat/trade/otc/advertiser/all/',
    '/fiat/trade/otc/orderList/',
    '/fiat/trade/otc/profile/'
  ].includes(path);
}

function isBot(path: string) {
  return path === '/tradingbot/';
}

function isAccount(path: string) {
  return ['/user/assets/home/', '/user/assets/home/overview/'].includes(path);
}

function isSpotAccount(path: string) {
  return [
    // Spot account
    '/user/assets/home/spot/',
    // Spot records
    '/user/assets/records/trade-spot/',
    '/user/assets/records/trade-spot/deposit/',
    '/user/assets/records/trade-spot/withdraw/',
    '/user/assets/records/trade-spot/transfer/',
    '/user/assets/records/trade-spot/fiat/',
    '/user/assets/records/trade-spot/p2p/',
    '/user/assets/records/trade-spot/other/',
    // Spot orders
    '/user/assets/order/spot-current-orders/active/',
    '/user/assets/order/spot-current-orders/conditional/',
    '/user/assets/order/spot-orders/active/',
    '/user/assets/order/spot-orders/conditional/',
    '/user/assets/order/spot-history/active/'
  ].includes(path);
}

function isDerivativesAccount(path: string) {
  return [
    // Derivatives account
    '/user/assets/home/trading/',
    // Derivatives records
    '/user/assets/records/trade/',
    '/user/assets/records/trade/deposit/',
    '/user/assets/records/trade/exchange/',
    '/user/assets/records/trade/other/',
    // Derivatives orders
    '/user/assets/order/all-orders/',
    '/user/assets/order/all-orders/inverse/',
    '/user/assets/order/all-orders/usdt/',
    '/user/assets/order/all-orders/futures/',
    '/user/assets/order/closed-pnl/',
    '/user/assets/order/closed-pnl/inverse/',
    '/user/assets/order/closed-pnl/usdt/',
    '/user/assets/order/closed-pnl/futures/',
    '/user/assets/order/trade-history/',
    '/user/assets/order/trade-history/inverse/',
    '/user/assets/order/trade-history/usdt/',
    '/user/assets/order/trade-history/futures/'
  ].includes(path);
}

function isByfiAccount(path: string, url: URL) {
  return (
    // ByFi account
    (path === '/user/assets/home/financial/' &&
      url.searchParams.get('faTransfer') !== 'true') ||
    [
      // ByFi records
      '/earn/wallet-records/',
      // ByFi orders
      '/user/assets/order/financial-defi-orders/',
      '/user/assets/order/financial-defi-orders/defi-order/',
      '/user/assets/order/financial-dual-asset-orders/',
      '/user/assets/order/financial-dual-asset-orders/dual-asset-order/',
      '/user/assets/order/financial-launchpool-orders/',
      '/user/assets/order/financial-launchpool-orders/launchpool-order/',
      '/user/assets/order/financial-flexible-staking-orders/',
      '/user/assets/order/financial-flexible-staking-orders/flexible-staking-order/'
    ].includes(path)
  );
}

function isUSDCAccount(path: string) {
  return [
    '/user/assets/home/usdcaccount/',
    '/trade/usdc/assets/transactionlogs/'
  ].includes(path);
}

function isBotAccount(path: string) {
  return path === '/user/assets/home/tradingbot/';
}

function isFundingAccount(path: string) {
  return [
    '/user/assets/home/fiat/',
    '/user/assets/records/fiat/transfer/',
    '/user/assets/records/fiat/fiat/,',
    '/user/assets/records/fiat/p2p/',
    '/user/assets/records/fiat/depositFiat/'
  ].includes(path);
}

function isTransfer(path: string, url: URL) {
  return (
    path === '/user/assets/home/financial/' &&
    url.searchParams.get('faTransfer') === 'true'
  );
}

function isReferral(path: string) {
  return path === '/referral/';
}

function isKYC(path: string) {
  return path === '/user/accounts/auth/personal/';
}

function isAboutUs(path: string) {
  return path === '/app/aboutus/aboutus/';
}

function isVIP(path: string) {
  return path === '/vip-program/';
}

function isLaunch(path: string) {
  return path === '/launch/';
}

function isRewardsHub(path: string) {
  return path === '/task-center/rewards_hub/';
}

function isMyRewards(path: string, url: URL) {
  return path === '/task-center/my_rewards/' && !url.searchParams.get('id');
}

function isRewardsDetail(path: string, url: URL) {
  return path === '/task-center/my_rewards/' && url.searchParams.get('id');
}

function isCard(path: string) {
  return path === '/fiat/cards/apply/';
}

/**
 * 需求文档：https://c1ey4wdv9g.larksuite.com/wiki/wikus2XyFsJfNFa8aQ23Xw7khOd
 *
 * spot trading 和 margin trading 的路径相同，均为：/trade/spot/BTC/USDT
 * 但是业务方需求要在APP中打开不同tab
 *
 * 因此需要可以额外配置deeplink参数，并且不能和web端的参数重复；
 * 因此在这里做一个约定：
 * 1. 在web端配置的需要deeplink透传的参数，以【deeplink_params__】为前缀；
 * 2. deeplink打开任意APP页面会携带web链接中所有的deeplink参数并去掉前缀；
 *
 * @example
 * 原本无参数：
 * /trade/spot/BTC/USDT
 * -> app://open/home?tab=3&symbol=BTCUSDT
 *
 * 带参数：
 * /trade/spot/BTC/USDT?deeplink_params__tabName=margin&deeplink_params__page=trading
 * -> app://open/home?tab=3&symbol=BTCUSDT&tabName=margin&page=trading
 *
 */
function resolveDeeplinkParams(url: URL) {
  let params = '';
  const deeplinkParamsPrefix = 'deeplink_params__';
  url.searchParams.forEach((value, key) => {
    if (key.startsWith(deeplinkParamsPrefix)) {
      params = `${params}&${key.replace(deeplinkParamsPrefix, '')}=${value}`;
    }
  });
  return params;
}

export function getNativePath(
  to: string
): { path: string; topPage: boolean } | void {
  const prefix = 'app://open';
  const url = new URL(to, window.location.href);
  const path = getPlainPath(url.pathname);

  const getMiniPath = (p: string) => {
    return `${prefix}/route?targetUrl=${encodeURIComponent(`by-mini://${p}`)}`;
  };

  if (isLogin(path)) {
    return { path: `${prefix}/login`, topPage: false };
  }

  if (isSignup(path)) {
    return { path: `${prefix}/signup?directlyRegister=true`, topPage: false };
  }

  if (isDeposit(path)) {
    return { path: `${prefix}/recharge`, topPage: false };
  }

  if (isBuyCrypto(path)) {
    return { path: `${prefix}/fiat/buycrypto`, topPage: false };
  }

  if (isMarkets(path)) {
    return { path: `${prefix}/home?tab=1`, topPage: true };
  }

  if (isSpot(path)) {
    const pair = path.replace('/trade/spot/', '');
    return {
      path: `${prefix}/home?tab=3${
        pair ? `&symbol=${pair.split('/').join('')}` : ''
      }${resolveDeeplinkParams(url)}`,
      topPage: true
    };
  }

  if (isInversePerpetual(path)) {
    const pair = path.replace('/trade/inverse/', '').replace('/', '');
    return {
      path: `${prefix}/home?tab=2&type=inverse${pair ? `&symbol=${pair}` : ''}`,
      topPage: true
    };
  }

  if (isUSDTPerpetual(path)) {
    const pair = path.replace('/trade/usdt/', '').replace('/', '');
    return {
      path: `${prefix}/home?tab=2&type=usdt${pair ? `&symbol=${pair}` : ''}`,
      topPage: true
    };
  }

  if (isInverseFutures(path)) {
    const pair = path
      .replace('/trade/inverse/futures/', '')
      // Very fragile!!!
      .replace('_Q/', '0930')
      .replace('_BIQ/', '1230')
      // Useless for now
      .replace('_NBIQ/', '1230');
    return {
      path: `${prefix}/home?tab=2&type=inverse${pair ? `&symbol=${pair}` : ''}`,
      topPage: true
    };
  }

  if (isUSDCPerpetual(path)) {
    const pair = path.replace('/trade/futures/usdc/', '').replace('/', '');
    return {
      path: `${prefix}/home?tab=2&type=usdc${pair ? `&symbol=${pair}` : ''}`,
      topPage: true
    };
  }

  if (isUSDCOptions(path)) {
    return {
      path: `${prefix}/home?tab=2&type=option`,
      topPage: true
    };
  }

  if (isByfi(path)) {
    return { path: `${prefix}/byficenter`, topPage: false };
  }

  if (isDefiMining(path)) {
    return { path: `${prefix}/byficenter?type=1`, topPage: false };
  }

  if (isDualAssetMining(path)) {
    return { path: `${prefix}/byficenter?type=2`, topPage: false };
  }

  if (isLaunchpool(path)) {
    return { path: `${prefix}/byficenter?type=3`, topPage: false };
  }

  if (isSavings(path)) {
    return { path: `${prefix}/byficenter?type=4`, topPage: false };
  }

  if (isLiquidityMining(path)) {
    return { path: `${prefix}/byficenter?type=5`, topPage: false };
  }

  if (isSharkFin(path)) {
    return { path: `${prefix}/byficenter?type=7`, topPage: false };
  }

  if (isP2P(path)) {
    return { path: `${prefix}/otc_list`, topPage: false };
  }

  if (isBot(path)) {
    return { path: getMiniPath('trading_bot/home'), topPage: false };
  }

  if (isAccount(path)) {
    return { path: `${prefix}/assets_account`, topPage: true };
  }

  if (isSpotAccount(path)) {
    return {
      path: `${prefix}/assets_account?account=1`,
      topPage: true
    };
  }

  if (isDerivativesAccount(path)) {
    return {
      path: `${prefix}/assets_account?account=2`,
      topPage: true
    };
  }

  if (isByfiAccount(path, url)) {
    return {
      path: `${prefix}/assets_account?account=3`,
      topPage: true
    };
  }

  if (isUSDCAccount(path)) {
    return {
      path: `${prefix}/assets_account?account=4`,
      topPage: true
    };
  }

  if (isBotAccount(path)) {
    return {
      path: `${prefix}/assets_account?account=5`,
      topPage: true
    };
  }

  if (isFundingAccount(path)) {
    return {
      path: `${prefix}/assets_account?account=6`,
      topPage: true
    };
  }

  if (isTransfer(path, url)) {
    const coin = url.searchParams.get('faCoin');
    return {
      path: `${prefix}/transfer${coin ? `?coin=${coin}` : ''}`,
      topPage: false
    };
  }

  if (isReferral(path)) {
    return { path: `${prefix}/referral`, topPage: false };
  }

  if (isKYC(path)) {
    return { path: `${prefix}/user/verify/kyc`, topPage: false };
  }

  if (isAboutUs(path)) {
    return { path: `${prefix}/aboutus`, topPage: false };
  }

  if (isVIP(path)) {
    return { path: `${prefix}/vip`, topPage: false };
  }

  if (isLaunch(path)) {
    return { path: getMiniPath('by_launch/index'), topPage: false };
  }

  if (isRewardsHub(path)) {
    return { path: `${prefix}/rewardshub`, topPage: false };
  }

  if (isMyRewards(path, url)) {
    return { path: `${prefix}/rewardshub/myrewards`, topPage: false };
  }

  if (isRewardsDetail(path, url)) {
    const id = url.searchParams.get('id');
    return {
      path: `${prefix}/rewardshub/rewardsdetail?awardId=${id}`,
      topPage: false
    };
  }

  if (isCard(path)) {
    return { path: getMiniPath('by_card/card-empty'), topPage: false };
  }

  // 交易赛添加的特殊需求 https://jira.yijin.io/browse/GA-2171
  if (isSpotLtLandingPage(path)) {
    return {
      path: `${prefix}/home?tab=1&pageType=spot&token=usdt&tag=16`,
      topPage: true
    };
  }
}

export async function navigate(
  url: string,
  options?: { newTab?: boolean; tryOpenApp?: boolean }
) {
  if (isApp()) {
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      try {
        window.Hecate.UrlLauncher.open({ url });
        // eslint-disable-next-line no-empty
      } catch {}
      return;
    }
    const nativePath = getNativePath(url);
    if (nativePath) {
      try {
        // Might throw in old versions of the app
        await window.Hecate.ready();
        await window.Hecate.Router.push({ path: nativePath.path });
        if (nativePath.topPage) window.Hecate.Router.pop2Home();
        return;
        // eslint-disable-next-line no-empty
      } catch {}
    }
  } else if (options?.tryOpenApp) {
    const nativePath = getNativePath(url);
    if (nativePath) {
      if (options.newTab) {
        window.open(nativePath.path);
      } else {
        window.location.href = nativePath.path;
      }
      return;
    }
  }

  if (options?.newTab) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export function injectDeepLink() {
  if (!isApp()) {
    return;
  }
  alert('injectDeepLink');

  document.addEventListener('click', async (event: MouseEvent) => {
    alert('injectDeepLink click event 1');
    const target = (event.target as HTMLElement).closest('a');
    if (!target) return;
    const href = target.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      event.preventDefault();
      try {
        window.Hecate.UrlLauncher.open({ url: href });
        // eslint-disable-next-line no-empty
      } catch {}
      return;
    }
    const nativePath = getNativePath(href);
    if (!nativePath) return;
    event.preventDefault();
    try {
      alert('injectDeepLink click event 2');
      // Might throw in old versions of the app
      await window.Hecate.ready();
      await window.Hecate.Router.push({ path: nativePath.path });
      if (nativePath.topPage) window.Hecate.Router.pop2Home();
      // eslint-disable-next-line no-empty
    } catch {}
  });
}
