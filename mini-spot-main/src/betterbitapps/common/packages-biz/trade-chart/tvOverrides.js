/* eslint-disable jsx-control-statements/jsx-jcs-no-undef */
export const getCSSPropert = (name) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value;
};

export const vertGrid = () => getCSSPropert('--line-divider-secondary');
export const horzGrid = () => getCSSPropert('--line-divider-secondary');
export const crossHair = () => getCSSPropert('--text-primary');

// 导出获取颜色的函数
export const getLongColor = () => getCSSPropert('--long');
export const getShortColor = () => getCSSPropert('--short');
export const getBrandColor = () => getCSSPropert('--text-brand-default-web');

export const long = getLongColor();
export const short = getShortColor();

export const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getTvMainColor = () => getCSSPropert('--line-divider-primary');
const getTvTextColor = () => getCSSPropert('--text-primary');
export const getTvMainBg = () => getCSSPropert('--bg-primary'); // 避免，主题class未在html加上，就先获取变量

const LINESTYLE_SOLID = 0;
// const LINESTYLE_DOTTED = 1;
const LINESTYLE_DASHED = 2;
// const LINESTYLE_LARGE_DASHED = 3;

export function getOverrides() {
  return {
    volumePaneSize: 'large',
    // 'paneProperties.backgroundType': 'solid',
    'paneProperties.background': getTvMainBg(), // 主背景颜色
    'paneProperties.backgroundGradientStartColor': getTvMainBg(),
    'paneProperties.backgroundGradientEndColor': getTvMainBg(),
    'paneProperties.vertGridProperties.color': vertGrid(), // 垂直网格颜色
    'paneProperties.vertGridProperties.width': 0.5,
    'paneProperties.vertGridProperties.style': LINESTYLE_SOLID,
    'paneProperties.horzGridProperties.color': horzGrid(), // 水平网格颜色
    'paneProperties.horzGridProperties.width': 0.5,
    'paneProperties.horzGridProperties.style': LINESTYLE_SOLID,
    'paneProperties.crossHairProperties.color': crossHair(), // 鼠标位置十字线颜色
    'paneProperties.crossHairProperties.width': 0.5,
    'paneProperties.crossHairProperties.style': LINESTYLE_DASHED,
    'paneProperties.separatorColor': horzGrid(),
    // Margins(percentage). Used for auto scaling.
    'paneProperties.topMargin': 20,
    'paneProperties.bottomMargin': 5,

    'paneProperties.axisProperties.autoScale': true,
    'paneProperties.axisProperties.lockScale': false,
    'paneProperties.axisProperties.percentage': false,
    'paneProperties.axisProperties.indexedTo100': false,
    'paneProperties.axisProperties.log': false,
    'paneProperties.axisProperties.alignLabels': true,
    'paneProperties.axisProperties.isInverted': false,

    'paneProperties.legendProperties.showStudyArguments': true,
    'paneProperties.legendProperties.showStudyTitles': true,
    'paneProperties.legendProperties.showStudyValues': true,
    'paneProperties.legendProperties.showSeriesTitle': true,
    'paneProperties.legendProperties.showSeriesOHLC': true,
    'paneProperties.legendProperties.showLegend': true,
    'paneProperties.legendProperties.showBarChange': true,
    'paneProperties.legendProperties.showVolume': true,

    'scalesProperties.backgroundColor': getTvMainColor(),
    'scalesProperties.fontSize': 10, // 设置坐标轴字体大小
    'scalesProperties.lineColor': getTvMainColor(), // 设置坐标轴颜色
    'scalesProperties.textColor': getTvTextColor(), // 设置坐标轴字体颜色
    'scalesProperties.scaleSeriesOnly': false,
    'scalesProperties.showSeriesLastValue': true,
    'scalesProperties.showSeriesPrevCloseValue': false,
    'scalesProperties.showStudyLastValue': false,
    'scalesProperties.showStudyPlotLabels': false,
    'scalesProperties.showSymbolLabels': false,

    'timeScale.rightOffset': 5,
    timezone: TIME_ZONE,
    'mainSeriesProperties.showCountdown': false,
    'mainSeriesProperties.showPriceLine': true,
    'mainSeriesProperties.priceLineWidth': 1,
    'mainSeriesProperties.priceLineColor': '',
    'mainSeriesProperties.showPrevClosePriceLine': false,
    'mainSeriesProperties.prevClosePriceLineWidth': 1,
    'mainSeriesProperties.prevClosePriceLineColor': 'rgba(85, 85, 85, 1)',
    'mainSeriesProperties.minTick': 'default',

    'mainSeriesProperties.priceAxisProperties.autoScale': true,
    'mainSeriesProperties.priceAxisProperties.autoScaleDisabled': false,
    'mainSeriesProperties.priceAxisProperties.percentage': false,
    'mainSeriesProperties.priceAxisProperties.percentageDisabled': false,
    'mainSeriesProperties.priceAxisProperties.log': false,
    'mainSeriesProperties.priceAxisProperties.logDisabled': false,

    // Candles styles
    'mainSeriesProperties.candleStyle.upColor': getLongColor(),
    'mainSeriesProperties.candleStyle.downColor': getShortColor(),
    'mainSeriesProperties.candleStyle.drawWick': true,
    'mainSeriesProperties.candleStyle.drawBorder': true,
    'mainSeriesProperties.candleStyle.borderColor': '#378658',
    'mainSeriesProperties.candleStyle.borderUpColor': getLongColor(),
    'mainSeriesProperties.candleStyle.borderDownColor': getShortColor(),
    'mainSeriesProperties.candleStyle.wickColor': '#737375',
    'mainSeriesProperties.candleStyle.wickUpColor': getLongColor(),
    'mainSeriesProperties.candleStyle.wickDownColor': getShortColor(),
    'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,

    // Hollow Candles
    'mainSeriesProperties.hollowCandleStyle.upColor': getLongColor(),
    'mainSeriesProperties.hollowCandleStyle.downColor': getShortColor(),
    'mainSeriesProperties.hollowCandleStyle.drawWick': true,
    'mainSeriesProperties.hollowCandleStyle.drawBorder': true,
    'mainSeriesProperties.hollowCandleStyle.borderColor': '#378658',
    'mainSeriesProperties.hollowCandleStyle.borderUpColor': getLongColor(),
    'mainSeriesProperties.hollowCandleStyle.borderDownColor': getShortColor(),
    'mainSeriesProperties.hollowCandleStyle.wickColor': '#737375',
    'mainSeriesProperties.hollowCandleStyle.wickUpColor': getLongColor(),
    'mainSeriesProperties.hollowCandleStyle.wickDownColor': getShortColor(),

    // Heikin Ashi styles
    'mainSeriesProperties.haStyle.upColor': getLongColor(),
    'mainSeriesProperties.haStyle.downColor': getShortColor(),
    'mainSeriesProperties.haStyle.drawWick': true,
    'mainSeriesProperties.haStyle.drawBorder': true,
    'mainSeriesProperties.haStyle.borderColor': '#378658',
    'mainSeriesProperties.haStyle.borderUpColor': getLongColor(),
    'mainSeriesProperties.haStyle.borderDownColor': getShortColor(),
    'mainSeriesProperties.haStyle.wickColor': '#737375',
    'mainSeriesProperties.haStyle.wickUpColor': getLongColor(),
    'mainSeriesProperties.haStyle.wickDownColor': getShortColor(),
    'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,

    // Bar styles
    'mainSeriesProperties.barStyle.upColor': getLongColor(),
    'mainSeriesProperties.barStyle.downColor': getShortColor(),
    'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
    'mainSeriesProperties.barStyle.dontDrawOpen': false,

    // Line styles
    'mainSeriesProperties.lineStyle.color': getBrandColor(),
    'mainSeriesProperties.lineStyle.linestyle': LINESTYLE_SOLID,
    'mainSeriesProperties.lineStyle.linewidth': 1,
    'mainSeriesProperties.lineStyle.priceSource': 'close',

    // Area styles — 顶部 rgba(114,204,41,0.4) 到底部透明的渐变填充
    'mainSeriesProperties.areaStyle.color1': 'rgba(114, 204, 41, 0.4)',
    'mainSeriesProperties.areaStyle.color2': 'rgba(114, 204, 41, 0)',
    'mainSeriesProperties.areaStyle.linecolor': getBrandColor(),
    'mainSeriesProperties.areaStyle.linestyle': LINESTYLE_SOLID,
    'mainSeriesProperties.areaStyle.linewidth': 2,
    'mainSeriesProperties.areaStyle.priceSource': 'close',
    'mainSeriesProperties.areaStyle.transparency': 0,

    // Baseline styles
    'mainSeriesProperties.baselineStyle.baselineColor': getLongColor(),
    'mainSeriesProperties.baselineStyle.topFillColor1': getLongColor(),
    'mainSeriesProperties.baselineStyle.topFillColor2': getLongColor(),
    'mainSeriesProperties.baselineStyle.bottomFillColor1': getShortColor(),
    'mainSeriesProperties.baselineStyle.bottomFillColor2': getShortColor(),
    'mainSeriesProperties.baselineStyle.topLineColor': getLongColor(),
    'mainSeriesProperties.baselineStyle.bottomLineColor': getShortColor(),
    'mainSeriesProperties.baselineStyle.topLineWidth': 3,
    'mainSeriesProperties.baselineStyle.bottomLineWidth': 3,
    'mainSeriesProperties.baselineStyle.priceSource': 'close',
    'mainSeriesProperties.baselineStyle.transparency': 50,
    'mainSeriesProperties.baselineStyle.baseLevelPercentage': 50,

    // Hi-Lo style
    'mainSeriesProperties.hiloStyle.color': getBrandColor(),
    'mainSeriesProperties.hiloStyle.showBorders': true,
    'mainSeriesProperties.hiloStyle.borderColor': getBrandColor(),
    'mainSeriesProperties.hiloStyle.showLabels': true,
    'mainSeriesProperties.hiloStyle.labelColor': getBrandColor(),
    'mainSeriesProperties.hiloStyle.fontSize': 7,

    // Columns styles
    'mainSeriesProperties.columnStyle.upColor': getLongColor(),
    'mainSeriesProperties.columnStyle.downColor': getShortColor(),

    // Other styles
    'mainSeriesProperties.renkoStyle.upColor': getLongColor(),
    'mainSeriesProperties.renkoStyle.downColor': getShortColor(),
    'mainSeriesProperties.pbStyle.upColor': getLongColor(),
    'mainSeriesProperties.pbStyle.downColor': getShortColor(),
    'mainSeriesProperties.kagiStyle.upColor': getLongColor(),
    'mainSeriesProperties.kagiStyle.downColor': getShortColor(),
    'mainSeriesProperties.pnfStyle.upColor': getLongColor(),
    'mainSeriesProperties.pnfStyle.downColor': getShortColor(),

    // 最高价最低价背景色先不改，会影响K 线的真实区间
    // 'mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible': true,
    // 'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesVisible': true,
    // 'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesColor': getBrandColor(),

    'mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible': false,
    'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesVisible': false,

    'moving average exponential.length': '9',

    'linetoolarrowmarkdown.arrowColor': getShortColor(),
    'linetoolarrowmarkup.arrowColor': getLongColor(),

    'linetoolcircle.showLabel': true,
  };
}

// 获取volume指标的颜色设置
export const getVolumeColors = () => {
  return {
    'volume.volume.color.0': getShortColor(),
    'volume.volume.color.1': getLongColor(),
    'volume.volume.transparency': 60,
    'volume.volume ma.transparency': 80,
    'volume.volume ma.linewidth': 5,
    'volume.show ma': false,
    'volume.options.showStudyArguments': false,
  };
};

export function getStudiesOverrides() {
  return {
    ...getVolumeColors(),
    'bollinger bands.upper.linewidth': 7,
  };
}
