import BigNumber from 'bignumber.js';
import {
    TICK_DIRECTION,
    TICK_DIRECTION_MAP,
    OrderAction,

    NUMBER_KEY,
    baseConfig,
} from './constants';

export const toNumber = (param) => {
    if (typeof param === 'number') return param;
    if (typeof param === 'string') return parseFloat(param);
    return NaN;
};

export const formatSymbol = (symbol) => {
    if (!symbol) return '';
    const prefix = `${baseConfig.exchangeId}.`;
    if (typeof symbol === 'string' && !symbol.includes('.')) {
        return `${prefix}${symbol}`;
    }
    return symbol;
};



export const handleRT = (recentTrade, symbol) => {
    return recentTrade.map(
        ([tickDirection, execPrice, execQty, execTime, side, execId]) => ({
            execId,
            execPrice,
            execQty,
            execTime,
            side: side === 'b' ? OrderAction.BUY : OrderAction.SELL,
            symbol,
            tickDirection: TICK_DIRECTION_MAP[tickDirection],
        }),
    );
};

export const handleOBItem = (obItem, priceScale, side, symbol) => {
    const [price, size] = obItem;
    const priceBN = new BigNumber(price);
    const Id = priceBN.times(priceScale).toNumber();
    return {
        Id,
        price: priceBN.toNumber(),
        side,
        size: new BigNumber(size).toNumber(),
        symbol,
        total: 0,
    };
};

export const handleOB = (orderbook = { b: [], a: [] }, priceScale, symbol) => {
    const { b = [], a = [] } = orderbook;
    const buyList = b.map((item) =>
        handleOBItem(item, priceScale, OrderAction.BUY, symbol),
    );
    const sellList = a.map((item) =>
        handleOBItem(item, priceScale, OrderAction.SELL, symbol),
    );
    return [buyList, sellList];
};

export const sortOb = (a, b) => b.Id - a.Id;

export const calcTotal = (prev, cur) => {
    const prevTotal = prev.length ? prev[prev.length - 1].total || 0 : 0;
    return [
        ...prev,
        {
            ...cur,
            total: new BigNumber(cur.size).plus(prevTotal).toNumber(),
        },
    ];
};

export const fixBuyList = (buyList, bidId = 0) => {
    let list = [...buyList];
    while (list.length > 0 && bidId !== 0 && list[0].Id > bidId) {
        list.shift();
    }
    return list;
};

export const fixSellList = (sellList, askId = 0) => {
    let list = [...sellList];
    while (list.length > 0 && askId !== 0 && list[list.length - 1].Id < askId) {
        list.pop();
    }
    return list;
};

export const getTotalCalculatedAndSortedList = (
    buyList,
    sellList,
    bid1Id = 0,
    ask1Id = 0,
    limit = 100,
) => {
    let sortedBuy = [...buyList].sort(sortOb);
    let sortedSell = [...sellList].sort(sortOb);

    let newBuyList = fixBuyList(sortedBuy, bid1Id);
    let newSellList = fixSellList(sortedSell, ask1Id);

    // Limit the number of items BEFORE calculating totals for performance and consistency
    if (newBuyList.length > limit) newBuyList = newBuyList.slice(0, limit);
    if (newSellList.length > limit) newSellList = newSellList.slice(-limit);

    newBuyList = newBuyList.reduce((p, c) => calcTotal(p, c), []);
    newSellList = newSellList.reduceRight((p, c) => calcTotal(p, c), []).reverse();

    return [newBuyList, newSellList];
};
