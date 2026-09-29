import { sendReportData } from '@/services/monitor.service';
import { getSelector } from './help';
import { consoleLog } from 'common/utils/consoleLog';

// 页面加载时长&性能数据
const startReportPerformance = (obj) => {
  setTimeout(() => {
    const {
      fetchStart,
      connectStart,
      connectEnd,
      requestStart,
      responseStart,
      responseEnd,
      domComplete,
      domLoading,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart,
    } = performance.getEntriesByType('navigation')[0];
    // sendReportData({
    //   type: 'timing',
    //   connectTime: connectEnd - connectStart, // TCP连接耗时
    //   ttfbTime: responseStart - requestStart, // ttfb
    //   responseTime: responseEnd - responseStart, // Response响应耗时
    //   parseDOMTime: loadEventStart - domLoading, // DOM解析渲染耗时
    //   domContentLoadedTime:
    //     domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded事件回调耗时
    //   resourcesTime: domComplete - domContentLoadedEventEnd, // 资源加载耗时
    //   timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
    //   loadTime: loadEventStart - fetchStart, // 完整的加载时间
    // });
    // 发送性能指标
    const FP = performance.getEntriesByName('first-paint')[0];
    const FCP = performance.getEntriesByName('first-contentful-paint')[0];
    // console.log('FP', FP);
    // console.log('FCP', FCP);
    // console.log('FMP', FMP);
    // console.log('LCP', LCP);
    // sendReportData({
    //   type: 'paint',
    //   firstPaint: FP ? FP.startTime : 0,
    //   firstContentPaint: FCP ? FCP.startTime : 0,
    //   // firstMeaningfulPaint: FMP ? FMP.startTime : 0,
    //   // largestContentfulPaint: LCP ? LCP.renderTime || LCP.loadTime : 0,
    // });
  }, 3000);
};

// WS
const startReportWS = (obj) => {};

// 错误上报
const startReportError = () => {
  window.addEventListener(
    'error',
    function (event) {
      event.preventDefault(); // 阻止向上抛出控制台报错
      consoleLog('错误发生', event);
      // 有 e.target.src(href) 的认定为资源加载错误
      if (event.target && (event.target.src || event.target.href)) {
        sendReportData({
          // 资源加载错误
          type: 'error', // resource
          errorType: 'resourceError',
          filename: event.target.src || event.target.href, // 加载失败的资源
          tagName: event.target.tagName, // 标签名
          selector: getSelector(event.path || event.target), // 选择器
        });
      } else {
        sendReportData({
          type: 'error',
          errorType: 'jsError', // 包括ReferenceError，SyntaxError，RangeError， TypeError
          message: event.message, // 报错信息
          filename: event.filename, // 报错链接
          position: `${event.lineNo || 0}:${event.columnNo || 0}`, // 行列号
          stack: event.error.stack, // 错误堆栈
          selector: '', // CSS选择器
        });
      }
    },
    true,
  );
};

export { startReportError, startReportWS, startReportPerformance };
