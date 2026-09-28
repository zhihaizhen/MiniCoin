const ns = 'instrument';

/**
 * instrument中的字段
 * @property int $id
 * @property string $symbol 产品:BTCUSD,ETHUSD
 * @property integer $lastPrice 最新市价(放大10^4存储)
 * @property string $lastTickDirection 价格变化方向:PlusTick,ZeroPlusTick,MinusTick,ZeroMinusTick
 * @property integer $prev_price_24h_e4 24小时前的整点市价(放大10^4存储)
 * @property integer $price24hPcntE6 市价相对24h变化百分比(-1.2%存-12000)
 * @property integer $highPrice24h 24h最高价(放大10^4存储)
 * @property integer $lowPrice24h 24h最低价(放大10^4存储)
 * @property integer $markPrice 标记价格(放大10^4存储)
 * @property integer $indexPrice 指数价格(放大10^4存储)
 * @property integer $openInterest 未平仓合约数量
 * @property integer $openValue 未平仓价值_聪(Satoshi)
 * @property integer $totalTurnoverE8 总营业额(BTC价值)_聪(Satoshi)
 * @property integer $turnover24h 24小时营业额(BTC价值)_聪(Satoshi)
 * @property integer $countdownHour 下次结算时间距离 （int）
 * @property integer $nextFundingTime 下个结算时刻（UTC时间）
 * @property integer $totalVolume 总交易量(合约数)
 * @property integer $volume24h 24小时交易量(合约数)
 * @property integer $fundingRateE6 资金费率(0.01%存100)
 * @property integer $predictedFundingRateE6 预测资金费率(0.01%存100)
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */

const initStates = {
  countdownHour: 0,
  crossSeq: 0,
  fundingRateE6: 0,
  highPrice24h: 0,
  id: 0,
  indexPrice: 0,
  lastPrice: 0,
  lastTickDirection: '',
  lowPrice24h: 0,
  markPrice: 0,
  nextFundingTime: '',
  openInterest: 0,
  openValueE8: 0,
  predictedFundingRateE6: 0,
  prevPrice1h: 0,
  prevPrice24h: 0,
  price1hPcntE6: 0,
  price24hPcntE6: 0,
  symbol: '',
  totalTurnoverE8: 0,
  totalVolume: 0,
  turnover24h: 0,
  updated_at: '',
  volume24h: 0,
  timeToSettle: 0,
  expectPrice: 0,
  fairBasisE8: 0,
  settleTimeE9: 0,
};

const types = {
  SET_INSTRUMENT_BY_SYMBOL: 'SET_INSTRUMENT_BY_SYMBOL',
  UPDATE_INSTRUMENT_BY_SYMBOL: 'UPDATE_INSTRUMENT_BY_SYMBOL',
  CLEAN_INSTRUMENT_BY_SYMBOL: 'CLEAN_INSTRUMENT_BY_SYMBOL',
};

const actions = {
  [types.SET_INSTRUMENT_BY_SYMBOL](state, { payload }) {
    if (state.symbol === payload.symbol) {
      state[ns] = payload;
    }
  },
  [types.UPDATE_INSTRUMENT_BY_SYMBOL](state, { payload }) {
    if (state.symbol === payload.symbol) {
      state[ns] = { ...state[ns], ...payload };
    }
  },
  [types.CLEAN_INSTRUMENT_BY_SYMBOL](state) {
    state[ns] = initStates;
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
