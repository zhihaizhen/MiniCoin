import { useState, useEffect } from 'react';
import { getCountryListFilteredByIp } from '~/api';
import { getLang } from '@better-bit-fe/base-utils';

interface Country {
  code?: string;
  name?: string;
  area_code?: string;
  name_en?: string;
  name_zh_cn?: string;
  name_zh_hk?: string;
  label?: string;
  value?: string;
}

export const useCountryList = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    const lang = getLang() || 'en-US';
    try {
      const res = await getCountryListFilteredByIp({ from: 'kyc' });
      if (res && Array.isArray(res)) {
        const countryList = res
          .map((item) => {
            let label;
            if (lang === 'zh-CN') {
              label = item?.name_zh_cn;
            } else if (lang === 'zh-TW') {
              label = item?.name_zh_hk;
            } else {
              label = item?.name_en;
            }
            return {
              label: label || item?.name_en,
              value: item?.code
            };
          });
        setCountries(countryList);
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error('获取国家列表失败:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return { countries, loadingCountries, refetchCountries: fetchCountries };
};
