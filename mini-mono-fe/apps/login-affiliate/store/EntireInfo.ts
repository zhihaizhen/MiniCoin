// 全局注入的store，每个页面都可以用
import { useCallback, useState } from 'react';

import { createContainer } from 'unstated-next';

interface GlobalInfoProps {
  id: number;
  list: string[];
}

function useGlobalInfo(initialStates: GlobalInfoProps) {
  const [id, setId] = useState<number>(initialStates.id);
  const [list, setList] = useState<string[]>(initialStates.list);

  const fetchData = useCallback(() => {
    setTimeout(() => {
      const id = Math.random() * 10 + 1;
      setId(+id.toFixed(0));
      const arr = [];
      for (let i = 0; i < id; i++) {
        arr.push(+Math.random().toFixed(1) * 100);
      }
      setList(arr);
    }, 1e3);
  }, []);

  return {
    id,
    list,
    fetchData
  };
}
export const GlobalInfo = createContainer(useGlobalInfo);

export const GlobalProvider = GlobalInfo.Provider;
