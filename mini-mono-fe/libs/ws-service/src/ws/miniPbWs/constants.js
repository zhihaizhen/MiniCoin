export const TICK_DIRECTION = {
    PLUS: 'PlusTick',
    MINUS: 'MinusTick',
    ZERO_PLUS: 'ZeroPlusTick',
    ZERO_MINUS: 'ZeroMinusTick',
};

export const TICK_DIRECTION_MAP = {
    '+': TICK_DIRECTION.PLUS,
    '-': TICK_DIRECTION.MINUS,
    '0+': TICK_DIRECTION.ZERO_PLUS,
    '0-': TICK_DIRECTION.ZERO_MINUS,
};

export const OrderAction = {
    BUY: 'Buy',
    SELL: 'Sell',
};



export const DEFAULT_ID_FACTOR = 1e4;

export const WS_PATHNAME_ZM = '/ws/quote/v1';

export const intervalMap = {
    1: '1m',
    3: '3m',
    5: '5m',
    15: '15m',
    30: '30m',
    60: '1h',
    120: '2h',
    240: '4h',
    360: '6h',
    480: '8h',
    720: '12h',
    1440: '1d',
    '1D': '1d',
    D: '1d',
    10080: '1w',
    '1W': '1w',
    W: '1w',
    44640: '1M',
    '1M': '1M',
    M: '1M',
};

export const reverseIntervalMap = {
    '1m': '1',
    '3m': '3',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1h': '60',
    '2h': '120',
    '4h': '240',
    '6h': '360',
    '8h': '480',
    '12h': '720',
    '1d': '1440',
    '1w': '10080',
    '1M': '44640',
};

export const baseConfig = {
    exchangeId: '301',
};

export const MarketTypes = {
    MARKET_CANDLE: 'MARKET_CANDLE',
    MARK_CANDLE: 'MARK_CANDLE',
};

//   这里是把topic和模块对应起来,用模块命名
export const WS_TYPE = {
    KLINE: 'kline',
    DEPTH: 'depth',
    ORDER_BOOK: 'mergedDepth',
    RECENTLY_TRADE: 'trade',
    SINGLE_SYMBOL_QUOTE: 'realtimes',
    ALL_SYMBOL_QUOTE: 'slowBroker',
    ALL_SYMBOL_QUOTE_NEW: 'tickers',
};

// 这里是所有用到的topic,用topic命名
export const PublicWsTopics = {
    REALTIME: 'realtimes',
    MERGED_DEPTH: 'mergedDepth',
    SLOW_BROKER: 'slowBroker',
    tickers: 'tickers',
    DEPTH: 'depth',
    TRADE: 'trade',
    KLINE: 'kline',
};
