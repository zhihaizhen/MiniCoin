import positionTierIcon from '../assets/icon/position-tier.svg?url'
import splitPositionsIcon from '../assets/icon/split-positions.svg?url'
import historicalMarkPriceIcon from '../assets/icon/historical-mark-price.svg?url'
import indexPriceIcon from '../assets/icon/index-price.svg?url'
import rateIcon from '../assets/icon/rate.svg?url'
import riskReserveIcon from '../assets/icon/risk-reserve.svg?url'
import benefitsIcon from '../assets/icon/benefits.svg?url'
import cashbackIcon from '../assets/icon/cashback.svg?url'
import inviteIcon from '../assets/icon/invite.svg?url'
import inviteIcon2 from '../assets/icon/invite2.svg?url'
import lotteryIcon from '../assets/icon/lottery.svg?url'
import collectPhraseIcon from '../assets/icon/collect-phrase.svg?url'
import signInIcon from '../assets/icon/sign-in.svg?url'
import pointsRedeemIcon from '../assets/icon/points-redeem.svg?url'
import redEnvelopeIcon from '../assets/icon/red-envelope.svg?url'
import tradingChallengesIcon from '../assets/icon/trading-challenge.svg?url'
import spotsIcon from '../assets/icon/spots-icon.svg?url'
import exchangeIcon from '../assets/icon/exchange.svg?url'
import strategyIcon from '../assets/icon/spot-grid.svg?url'
import dcaIcon from '../assets/icon/dca.svg?url'
import quickBuyIcon from '../assets/icon/quick-buy-order.svg?url'
import depositIcon from '../assets/icon/deposit.svg?url'
import orderIcon from '../assets/icon/order.svg?url'
import stocksIcon from '../assets/icon/stocks.svg?url'
import demoTradeIcon from '../assets/icon/demo-trade.svg?url'
import tradfiIcon from '../assets/icon/tradfi.svg?url'
import tradfiOverviewIcon from '../assets/icon/tradfi-overview.svg?url'
import vipIcon from '../assets/icon/vip-icon.svg?url'
import apiIcon from '../assets/icon/api-icon.svg?url'
import academyIcon from '../assets/icon/academy-icon.svg?url'
import helpCenterIcon from '../assets/icon/help-center.svg?url'
import announcementIcon from '../assets/icon/announcement.svg?url'
import fireIcon from '../assets/icon/fire.svg?url'
import watchIcon from '../assets/icon/watch.svg?url'
import earnOverviewIcon from '../assets/icon/earn-overview.svg?url'
import earnLiquidIcon from '../assets/icon/earn-liquid.svg?url'
import earnFixedIcon from '../assets/icon/earn-fixed.svg?url'
import earnSimpleIcon from '../assets/icon/earn-simple.svg?url'
import earnOnchainIcon from '../assets/icon/earn-onchain.svg?url'
import earnLoanIcon from '../assets/icon/earn-loan.svg?url'
import earnVipIcon from '../assets/icon/earn-vip.svg?url'
import ucardsIcon from '../assets/icon/u-card.svg?url'
export interface MenuChildConfig {
  title: string
  href?: (language: string) => void
  hrefLink: string
  h5HrefLink: string
  label: string
  icon?: string
  trailingIcon?: string
  trailingIconStyle?: Record<string, unknown>
  badge?: string
  tag?: string
  /** 活动分组：'exclusive' = 左列专属，其余 = 右列热门 */
  activityGroup?: 'exclusive'
  /** 合约下拉分区：'trade' = 交易区，'explore' = 探索区 */
  contractGroup?: 'trade' | 'explore'
}

export interface MenuItemConfig {
  trailingIcon?: any
  title: string
  href?: (language: string) => void
  hrefLink: string
  h5HrefLink: string
  label: string
  isShow: boolean
  target: string
  hotIcon?: boolean
  arrowIcon?: boolean
  childrenMenu?: MenuChildConfig[]
}

