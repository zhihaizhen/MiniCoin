import { useMemo, useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useUserInfo } from '@better-bit-fe/base-provider';
import useFiatInfo from '~/hooks/useFiatInfo';
import useSpotMarket from '~/hooks/useSpotMarket';

export interface AssetData {
  coin: string;
  balance: string | number;
  totalPnl: string | number;
  yesterdayPnl?: string | number;
}

export const useEarnValuation = (assets: AssetData[]) => {
  const { isLogin } = useUserInfo();
  const { userFiatInfo } = useFiatInfo();
  const { spotMarket } = useSpotMarket();

  const marketMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (spotMarket) {
      spotMarket.forEach((item) => {
        map[item.symbol] = String(item.lastPrice);
      });
    }
    return map;
  }, [spotMarket]);

  const getPriceInUsdt = useCallback(
    (coin: string) => {
      if (coin === 'USDT') return new BigNumber(1);
      const price = marketMap[`${coin}USDT`];
      return new BigNumber(price || 0);
    },
    [marketMap]
  );

  const valuation = useMemo(() => {
    const empty = { asset: '0', pnl: '0', yesterdayPnl: '0' };
    if (!isLogin || !userFiatInfo || !spotMarket?.length || !assets.length) {
      return {
        usdt: empty,
        btc: empty,
        fiat: { ...empty, symbol: userFiatInfo?.fiat_symbol || '' }
      };
    }

    let totalUsdt = new BigNumber(0);
    let totalPnlUsdt = new BigNumber(0);
    let totalYesterdayPnlUsdt = new BigNumber(0);

    assets.forEach((item) => {
      const price = getPriceInUsdt(item.coin);
      totalUsdt = totalUsdt.plus(new BigNumber(item.balance || 0).multipliedBy(price));
      totalPnlUsdt = totalPnlUsdt.plus(new BigNumber(item.totalPnl || 0).multipliedBy(price));
      if (item.yesterdayPnl) {
        totalYesterdayPnlUsdt = totalYesterdayPnlUsdt.plus(
          new BigNumber(item.yesterdayPnl || 0).multipliedBy(price)
        );
      }
    });

    const btcPrice = new BigNumber(marketMap['BTCUSDT'] || 1);
    const rate = new BigNumber(userFiatInfo.rate || 1);
    const decimal = userFiatInfo.display_fiat_decimal;
    const fiatSymbol = userFiatInfo.fiat_symbol;

    const format = (bn: BigNumber, dec = 8) => bn.decimalPlaces(dec, BigNumber.ROUND_DOWN).toFormat();

    return {
      usdt: {
        asset: format(totalUsdt),
        pnl: format(totalPnlUsdt),
        yesterdayPnl: format(totalYesterdayPnlUsdt)
      },
      btc: {
        asset: format(totalUsdt.dividedBy(btcPrice)),
        pnl: format(totalPnlUsdt.dividedBy(btcPrice)),
        yesterdayPnl: format(totalYesterdayPnlUsdt.dividedBy(btcPrice))
      },
      fiat: {
        asset: format(totalUsdt.multipliedBy(rate), decimal),
        pnl: format(totalPnlUsdt.multipliedBy(rate), decimal),
        yesterdayPnl: format(totalYesterdayPnlUsdt.multipliedBy(rate), decimal),
        symbol: fiatSymbol
      }
    };
  }, [assets, getPriceInUsdt, isLogin, marketMap, spotMarket?.length, userFiatInfo]);

  return { valuation, marketMap, getPriceInUsdt };
};
