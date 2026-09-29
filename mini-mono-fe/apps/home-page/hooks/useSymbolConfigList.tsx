// @ts-nocheck
import { useState } from 'react';
import { getDynamicSymbol } from '~/api';

const useSymbolConfigList = () => {
  const [symbolConfig, setSymbolConfig] = useState([]);

  const getSymbolConfigList = async () => {
    const res = await getDynamicSymbol();
    const data = res.LinearPerpetual;
    setSymbolConfig(data);
  };

  return {
    symbolConfig,
    getSymbolConfigList
  };
};

export default useSymbolConfigList;
