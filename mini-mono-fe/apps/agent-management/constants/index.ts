export const timeFilterList = [
  {
    key: 'All',
    value: 'All'
  },
  {
    key: '1Y',
    value: '1Y'
  },
  {
    key: '1M',
    value: '1M'
  },
  {
    key: '7D',
    value: '7D'
  },
  {
    key: '24H',
    value: '24H'
  }
];

// 用户概览
export const rankFilterList = [
  {
    key: 'registration_time_desc', //注册时间由近及远
    value: 'registration_time-desc'
  },
  {
    key: 'registration_time_asc',
    value: 'registration_time-asc'
  },

  {
    key: 'trading_amount_desc', //累计交易额从高到底
    value: 'trading_amount-desc'
  },
  {
    key: 'trading_amount_asc',
    value: 'trading_amount-asc'
  },
  {
    key: 'user_assets_desc', //用户资产从高到底
    value: 'user_assets-desc'
  },
  {
    key: 'user_assets_asc',
    value: 'user_assets-asc'
  },
  {
    key: 'realized_pnl_desc', //已结盈亏从高到底
    value: 'realized_pnl-desc'
  },
  {
    key: 'realized_pnl_asc',
    value: 'realized_pnl-asc'
  },

  {
    key: 'unrealized_pnl_desc', //未结盈亏从高到底
    value: 'unrealized_pnl-desc'
  },
  {
    key: 'unrealized_pnl_asc',
    value: 'unrealized_pnl-asc'
  }
];

//
export const openPositionsFilterList = [
  {
    key: 'unrealized_pnl_asc', //
    value: 'unrealized_pnl-asc'
  },
  {
    key: 'unrealized_pnl_desc',
    value: 'unrealized_pnl-desc'
  },
  {
    key: 'amount_desc',
    value: 'amount-desc'
  },
  {
    key: 'amount_asc',
    value: 'amount-asc'
  }
];

export const plFilterList = [
  {
    key: 'amount_asc', //日期由远及近
    value: 'amount-asc'
  },
  {
    key: 'amount_desc',
    value: 'amount-desc'
  },
  {
    key: 'realize_pnl_money_asc',
    value: 'realized_pnl-asc'
  },
  {
    key: 'realize_pnl_money_desc',
    value: 'realized_pnl-desc'
  },
  {
    key: 'dt_asc',
    value: 'dt-asc'
  },
  {
    key: 'dt_desc',
    value: 'dt-desc'
  }
];
