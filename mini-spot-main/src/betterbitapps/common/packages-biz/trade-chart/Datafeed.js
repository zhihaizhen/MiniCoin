import { QUICK_OPERATION_CHECKLIST } from 'common/packages-biz/global-settings/localStorageSettings';
import { storage } from 'by-storage';
import { getKlineMarks } from '@/services/kine.service';
import { RESOLUTION_MAP } from '@/containers/chart/constant';

function formatResolution(resolution) {
  // const reg = /^1([A-Z])$/;
  // const match = reg.exec(resolution);
  // const fResolution = match
  //   ? match[1]
  //   : RESOLUTION_MAP[resolution] || resolution;
  return RESOLUTION_MAP[resolution] || resolution;
}

export const klineStartTime = new Date(2023, 1, 1);
const lastBarsCache = new Map();

export const getCurMarks = async (_curSymbolInfo) => {
  const { symbolInfo, resolution, from, to, onDataCallback } =
    _curSymbolInfo || {};
  const { ticker } = symbolInfo;
  const res = await getKlineMarks({
    symbol: ticker,
    resolution: RESOLUTION_MAP[resolution] || resolution,
    from,
    to,
  });
  let { list } = res;
  if (list && list.length > 0) {
    list.forEach((item) => {
      item.time = item.startAt * 1000;
    });
  } else {
    list = [];
  }
  list = list.filter((item) => {
    return item.time > klineStartTime;
  });
  return list;
};

/* eslint-disable */
export class Datafeed {
  constructor({
    supportedResolutions,
    symbols,
    getBars: _getBars,
    subscribeBars: _subscribeBars,
    unsubscribeBars: _unsubscribeBars,
    getMarks: _getMarks,
    drawMarks,
    clearMarks,
  }) {
    this.supportedResolutions = supportedResolutions || [
      '1',
      '3',
      '5',
      '15',
      '30',
      '60',
      '120',
      '240',
      '360',
      '720',
      '1D',
      '1W',
      '1M',
    ];
    this.symbols = symbols;
    this._getBars = _getBars;
    this._getMarks = _getMarks;
    this._subscribeBars = _subscribeBars;
    this._unsubscribeBars = _unsubscribeBars;
    this.drawMarks = drawMarks;
    this.clearMarks = clearMarks;
  }

  onReady(configurationData) {
    setTimeout(() => {
      configurationData({
        exchanges: [],
        symbolsTypes: [],
        supported_resolutions: this.supportedResolutions,
        supports_marks: true,
        supports_search: false,
        supports_time: true,
        supports_timescale_marks: false,
        has_no_volume: true,
      });
    }, 0);
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    const result = [];
    /* eslint-disable no-restricted-syntax */
    for (const name in this.symbols) {
      if (name.indexOf(userInput) !== -1) {
        result.push(this.symbols[name]);
      }
    }
    onResultReadyCallback(result);
  }

  subscribeBars(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
  ) {
    console.log(
      '[subscribeBars]: Method call with subscriberUID:',
      subscriberUID,
    );
    this._subscribeBars(
      symbolInfo,
      formatResolution(resolution),
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      // lastBarsCache.get(symbolInfo.full_name),
    );
  }

  unsubscribeBars(listenerGuid) {
    console.log(
      '[unsubscribeBars]: Method call with unSubscribeGuid:',
      listenerGuid,
    );
    this._unsubscribeBars(listenerGuid);
  }

  async getBars(
    symbolInfo,
    resolution,
    // from,
    // to,
    periodParams,
    onHistoryCallback,
    onErrorCallback,
    // firstDataRequest,
  ) {
    let { from, to, firstDataRequest } = periodParams;
    let startTime = klineStartTime / 1000;
    // console.log('k线-step0 调用getBars');
    if (to < startTime) {
      onHistoryCallback([], {
        noData: true,
      });
      return;
    }
    if (from < startTime) {
      from = startTime;
    }
    this._getBars(
      symbolInfo,
      formatResolution(resolution),
      from,
      to,
      onHistoryCallback,
      onErrorCallback,
      firstDataRequest,
      // lastBarsCache,
    );
  }

  // tradingview 调用，用于根据symbolName获取当前symbol，决定了后续 subscribeBars 订阅了几个symbol。这里一般包含两个，一个是 .M 开头的标记价格信息
  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    if (!symbolName) return;
    let symbolInfo = null;
    try {
      for (const name in this.symbols) {
        if (name.indexOf(symbolName) !== -1) {
          symbolInfo = this.symbols[name];
          break;
        }
      }
      if (symbolInfo) {
        symbolInfo = {
          ...symbolInfo,
          supported_resolutions: this.supportedResolutions,
        };
        setTimeout(() => {
          onSymbolResolvedCallback(symbolInfo);
        }, 0);
      } else {
        onResolveErrorCallback();
      }
    } catch (e) {
      console.log(e, 'resolveSymbol error');
      onResolveErrorCallback(e.message);
    }
  }

  // async getMarks(symbolInfo, from, to, onDataCallback, resolution) {
  //   let storeCheckList = storage.get(QUICK_OPERATION_CHECKLIST);
  //   storeCheckList = JSON.parse(storeCheckList) || {};
  //   if (storeCheckList?.orderHistory !== 'show') return;
  //   this._getMarks(
  //     symbolInfo,
  //     from,
  //     to,
  //     onDataCallback,
  //     resolution,
  //     this.drawMarks,
  //     this.clearMarks,
  //   );
  //   console.log('=====getMarks running');
  // }
}

export default Datafeed;
