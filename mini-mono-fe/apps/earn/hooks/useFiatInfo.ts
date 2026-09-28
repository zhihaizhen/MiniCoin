// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { getExchangeRate } from '~/api';
import { LOCALE_CURRENCY_MAP } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { initGlobalWidget } from '@better-bit-fe/global-widget';

interface UserFiatProp {
  base: string,
  display_fiat_decimal: number,
  fiat_full_name: string,
  fiat_symbol: string,
  rate: string,
  symbol: string
}
const useFiatInfo = () => {
  const { userInfo } = useUserInfo();
  const [userFiatInfo, setUserFiatInfo] = useState<UserFiatProp>();
  const  [currencyCode, setCurrencyCode] = useState('');

  useEffect(() => {
    const lang = localStorage.getItem('LANG_KEY') || 'en-US';
    const precode = localStorage.getItem('CURRENCY_CODE');
    setCurrencyCode(precode || LOCALE_CURRENCY_MAP[lang] || 'USD');
  }, []);

  useEffect(() => {
    let offCurrencyChange: (() => void) | undefined;
    const { componentHeader } = initGlobalWidget();
    componentHeader.then((api) => {
      if (api.onCurrencyChange) {
        offCurrencyChange = api.onCurrencyChange((newCurrency: string) => {
          setCurrencyCode(newCurrency);
        });
      }
    });
    return () => {
      offCurrencyChange?.();
    };
  }, []);

  const fetchExchangeRate = useCallback(async (code: string) => {
    const { list } = await getExchangeRate();
    const fiatInfo =
      list.filter(
        (it) =>
          it.symbol?.toUpperCase() === code?.toUpperCase()
      )?.[0] || {};
    setUserFiatInfo(fiatInfo);
  }, []);

  useEffect(() => {
    if (userInfo && currencyCode) {
      fetchExchangeRate(currencyCode);
    }
  }, [userInfo, currencyCode, fetchExchangeRate]);

  return {
    userFiatInfo,
    fetchExchangeRate
  };
};

export default useFiatInfo;
