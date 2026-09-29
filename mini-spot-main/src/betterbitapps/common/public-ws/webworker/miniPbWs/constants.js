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
