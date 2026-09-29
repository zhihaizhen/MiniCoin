// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { getExchangeRate } from '~/api';
import { LOCALE_CURRENCY_MAP } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { initGlobalWidget } from '@better-bit-fe/global-widget';

const useFiatInfo = (locale) => {
  const { userInfo } = useUserInfo();
  const [userFiatInfo, setUserFiatInfo] = useState({});
  const [currencyCode, setCurrencyCode] = useState('');

  useEffect(() => {
    const precode = localStorage.getItem('CURRENCY_CODE');
    const v = LOCALE_CURRENCY_MAP[locale];
    setCurrencyCode(precode || v || 'USD');
  }, [locale]);

  useEffect(() => {
    let offCurrencyChange;
    const { componentHeader } = initGlobalWidget();
    componentHeader.then((api) => {
      if (api.onCurrencyChange) {
        offCurrencyChange = api.onCurrencyChange((newCurrency) => {
          setCurrencyCode(newCurrency);
        });
      }
    });
    return () => {
      offCurrencyChange?.();
    };
  }, []);

  const fetchExchangeRate = useCallback(async (code) => {
    if (!code) return;
    const { list } = await getExchangeRate();
    const fiatInfo =
      list.filter(
        (it) => it.symbol?.toUpperCase() === code?.toUpperCase()
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
