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




export default {
  PUBLIC_DATA_CATEGORY,
  WEBSOCKET_STATUS_EVENT,
  WEBSOCKET_REPORT_EVENT,
};