/** "更多"右侧固定入口：机构 */
export const MORE_INSTITUTION_ITEMS: MenuChildConfig[] = [
  // {
  //   title: 'vip',
  //   hrefLink: '/vip',
  //   h5HrefLink: '/vip',
  //   label: 'vip',
  //   icon: vipIcon
  // },
  {
    title: 'api',
    hrefLink: '/open-api',
    h5HrefLink: '/open-api',
    label: 'api',
    icon: apiIcon
  }
]

/** "更多"右侧固定入口：学院 */
export const MORE_ACADEMY_ITEMS: MenuChildConfig[] = [
  {
    title: 'easicoinAcademy',
    hrefLink: '/academy',
    h5HrefLink: '/academy',
    label: 'acadamey',
    icon: academyIcon,
    tag: 'NEW'
  }
]

/** "更多"右侧固定入口：帮助 */
export const MORE_HELP_ITEMS: MenuChildConfig[] = [
  {
    title: 'helpCenter',
    hrefLink: '',
    h5HrefLink: '',
    label: 'helpCenter',
    icon: helpCenterIcon
    /** helpCenter 使用完整外链，hrefLink 不参与拼接 */
  },
  {
    title: 'announcement',
    hrefLink: '/categories/13278340573711-重要公告',
    h5HrefLink: '/categories/13278340573711-重要公告',
    label: 'announcement',
    icon: announcementIcon
  }
]

/** 帮助中心的完整外链（不走 dynamicDomain 拼接） */
export const HELP_CENTER_HREF = 'https://easicoin.zendesk.com/hc/zh-cn'

/** 公告中心的完整外链基础路径（不走 dynamicDomain 拼接） */
export const ANNOUNCEMENT_BASE_HREF = 'https://easicoin.zendesk.com/hc/zh-cn'

