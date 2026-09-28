import { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  getExchangeRate,
  getSpotAssetList,
  getSpotMarket,
  getSymbolSwapConfigList
} from '~/api';
import { ISymbolAsset, ISymbolSwapConfig } from '~/interface';
import { formatThousandDigit, LOCALE_CURRENCY_MAP } from '@better-bit-fe/base-utils';

import { Option } from '~/components/CoinSelectDropDown';

import { SwapSideEnum } from '~/enums';

/**
 * 负责币种配置、资产余额及市场汇率逻辑
 * @param isLogin
 * @param setSwapSide
 */
export const useSwapData = (
  isLogin: boolean | undefined,
  setSwapSide: (side: SwapSideEnum) => void
) => {
  const [symbolSwapConfigList, setSymbolSwapConfigList] = useState<ISymbolSwapConfig[]>([]);
  const [curSymbolSwapConfig, setCurSymbolSwapConfig] = useState<ISymbolSwapConfig>();
  const [loading, setLoading] = useState(true);

  const mergeAssetsWithConfig = useCallback(
    (configList: ISymbolSwapConfig[], assets: ISymbolAsset[], userFiatInfo, spotMarketMap) => {
      const assetMap = new Map(
        assets.map((asset) => [asset.tokenId, asset.free])
      );
      const rate = new BigNumber(userFiatInfo?.rate || 1);
      const decimal = userFiatInfo?.display_fiat_decimal;
      const fiatSymbol = userFiatInfo?.fiat_symbol;
      const getPriceInUsdt = (coin: string) => {
        if (coin === 'USDT') return new BigNumber(1);
        const price = spotMarketMap[`${coin}USDT`];
        return new BigNumber(price || 0);
      };

      const calculateTokenBalance = (tokenId: string) => {
        const balance = assetMap.get(tokenId) || '0';
        const priceInUsdt = getPriceInUsdt(tokenId);
        const balanceInUsd = priceInUsdt.times(balance).toFixed();
        const balanceInFiat =
          +balance === 0 ? `${fiatSymbol}0.00` :
            `${ fiatSymbol }${ formatThousandDigit(
              priceInUsdt.times(balance).multipliedBy(rate).toFixed(),
              decimal
            )}`
          ;

        return { balance, balanceInUsd, balanceInFiat };
      };

      return configList.map((config) => {
        const baseToken = calculateTokenBalance(config.base_token);
        const quoteToken = calculateTokenBalance(config.quote_token);

        return {
          ...config,
          base_token_balance: baseToken.balance,
          base_token_balance_in_usd: baseToken.balanceInUsd,
          base_token_balance_in_fiat: baseToken.balanceInFiat,
          quote_token_balance: quoteToken.balance,
          quote_token_balance_in_usd: quoteToken.balanceInUsd,
          quote_token_balance_in_fiat: quoteToken.balanceInFiat
        };
      });
    },
    []
  );

  const findMaxBalanceConfig = useCallback(
    (configList: ISymbolSwapConfig[]) => {
      return configList.reduce((max, current) => {
        const maxBalance = new BigNumber(max.base_token_balance_in_usd || '0');
        const currentBalance = new BigNumber(current.base_token_balance_in_usd || '0');
        return currentBalance.gt(maxBalance) ? current : max;
      }, configList[0]);
    },
    []
  );

  const fetchData = useCallback(async () => {
    if (isLogin === undefined) return;
    setLoading(true);
    try {
      const symbolConfigRes = await getSymbolSwapConfigList();

      if (!isLogin) {
        setSymbolSwapConfigList(symbolConfigRes || []);
        setCurSymbolSwapConfig(
          symbolConfigRes?.length > 0 ? symbolConfigRes[0] : null
        );
        return;
      }
      const spotAssetList: ISymbolAsset[] = await getSpotAssetList();

      const { list: exchangeList } = await getExchangeRate();
      const lang = localStorage.getItem('LANG_KEY') || 'en-US';
      const precode = localStorage.getItem('CURRENCY_CODE');
      const currencyCode = precode || LOCALE_CURRENCY_MAP[lang] || 'USD';
      const fiatInfo =
        exchangeList.filter(
          (it) => it.symbol?.toUpperCase() === currencyCode?.toUpperCase()
        )?.[0] || {};

      const spotMarket = await getSpotMarket();
      const spotMarketMap: Record<string, string> = {};
      if (spotMarket) {
        spotMarket.forEach((item) => {
          spotMarketMap[item.symbol] = String(item.lastPrice);
        });
      }
      const updatedList = mergeAssetsWithConfig(
        symbolConfigRes,
        spotAssetList,
        fiatInfo,
        spotMarketMap
      );

      setSymbolSwapConfigList(updatedList);
      setCurSymbolSwapConfig((prev) => {
        if (!prev) {
          const maxItem = findMaxBalanceConfig(updatedList);
          if (new BigNumber(maxItem.quote_token_balance_in_usd ).isGreaterThan(new BigNumber(maxItem.base_token_balance_in_usd))) {
            setSwapSide(SwapSideEnum.BUY);
          }else {
            setSwapSide(SwapSideEnum.SELL);
          }
          return maxItem;
        }
        const updatedItem = updatedList.find((it) => it.symbol === prev.symbol);
        return updatedItem || findMaxBalanceConfig(updatedList);
      });
    } finally {
      setLoading(false);
    }
  }, [findMaxBalanceConfig, isLogin, mergeAssetsWithConfig, setSwapSide]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const getSymbolList = useCallback(
    (
      referenceCoin: string,
      selectedCoin: string,
      symbolSwapConfigList: ISymbolSwapConfig[],
      curSymbolSwapConfig: ISymbolSwapConfig | undefined
    ): Option[] => {
      const isBaseToken = referenceCoin === curSymbolSwapConfig?.base_token;
      const filterKey = isBaseToken ? 'base_token' : 'quote_token';
      const tokenKey = isBaseToken ? 'quote_token' : 'base_token';
      const balanceKey = isBaseToken
        ? 'quote_token_balance'
        : 'base_token_balance';

      return symbolSwapConfigList
        .filter((item) => item[filterKey] === referenceCoin)
        .map((item) => ({
          token: item[tokenKey],
          balance: item[balanceKey],
          balanceInUsd: item[`${balanceKey}_in_usd`],
          balanceInFiat: item[`${balanceKey}_in_fiat`],
          selected: item[tokenKey] === selectedCoin,
          config: item
        }))
        .sort((a, b) => new BigNumber(b.balanceInUsd || 0).minus(a.balanceInUsd || 0).toNumber());
    },
    []
  );

  return {
    symbolSwapConfigList,
    curSymbolSwapConfig,
    setCurSymbolSwapConfig,
    loading,
    fetchData,
    getSymbolList
  };
};
