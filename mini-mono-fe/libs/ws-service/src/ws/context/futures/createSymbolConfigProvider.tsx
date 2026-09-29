import { createContext, useContext, useEffect } from 'react';
import { initFuturesTickersWs } from '../../publicWS';

interface ISymbolConfigListHook {
  symbolConfig: any[];
  getSymbolConfigList: () => Promise<void>;
}

// 工厂函数在模块顶层调用一次，hook引用在定义时就固定，不是运行时prop，
// 因此内部对 useSymbolConfigListHook() 的调用符合Hooks规则
export const createSymbolConfigProvider = (
  useSymbolConfigListHook: () => ISymbolConfigListHook
) => {
  const SymbolConfigContext = createContext<{ symbolConfig: any[] }>({
    symbolConfig: []
  });

  const SymbolConfigProvider = ({ children }) => {
    const { symbolConfig, getSymbolConfigList } = useSymbolConfigListHook();

    useEffect(() => {
      const getData = async () => {
        await getSymbolConfigList();
        initFuturesTickersWs();
      };
      getData();
    }, []);

    return (
      <SymbolConfigContext.Provider value={{ symbolConfig }}>
        {children}
      </SymbolConfigContext.Provider>
    );
  };

  const useSymbolConfig = () => useContext(SymbolConfigContext);

  return { SymbolConfigContext, SymbolConfigProvider, useSymbolConfig };
};