export function getMenuConfig(language: string): MenuItemConfig[] {
  const futuresDataChildren: MenuChildConfig[] = [
    {
      title: 'position',
      href: (lang: string) => window.open(`/${lang}/trading-data/position`, '_self'),
      hrefLink: `/trading-data/position`,
      h5HrefLink: `/trading-data/position`,
      label: 'position',
      icon: positionTierIcon
    },
    {
      title: 'split-symbol-params-title',
      href: (lang: string) => window.open(`/${lang}/trading-data/split-symbol-params`, '_self'),
      hrefLink: `/trading-data/split-symbol-params`,
      h5HrefLink: `/trading-data/split-symbol-params`,
      label: 'split-symbol-params-title',
      icon: splitPositionsIcon
    },
    {
      title: 'history-price-tag',
      href: (lang: string) => window.open(`/${lang}/trading-data/price`, '_self'),
      hrefLink: `/trading-data/price`,
      h5HrefLink: `/trading-data/price`,
      label: 'price',
      icon: historicalMarkPriceIcon
    },
    {
      title: 'index-price-tag',
      href: (lang: string) => window.open(`/${lang}/trading-data/indexPrice`, '_self'),
      hrefLink: `/trading-data/indexPrice`,
      h5HrefLink: `/trading-data/indexPrice`,
      label: 'index-price-tag',
      icon: indexPriceIcon
    },
    {
      title: 'fundfee-title',
      href: (lang: string) => window.open(`/${lang}/trading-data/fundfee`, '_self'),
      hrefLink: `/trading-data/fundfee`,
      h5HrefLink: `/trading-data/fundfee`,
      label: 'fundfee',
      icon: rateIcon
    },
    {
      title: 'risk-reserve-title',
      href: (lang: string) => window.open(`/${lang}/trading-data/risk-reserve`, '_self'),
      hrefLink: `/trading-data/risk-reserve`,
      h5HrefLink: `/trading-data/risk-reserve`,
      label: 'risk-reserve',
      icon: riskReserveIcon
    }
  ]

  return [
    {
      title: 'buy-crypto',
      href: (lang: string) => window.open(`/${lang}/buy-crypto/`, '_self'),
      hrefLink: `/buy-crypto/`,
      h5HrefLink: `/buy-crypto/`,
      label: 'fiat',
      isShow: true,
      target: '_self',
      childrenMenu: [
        {
          title: 'fiat-currency',
          href: (lang: string) => window.open(`/${lang}/buy-crypto/`, '_self'),
          hrefLink: '/buy-crypto/',
          h5HrefLink: `/buy-crypto/`,
          label: 'fiat-currency',
          icon: quickBuyIcon,
          trailingIcon: fireIcon
        },
        {
          title: 'cryptocurrency-deposit',
          href: (lang: string) => window.open(`/${lang}/assets/deposit`, '_self'),
          hrefLink: '/assets/deposit',
          h5HrefLink: `/assets/deposit`,
          label: 'cryptocurrency-deposit',
          icon: depositIcon
        },
        {
          title: 'ucards',
          href: (lang: string) => window.open(`/${lang}/promotion/ucards`, '_self'),
          hrefLink: '/promotion/ucards',
          h5HrefLink: `/downloadApp/`,
          label: 'ucards',
          icon: ucardsIcon
        }
      ]
    },
    {
      title: 'market',
      href: (lang: string) => window.open(`/${lang}/markets/`, '_self'),
      hrefLink: `/markets/`,
      h5HrefLink: `/markets/`,
      label: 'markets',
      isShow: true,
      target: '_self'
    },
    {
      title: 'spotTrade',
      href: (lang: string) => window.open(`/${lang}/spot/exchange/BTC/USDT`, '_self'),
      hrefLink: '/spot/exchange/BTC/USDT',
      h5HrefLink: `/downloadApp/`,
      label: 'spotTrade',
      isShow: true,
      target: '_self',
      childrenMenu: [
        {
          title: 'spot',
          href: (lang: string) => window.open(`/${lang}/spot/exchange/BTC/USDT`, '_self'),
          hrefLink: '/spot/exchange/BTC/USDT',
          h5HrefLink: `/spot/exchange/BTC/USDT`,
          label: 'spot',
          icon: spotsIcon
        },
        {
          title: 'spotGrid',
          href: (lang: string) => window.open(`/${lang}/trading-bot`, '_self'),
          hrefLink: '/trading-bot?type=spotGrid',
          h5HrefLink: `/trading-bot?type=spotGrid`,
          label: 'spotGrid',
          icon: strategyIcon
        },
        {
          title: 'dca',
          href: (lang: string) => window.open(`/${lang}/trading-bot`, '_self'),
          hrefLink: '/trading-bot?type=dca',
          h5HrefLink: `/trading-bot?type=dca`,
          label: 'dca',
          icon: dcaIcon,
        },
        {
          title: 'convert',
          href: (lang: string) => window.open(`/${lang}/convert`, '_self'),
          hrefLink: '/convert',
          h5HrefLink: `/convert`,
          label: 'convert',
          icon: exchangeIcon
        }
      ]
    },
    {
      title: 'contractTrade',
      href: (lang: string) => window.open(`/${lang}/trade/usdt/BTCUSDT`, '_self'),
      hrefLink: '/trade/usdt/BTCUSDT',
      h5HrefLink: `/downloadApp/`,
      label: 'trade',
      target: '_self',
      isShow: true,
      childrenMenu: [
        {
          title: 'linearPerpetualTitle',
          href: (lang: string) => window.open(`/${lang}/trade/usdt/BTCUSDT`, '_self'),
          hrefLink: '/trade/usdt/BTCUSDT',
          h5HrefLink: `/downloadApp/`,
          label: 'crypto_trade',
          icon: orderIcon,
          trailingIcon: fireIcon,
          contractGroup: 'trade'
        },
        {
          title: 'stockTradeTitle',
          href: (lang: string) => window.open(`/${lang}/trade/usdt/TSLAUSDT`, '_self'),
          hrefLink: '/trade/usdt/TSLAUSDT',
          h5HrefLink: `/trade/usdt/TSLAUSDT`,
          label: 'stock_trade',
          icon: stocksIcon,
          contractGroup: 'trade'
        },
        {
          title: 'demoTradeTitle',
          href: (lang: string) => window.open(`/${lang}/downloadApp/?type=demoTrade`, '_self'),
          hrefLink: '/downloadApp/?type=demoTrade',
          h5HrefLink: `/downloadApp/?type=demoTrade`,
          label: 'demo_trade',
          icon: demoTradeIcon,
          contractGroup: 'trade'
        },
        {
          title: 'tradfiTradeTitle',
          href: (lang: string) => window.open(`/${lang}/tradfi/XAUUSD`, '_self'),
          hrefLink: '/tradfi/XAUUSD',
          h5HrefLink: '/tradfi/XAUUSD',
          label: 'tradfi_trade',
          icon: tradfiIcon,
          contractGroup: 'trade'
        },
        {
          title: 'tradfiOverviewTitle',
          href: (lang: string) => window.open(`/${lang}/promotion/tradfi-overview`, '_self'),
          hrefLink: '/promotion/tradfi-overview',
          h5HrefLink: '/promotion/tradfi-overview',
          label: 'tradfi_overview',
          icon: tradfiOverviewIcon,
          contractGroup: 'explore'
        }
      ]
    },
    {
      title: 'earn',
      href: (lang: string) => window.open(`/${lang}/earn`, '_self'),
      hrefLink: '/earn',
      h5HrefLink: '/earn',
      label: 'earn',
      isShow: true,
      target: '_self',
      childrenMenu: [
        {
          title: 'overviewEarn',
          href: (lang: string) => window.open(`/${lang}/earn`, '_self'),
          hrefLink: '/earn',
          h5HrefLink: '/earn',
          label: 'overviewEarn',
          icon: earnOverviewIcon
        },
        {
          title: 'savingsLiquid',
          href: (lang: string) => window.open(`/${lang}/earn?duration=liquid`, '_self'),
          hrefLink: '/earn?duration=liquid',
          h5HrefLink: '/earn?duration=liquid',
          label: 'savingsLiquid',
          icon: earnLiquidIcon
        },
        {
          title: 'savingsFixed',
          href: (lang: string) => window.open(`/${lang}/earn?duration=fixed`, '_self'),
          hrefLink: '/earn?duration=fixed',
          h5HrefLink: '/earn?duration=fixed',
          label: 'savingsFixed',
          icon: earnFixedIcon,
          tag: '100%APR'
        },
        {
          title: 'simpleEarn',
          href: (lang: string) => window.open(`/${lang}/earn/simple`, '_self'),
          hrefLink: '/earn/simple',
          h5HrefLink: '/earn/simple',
          label: 'simpleEarn',
          icon: earnSimpleIcon
        },
        {
          title: 'onchainEarn',
          href: (lang: string) => window.open(`/${lang}/earn/onchain`, '_self'),
          hrefLink: '/earn/onchain',
          h5HrefLink: '/earn/onchain',
          label: 'onchainEarn',
          icon: earnOnchainIcon
        },
        {
          title: 'vipEarn',
          href: (lang: string) => window.open(`/${lang}/earn/vip-premier-wealth-hub`, '_self'),
          hrefLink: '/earn/vip-premier-wealth-hub',
          h5HrefLink: '/earn/vip-premier-wealth-hub',
          label: 'vipEarn',
          icon: earnVipIcon
          // tag: 'NEW'
        },
        {
          title: 'loanEarn',
          href: (lang: string) => window.open(`/${lang}/earn/loan`, '_self'),
          hrefLink: '/earn/loan',
          h5HrefLink: '/earn/loan',
          label: 'loanEarn',
          icon: earnLoanIcon,
          tag: 'NEW'
        }
      ]
    },
    {
      title: 'activities',
      hotIcon: true,
      href: (lang: string) => window.open(`/${lang}/rewards-hub`, '_self'),
      hrefLink: '/rewards-hub',
      h5HrefLink: `/rewards-hub`,
      label: 'activities',
      target: '_self',
      isShow: true,
      childrenMenu: [
        {
          title: 'rewardsHub',
          href: (lang: string) => window.open(`/${lang}/rewards-hub`, '_self'),
          hrefLink: '/rewards-hub',
          h5HrefLink: `/rewards-hub`,
          label: 'rewards-hub',
          icon: benefitsIcon,
          activityGroup: 'exclusive'
        },
        {
          title: 'depositCashback',
          href: (lang: string) => window.open(`/${lang}/activity-center/deposit-cashback`, '_self'),
          hrefLink: '/activity-center/deposit-cashback',
          h5HrefLink: `/activity-center/deposit-cashback`,
          label: 'deposit-cashback',
          icon: cashbackIcon,
          trailingIcon: vipIcon,
          trailingIconStyle: { width: 25, height: 14 },
          activityGroup: 'exclusive'
        },
        {
          title: 'lottery',
          href: (lang: string) =>
            window.open(`/${lang}/activity-center/lottery/slot-machine`, '_self'),
          hrefLink: '/activity-center/lottery/slot-machine',
          h5HrefLink: `/activity-center/lottery/slot-machine`,
          label: 'lottery',
          icon: lotteryIcon,
          activityGroup: 'exclusive'
        },
        {
          title: 'referral',
          href: (lang: string) => window.open(`/${lang}/referral`, '_self'),
          hrefLink: '/referral',
          h5HrefLink: `/referral`,
          label: 'referral',
          icon: inviteIcon,
          activityGroup: 'exclusive',
          badge: 'NEW'
        },
        {
          title: 'invite',
          href: (lang: string) => window.open(`/${lang}/activity-center/invite`, '_self'),
          hrefLink: '/activity-center/invite',
          h5HrefLink: `/activity-center/invite`,
          label: 'invite',
          icon: inviteIcon2,
          activityGroup: 'exclusive'
        },
        {
          title: 'points-redeem',
          href: (lang: string) => window.open(`/${lang}/activity-center/points-redeem`, '_self'),
          hrefLink: '/activity-center/points-redeem',
          h5HrefLink: `/activity-center/points-redeem`,
          label: 'points-redeem',
          icon: pointsRedeemIcon,
          trailingIcon: watchIcon
        },
        {
          title: 'red-envelope',
          href: (lang: string) =>
            window.open(`/${lang}/activity-center/lottery/red-envelope`, '_self'),
          hrefLink: '/activity-center/lottery/red-envelope',
          h5HrefLink: `/activity-center/lottery/red-envelope`,
          label: 'red-envelope',
          icon: redEnvelopeIcon,
          trailingIcon: fireIcon
        },
        {
          title: 'trading-challenges',
          href: (lang: string) =>
            window.open(`/${lang}/activity-center/trading-challenges/phase2`, '_self'),
          hrefLink: '/activity-center/trading-challenges/phase2',
          h5HrefLink: `/activity-center/trading-challenges/phase2`,
          label: 'trading-challenges',
          icon: tradingChallengesIcon
        }
      ]
    },
    {
      title: 'more',
      href: (lang: string) => window.open(`/${lang}/trading-data/position`, '_self'),
      hrefLink: `/trading-data/position`,
      h5HrefLink: `/trading-data/position`,
      label: 'more',
      target: '_self',
      isShow: true,
      childrenMenu: futuresDataChildren
    },
    {
      title: 'futures-data',
      href: (lang: string) => window.open(`/${lang}/trading-data/position`, '_self'),
      hrefLink: `/trading-data/position`,
      h5HrefLink: `/trading-data/position`,
      label: 'futures-data',
      target: '_self',
      isShow: false,
      childrenMenu: futuresDataChildren
    }
  ]
}
