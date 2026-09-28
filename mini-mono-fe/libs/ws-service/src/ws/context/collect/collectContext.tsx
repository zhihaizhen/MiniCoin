import { createContext, useContext, useEffect } from 'react';
import { useCollectList } from '../../hooks/useCollectList';

interface IContext {
  spotCollect: any[];
  futureCollect: any[];
  getCollectList: any;
}
// 创造context
const CollectContext = createContext<IContext>({
  spotCollect: [],
  futureCollect: [],
  getCollectList: () => {}
});

const CollectProvider = ({ children }) => {
  const { getCollectList, spotCollect, futureCollect } = useCollectList();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await getCollectList();
  };

  return (
    <CollectContext.Provider
      value={{
        futureCollect,
        spotCollect,
        getCollectList
      }}
    >
      {children}
    </CollectContext.Provider>
  );
};

// 创建hook
const useCollect = () => {
  return useContext(CollectContext);
};

export { CollectContext, CollectProvider, useCollect };
