import { useState, useEffect, useMemo } from 'react';
import { getDcaConfig } from '~/api';
import { QuoteTokensStore } from '~/store/QuoteTokens';

interface CoinRatio {
  symbol: string;
  ratio: string | number;
}

export function useMinInvestAmount(open: boolean, coinList: CoinRatio[]) {
  const [dcaConfigData, setDcaConfigData] = useState<any>(null);
  const { quoteTokens } = QuoteTokensStore.useContainer();

  useEffect(() => {
    if (open) {
      getDcaConfig().then((res: any) => {
        if (res) setDcaConfigData(res);
      }).catch(() => {});
    }
  }, [open]);

  // 从 quoteTokens 构建 symbol -> minTradeAmount 映射
  // 数据结构: quoteTokens[].baseTokenSymbols[].{ baseTokenId, minTradeAmount }
  const minTradeAmountMap = useMemo(() => {
    const map: Record<string, number> = {};
    quoteTokens.forEach((qt: any) => {
      (qt.baseTokenSymbols || []).forEach((sym: any) => {
        if (sym.baseTokenId && sym.minTradeAmount != null) {
          map[sym.baseTokenId] = Number(sym.minTradeAmount) || 0;
        }
      });
    });
    return map;
  }, [quoteTokens]);

  const minInvestAmount = useMemo(() => {
    if (!dcaConfigData) return 2;

    // ① 平台全局最小投资额
    const globalMin = Number(dcaConfigData.limitMargin) || 0;

    const tokens = dcaConfigData.tokens || [];

    const requiredAmounts = coinList
      .map((coin) => {
        const ratio = (Number(coin.ratio) || 0) / 100;
        if (ratio <= 0) return 0;

        const tokenConfig = tokens.find((t: any) => t.tokenId === coin.symbol && t.tokenStatus === 'online');

        // ② 策略交易对配置的最小投资额 / 比例
        const configMin = (Number(tokenConfig?.limitMargin) || 0) / ratio;

        // ③ 交易所最小订单价值 / 比例
        const exchangeMin = (minTradeAmountMap[coin.symbol] || 0) / ratio;

        return Math.max(configMin, exchangeMin);
      })
      .filter((v) => v > 0);

    const coinMax = requiredAmounts.length > 0 ? Math.ceil(Math.max(...requiredAmounts)) : 0;

    return Math.max(globalMin, coinMax);
  }, [dcaConfigData, coinList, minTradeAmountMap]);

  return minInvestAmount;
}
