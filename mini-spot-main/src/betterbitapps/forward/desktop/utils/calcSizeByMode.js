import { intercept } from '@unified/helpers';
import { consoleLog } from 'common/utils/consoleLog';

// 根据下单模式计算最大可开，包括下单区和加仓区
const calcMaxSizeByMode = (params) => {
  const {
    leverage,
    sizeByWallet, // 可用余额最大可开
    sizeByMaxSupport, // 风险限额或最大可开
    sizeByMaxSingle, // 单手最大可开
    isWalletCoinMode,
  
    walletCoinOrderFraction,
    lotFraction,
  } = params;

  const minValueWithCC = Math.min(
    sizeByWallet.cc,
    sizeByMaxSupport.cc,
    sizeByMaxSingle.cc,
  );
  // condition1  CC下单，如正向BTC反向USD下单
  let res = intercept(minValueWithCC, lotFraction);

  // condition2  合约价值下单 如正向USDT反向BTC下单
  if (isWalletCoinMode) {
    const minValueWithWC = Math.min(
      sizeByWallet.wc,
      sizeByMaxSupport.wc,
      sizeByMaxSingle.wc,
    );
    res = intercept(minValueWithWC, walletCoinOrderFraction);
  }

  // console.log(
  //   '计算最大可开三个值',
  //   sizeByWalletWithCC,
  //   sizeByMaxSupportWithCC,
  //   sizeByMaxSingleWithCC,
  //   '计算最大可开-结果',
  //   res,
  //   '计算最大可开coin',
  //   minValueWithCC,
  // );
  return {
    maxSize: res, // 根据当前下单模式来
    maxSizeCc: minValueWithCC, // 正向是btc，反向是usd
  };
};

export { calcMaxSizeByMode };
