export const PUBLIC_DATA_CATEGORY = {
  MARKET_CANDLE: 'mktc',
  MARK_CANDLE: 'mrkc',
  INDEX_QUOTE: 'iq',
  PUBLIC_NOTICE: 'pn',
  INSTRUMENT: 'it',
  ALL_SYMBOL_QUOTE: 'ita',
};

export const WEBSOCKET_STATUS_EVENT = {
  CONNECTED: 'connected',
  RECONNECT: 'reconnect',
  CLOSE: 'close',
};

export const WEBSOCKET_REPORT_EVENT = {
  WSOT: 'WSOT',
  WSFCT: 'WSFCT',
  CLOSE_BY_OTHER: 'close_by_other',
  OPEN_ERROR: 'open_error',
  HEART_ERROR: 'heart_error',
  HEART_BACK: 'heart_back',
};

export const INDEX_QUOTE_TYPE = {
  ORDER_BOOK: 'ORDER_BOOK',
  RECENT_TRADE: 'RECENT_TRADE',
  INSTRUMENT: 'INSTRUMENT',
};

export const ORDERBOOK_TYPE = {
  BOOK_20: 'books-20.',
  BOOK_25: 'books-25.',
  BOOK_80: 'books-80.',
  BOOK_200: 'books-200.',
  RECENTLY_TRADE:'trades-100.',
}

export default {
  PUBLIC_DATA_CATEGORY,
  WEBSOCKET_STATUS_EVENT,
  WEBSOCKET_REPORT_EVENT,
};
