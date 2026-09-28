// @ts-nocheck
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { Select } from 'antd';
import { useRouter } from 'next/router';
import { getExchangeRate } from '~/api';
import { initGlobalWidget } from '@better-bit-fe/global-widget';
import Style from './index.module.less';
import SettingCard, { SettingRow } from '~/components/SettingCard';

interface CurrencyOption {
  label: string;
  value: string;
}

interface CurrencyProps {
  userInfo?: any;
}

const LOCALE_CURRENCY_MAP = {
  'ko-KR': 'KRW',
  'zh-CN': 'CNY',
  'en-US': 'USD',
  'zh-TW': 'USD',
  'vi-VN': 'VND'
} as const;

const DEFAULT_CURRENCY = 'USD';

const Currency: React.FC<CurrencyProps> = ({ userInfo }) => {
  const t = useFm();
  const { locale } = useRouter();
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [currencyList, setCurrencyList] = useState<CurrencyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const headerApiRef = useRef<any>(null);

  const getDefaultCurrency = useCallback((currentLocale: string): string => {
    return LOCALE_CURRENCY_MAP[currentLocale as keyof typeof LOCALE_CURRENCY_MAP] || DEFAULT_CURRENCY;
  }, []);

  const getCurrency = useCallback(() => {
    const savedCurrency = localStorage.getItem('CURRENCY_CODE');
    if (savedCurrency) {
      return savedCurrency;
    }
    return getDefaultCurrency(locale);
  }, [locale, getDefaultCurrency]);

  const handleChange = useCallback((value: string) => {
    setCurrency(value);
    if (headerApiRef.current?.setCurrency) {
      headerApiRef.current.setCurrency(value);
    } else {
      localStorage.setItem('CURRENCY_CODE', value);
    }
  }, []);

  useEffect(() => {
    const defaultCurrency = getCurrency();
    setCurrency(defaultCurrency);
  }, [getCurrency, locale]);

  useEffect(() => {
    let offCurrencyChange: (() => void) | undefined;
    const { componentHeader } = initGlobalWidget();
    componentHeader.then((api) => {
      headerApiRef.current = api;
      if (api.onCurrencyChange) {
        offCurrencyChange = api.onCurrencyChange((newCurrency: string) => {
          setCurrency(newCurrency);
        });
      }
    });
    return () => {
      offCurrencyChange?.();
    };
  }, []);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const { list } = await getExchangeRate();
        const formattedList = list.map((item) => ({
          label: item.symbol,
          value: item.symbol
        }));
        setCurrencyList(formattedList);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  return (
    <SettingCard title={t('currency', 'Currency')}>
      <div className={Style.des}>
        {t('equivalent-currency', 'Equivalent Currency')}
      </div>
      <Select
        showSearch
        value={currency}
        className={Style.select}
        onChange={handleChange}
        options={currencyList}
        loading={loading}
        key={currency}
      />
    </SettingCard>
  );
};

export default Currency;
